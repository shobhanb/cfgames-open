from __future__ import annotations

import logging
from itertools import product
from random import choice
from typing import Any
from uuid import UUID

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.cf_games.constants import DEFAULT_TEAM_NAME, IGNORE_TEAMS
from app.score.models import Score
from app.user.models import User

from .models import Athlete

log = logging.getLogger("uvicorn.error")


async def get_user_data(
    db_session: AsyncSession,
    competitor_id: int,
) -> Athlete:
    stmt = select(Athlete).where(Athlete.competitor_id == competitor_id).order_by(Athlete.year.desc()).limit(1)
    ret = await db_session.execute(stmt)
    return ret.scalar_one()


async def get_affiliate_athletes_list_unassigned(
    db_session: AsyncSession,
    affiliate_id: int | None = None,
    year: int | None = None,
) -> list[dict[str, Any]]:
    user_stmt = select(User.athlete_id)
    stmt = (
        select(
            Athlete.affiliate_name,
            Athlete.affiliate_id,
            Athlete.name,
            Athlete.competitor_id,
        )
        .distinct()
        .where(Athlete.competitor_id.not_in(user_stmt.scalar_subquery()))
    )
    if affiliate_id:
        stmt = stmt.where(Athlete.affiliate_id == affiliate_id)
    if year:
        stmt = stmt.where(Athlete.year == year)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_athlete_detail(  # noqa: PLR0913
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    team_name: str | None = None,
    age_category: str | None = None,
    gender: str | None = None,
) -> list[dict[str, Any]]:
    stmt = select(
        Athlete.id,
        Athlete.affiliate_name,
        Athlete.affiliate_id,
        Athlete.year,
        Athlete.name,
        Athlete.competitor_id,
        Athlete.team_name,
        Athlete.team_role,
        Athlete.age_category,
        Athlete.gender,
    ).where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    if team_name:
        stmt = stmt.where(Athlete.team_name == team_name)
    if age_category:
        stmt = stmt.where(Athlete.age_category == age_category)
    if gender:
        stmt = stmt.where(Athlete.gender == gender)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def assign_db_athlete_to_team(
    db_session: AsyncSession,
    athlete_id: UUID,
    team_name: str,
    team_role: int,
) -> None:
    athlete = await Athlete.find_or_raise(async_session=db_session, id=athlete_id)
    athlete.team_name = team_name
    athlete.team_role = team_role
    db_session.add(athlete)
    await db_session.commit()


async def random_assign_db_athletes(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    genders = ["F", "M"]
    age_categories = ["Masters 55+", "Masters", "Open"]

    for age_cat, gender in product(*[age_categories, genders]):
        while True:
            # Get all assignable athletes for category
            athlete_stmt = select(Athlete).where(
                (Athlete.affiliate_id == affiliate_id)
                & (Athlete.year == year)
                & (Athlete.team_name == DEFAULT_TEAM_NAME)
                & (Athlete.gender == gender)
                & (Athlete.age_category == age_cat),
            )
            # Check judges. This needs previous years data to be included
            judge_stmt = select(Score.judge_user_id).distinct()

            athlete_judge_stmt = athlete_stmt.where(Athlete.competitor_id.in_(judge_stmt.scalar_subquery()))
            athlete_non_judge_stmt = athlete_stmt.where(Athlete.competitor_id.not_in(judge_stmt.scalar_subquery()))

            judge_result = await db_session.execute(athlete_judge_stmt)
            judges = judge_result.scalars().all()

            athlete_result = await db_session.execute(athlete_non_judge_stmt)
            non_judge_athletes = athlete_result.scalars().all()

            async def get_next_team(db_session: AsyncSession) -> str:
                # Pick team that should get a person next
                select_team_stmt = (
                    select(Athlete.team_name, func.count().label("count"))
                    .where(Athlete.team_name.not_in(IGNORE_TEAMS))
                    .group_by(Athlete.team_name)
                    .order_by(text("count ASC"), Athlete.team_name)
                ).limit(1)
                result = await db_session.execute(select_team_stmt)
                return result.scalar_one()

            if len(judges) > 0:
                # Randomly choose one judge
                athlete = choice(judges)  # noqa: S311

                team = await get_next_team(db_session=db_session)
                log.info("Category %s-%s: Team %s: Assigning judge %s", gender, age_cat, team, athlete.name)
                athlete.team_name = team
                db_session.add(athlete)
                await db_session.commit()

            elif len(non_judge_athletes) > 0:
                # Randomly choose one athlete
                athlete = choice(non_judge_athletes)  # noqa: S311

                team = await get_next_team(db_session=db_session)
                log.info("Category %s-%s: Team %s: Assigning %s", gender, age_cat, team, athlete.name)
                athlete.team_name = team
                db_session.add(athlete)
                await db_session.commit()

            else:
                break
