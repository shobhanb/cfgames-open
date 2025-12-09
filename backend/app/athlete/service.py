from __future__ import annotations

import logging
from itertools import product
from random import choice
from typing import Any

from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.firebase_auth.models import FirebaseUser
from app.score.models import Score

from .models import Athlete
from .schemas import AutoTeamAssignmentOutput

log = logging.getLogger("uvicorn.error")


async def get_user_data(
    db_session: AsyncSession,
    crossfit_id: int,
) -> Athlete:
    stmt = select(Athlete).where(Athlete.crossfit_id == crossfit_id).order_by(Athlete.year.desc()).limit(1)
    ret = await db_session.execute(stmt)
    return ret.scalar_one()


async def get_affiliate_athletes_list_unassigned(
    db_session: AsyncSession,
    affiliate_id: int | None = None,
    year: int | None = None,
) -> list[dict[str, Any]]:
    user_stmt = select(FirebaseUser.crossfit_id)
    stmt = (
        select(
            Athlete.affiliate_name,
            Athlete.affiliate_id,
            Athlete.name,
            Athlete.crossfit_id,
        )
        .distinct()
        .where(Athlete.crossfit_id.not_in(user_stmt.scalar_subquery()))
    )
    if affiliate_id:
        stmt = stmt.where(Athlete.affiliate_id == affiliate_id)
    if year:
        stmt = stmt.where(Athlete.year == year)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_athlete_detail_all(  # noqa: PLR0913
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    team_name: str | None = None,
    age_category: str | None = None,
    gender: str | None = None,
) -> list[dict[str, Any]]:
    stmt = select(
        Athlete.affiliate_name,
        Athlete.affiliate_id,
        Athlete.year,
        Athlete.name,
        Athlete.crossfit_id,
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


async def get_db_athlete_detail(
    db_session: AsyncSession,
    crossfit_id: int,
    year: int,
) -> dict[str, Any]:
    stmt = select(
        Athlete.affiliate_name,
        Athlete.affiliate_id,
        Athlete.year,
        Athlete.name,
        Athlete.crossfit_id,
        Athlete.team_name,
        Athlete.team_role,
        Athlete.age_category,
        Athlete.gender,
    ).where((Athlete.crossfit_id == crossfit_id) & (Athlete.year == year))
    ret = await db_session.execute(stmt)
    results = ret.mappings().one()
    return dict(results)


async def assign_db_athlete_to_team(
    db_session: AsyncSession,
    crossfit_id: int,
    year: int,
    team_name: str,
    team_role: int,
) -> dict[str, Any]:
    athlete = await Athlete.find_or_raise(async_session=db_session, crossfit_id=crossfit_id, year=year)
    athlete.team_name = team_name
    athlete.team_role = team_role
    db_session.add(athlete)
    await db_session.commit()
    return await get_db_athlete_detail(db_session=db_session, crossfit_id=crossfit_id, year=year)


async def random_assign_db_athletes(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    assign_from_team_name: str,
    assign_to_team_names: list[str],
) -> list[AutoTeamAssignmentOutput]:
    genders = ["F", "M"]
    age_categories = ["Masters 55+", "Masters", "Open"]

    assignments = []

    for age_cat, gender in product(*[age_categories, genders]):
        while True:
            # Get all assignable athletes for category
            athlete_stmt = select(Athlete).where(
                (Athlete.affiliate_id == affiliate_id)
                & (Athlete.year == year)
                & (Athlete.team_name == assign_from_team_name)
                & (Athlete.gender == gender)
                & (Athlete.age_category == age_cat),
            )
            # Check judges. This needs previous years data to be included
            judge_stmt = select(Score.judge_user_id).distinct()

            athlete_judge_stmt = athlete_stmt.where(Athlete.crossfit_id.in_(judge_stmt.scalar_subquery()))

            judge_result = await db_session.execute(athlete_judge_stmt)
            judges = judge_result.scalars().all()

            athlete_result = await db_session.execute(athlete_stmt)
            athletes = athlete_result.scalars().all()

            async def get_next_team(db_session: AsyncSession) -> str:
                # Pick team that should get a person next
                select_team_stmt = (
                    select(Athlete.team_name, func.count().label("count"))
                    .where(Athlete.team_name.in_(assign_to_team_names))
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
                assignments.append(AutoTeamAssignmentOutput(name=athlete.name, team_name=team))
                db_session.add(athlete)
                await db_session.commit()

            elif len(athletes) > 0:
                # Randomly choose one athlete
                athlete = choice(athletes)  # noqa: S311

                team = await get_next_team(db_session=db_session)
                log.info("Category %s-%s: Team %s: Assigning %s", gender, age_cat, team, athlete.name)
                athlete.team_name = team
                assignments.append(AutoTeamAssignmentOutput(name=athlete.name, team_name=team))
                db_session.add(athlete)
                await db_session.commit()

            else:
                break

    return assignments


async def get_db_team_names(db_session: AsyncSession, affiliate_id: int, year: int) -> list[dict[str, Any]]:
    stmt = select(Athlete.team_name).where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year)).distinct()
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def rename_db_team_names(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    old_team_name: str,
    new_team_name: str,
) -> list[dict[str, Any]]:
    stmt = (
        update(Athlete)
        .where(
            (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year) & (Athlete.team_name == old_team_name),
        )
        .values(team_name=new_team_name)
    )
    await db_session.execute(stmt)

    await db_session.commit()

    return await get_db_team_names(db_session=db_session, affiliate_id=affiliate_id, year=year)


async def get_db_counts_summary(
    db_session: AsyncSession,
    affiliate_id: int,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            func.count().label("athlete_count"),
            Athlete.affiliate_id,
            Athlete.affiliate_name,
            Athlete.year,
        )
        .where(Athlete.affiliate_id == affiliate_id)
        .group_by(
            Athlete.affiliate_id,
            Athlete.affiliate_name,
            Athlete.year,
        )
        .order_by(Athlete.year.desc())
    )
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]
