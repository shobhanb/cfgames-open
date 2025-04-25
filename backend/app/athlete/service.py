from __future__ import annotations

import logging
from itertools import product
from random import choice
from typing import Any

from sqlalchemy import func, select, text, update

from app.athlete.models import Athlete
from app.cf_games.constants import IGNORE_TEAMS, TEAM_ROLE_MAP, YEAR
from app.database.dependencies import db_dependency
from app.score.models import SideScore

log = logging.getLogger("uvicorn.error")


async def get_affiliate_athletes_list(
    db_session: db_dependency,
    year: int = int(YEAR),
    affiliate_id: int | None = None,
) -> list[dict]:
    stmt = select(Athlete.affiliate_name, Athlete.affiliate_id, Athlete.name, Athlete.competitor_id).where(
        Athlete.year == year,
    )
    if affiliate_id:
        stmt = stmt.where(Athlete.affiliate_id == affiliate_id)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_athlete_teams_list(
    db_session: db_dependency,
) -> list[dict[str, Any]]:
    stmt = select(Athlete.name, Athlete.competitor_id, Athlete.team_name, Athlete.team_role).order_by(
        Athlete.team_name,
        Athlete.team_role.desc(),
        Athlete.name,
    )
    ret = await db_session.execute(stmt)
    return [dict(x) for x in ret.mappings().all()]


async def get_team_composition_dict(
    db_session: db_dependency,
) -> dict[str, list[dict[str, Any]]]:
    stmt = (
        select(
            Athlete.team_name,
            Athlete.gender,
            Athlete.age_category,
            func.count().label("count"),
        )
        .group_by(
            Athlete.team_name,
            Athlete.gender,
            Athlete.age_category,
        )
        .order_by(
            Athlete.team_name,
            Athlete.age_category,
            Athlete.gender,
        )
    )
    ret = await db_session.execute(stmt)
    team_composition = {}
    result = ret.mappings().all()
    for row in result:
        team_name = row.get("team_name")
        if team_name in team_composition:
            team_composition[team_name].append(row)
        else:
            team_composition[team_name] = [row]

    return team_composition


async def get_athlete_teams_dict(
    db_session: db_dependency,
) -> dict[str, list[str]]:
    stmt = select(
        Athlete.name,
        Athlete.team_name,
        Athlete.team_role,
        Athlete.gender,
        Athlete.age_category,
    ).order_by(
        Athlete.team_name,
        Athlete.team_role.desc(),
        Athlete.name,
    )
    ret = await db_session.execute(stmt)
    teams = {}
    result = ret.mappings().all()
    for row in result:
        team_name = row.get("team_name")
        if team_name in teams:
            teams[team_name].append(row)
        else:
            teams[team_name] = [row]

    return teams


async def assign_athlete_to_team(
    db_session: db_dependency,
    competitor_id: int,
    team_name: str,
    tl_c: str,
) -> None:
    athlete = await Athlete.find(async_session=db_session, competitor_id=competitor_id)
    if athlete:
        athlete.team_name = team_name
        athlete.team_role = TEAM_ROLE_MAP.get(tl_c, 0)
        db_session.add(athlete)
        await db_session.commit()


async def get_team_names(
    db_session: db_dependency,
) -> list[str]:
    stmt = select(Athlete.team_name).distinct().order_by(Athlete.team_name)
    ret = await db_session.execute(stmt)
    result = ret.scalars()
    return list(result)


async def rename_team(
    db_session: db_dependency,
    team_name_current: str,
    team_name_new: str,
) -> None:
    athlete_update_stmt = update(Athlete).where(Athlete.team_name == team_name_current).values(team_name=team_name_new)
    await db_session.execute(athlete_update_stmt)
    side_score_update_stmt = (
        update(SideScore).where(SideScore.team_name == team_name_current).values(team_name=team_name_new)
    )
    await db_session.execute(side_score_update_stmt)
    await db_session.commit()


async def random_assign_zz_athlete(
    db_session: db_dependency,
) -> None:
    genders = ["F", "M"]
    age_categories = ["1. Open", "2. Masters", "3. Masters 55+"]

    for age_cat, gender in product(*[age_categories, genders]):
        while True:
            # Get all assignable athletes for category
            athlete_stmt = select(Athlete).where(
                (Athlete.team_name == "zz") & (Athlete.gender == gender) & (Athlete.age_category == age_cat),
            )
            result = await db_session.execute(athlete_stmt)
            athletes = result.scalars().all()

            if len(athletes) > 0:
                # Randomly choose one athlete
                athlete = choice(athletes)  # noqa: S311

                # Pick team that should get a person next
                select_team_stmt = (
                    select(Athlete.team_name, func.count().label("count"))
                    .where(Athlete.team_name.not_in(IGNORE_TEAMS))
                    .group_by(Athlete.team_name)
                    .order_by(text("count ASC"), Athlete.team_name)
                ).limit(1)
                result = await db_session.execute(select_team_stmt)
                team = result.scalar()

                log.info("Category %s-%s: Team %s: Assigning %s", gender, age_cat, team, athlete.name)
                athlete.team_name = team
                db_session.add(athlete)
                await db_session.commit()

            else:
                break
