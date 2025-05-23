from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .models import Score

log = logging.getLogger("uvicorn.error")


async def get_db_scores(  # noqa: PLR0913
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int,
    gender: str | None = None,
    age_category: str | None = None,
    affiliate_scaled: str | None = None,
    top_n: int | None = None,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            Athlete.name,
            Athlete.gender,
            Athlete.age_category,
            Athlete.team_name,
            Score.affiliate_scaled,
            Score.affiliate_rank,
            Score.score_display,
            Score.tiebreak_ms,
            Score.participation_score,
            Score.top3_score,
            Score.judge_score,
            Score.attendance_score,
            Score.appreciation_score,
            Score.side_challenge_score,
            Score.spirit_score,
            Score.total_score,
        )
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where(
            (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year) & (Score.ordinal == ordinal),
        )
        .order_by(
            Athlete.gender,
            Athlete.age_category.asc(),
            Score.affiliate_scaled,
            Score.scaled,
            Score.score.desc(),
            Score.rank.desc(),
            Athlete.name,
        )
    )
    if gender:
        stmt = stmt.where(Athlete.gender == gender)
    if age_category:
        stmt = stmt.where(Athlete.age_category == age_category)
    if affiliate_scaled:
        stmt = stmt.where(Score.affiliate_scaled == affiliate_scaled)
    if top_n:
        stmt = stmt.where(Score.affiliate_rank <= top_n)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_team_scores_ordinal(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.team_name,
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            func.count().label("count"),
            func.sum(Score.participation_score).label("participation_score"),
            func.sum(Score.top3_score).label("top3_score"),
            func.sum(Score.attendance_score).label("attendance_score"),
            func.sum(Score.judge_score).label("judge_score"),
            func.sum(Score.appreciation_score).label("appreciation_score"),
            func.sum(Score.side_challenge_score).label("side_challenge_score"),
            func.sum(Score.spirit_score).label("spirit_score"),
            func.sum(Score.total_score).label("total_score"),
        )
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year) & (Score.ordinal == ordinal))
        .group_by(Athlete.team_name, Athlete.affiliate_id, Athlete.year, Score.ordinal)
        .order_by(Athlete.team_name)
    )

    ret = await db_session.execute(stmt)
    result = ret.mappings().all()

    return [dict(x) for x in result]


async def get_db_team_scores_overall(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.team_name,
            Athlete.affiliate_id,
            Athlete.year,
            func.count().label("count"),
            func.sum(Score.participation_score).label("participation_score"),
            func.sum(Score.top3_score).label("top3_score"),
            func.sum(Score.attendance_score).label("attendance_score"),
            func.sum(Score.judge_score).label("judge_score"),
            func.sum(Score.appreciation_score).label("appreciation_score"),
            func.sum(Score.side_challenge_score).label("side_challenge_score"),
            func.sum(Score.spirit_score).label("spirit_score"),
            func.sum(Score.total_score).label("total_score"),
        )
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
        .group_by(Athlete.team_name, Athlete.affiliate_id, Athlete.year)
        .order_by(Athlete.team_name)
    )

    ret = await db_session.execute(stmt)
    result = ret.mappings().all()

    return [dict(x) for x in result]
