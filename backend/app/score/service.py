from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .models import Score

log = logging.getLogger("uvicorn.error")


async def get_db_leaderboard(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int | None,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            Athlete.name,
            Athlete.crossfit_id,
            Athlete.gender,
            Athlete.age_category,
            Athlete.team_name,
            Score.affiliate_scaled,
            Score.affiliate_rank,
            Score.score_display,
            Score.tiebreak_ms,
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year),
        )
    )
    if ordinal:
        stmt = stmt.where(Score.ordinal == ordinal)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_individual_scores(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int | None,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            Athlete.name,
            Athlete.crossfit_id,
            Athlete.gender,
            Athlete.age_category,
            Athlete.team_name,
            Score.ordinal,
            Score.participation_score,
            Score.top3_score,
            Score.attendance_score,
            Score.judge_score,
            Score.appreciation_score,
            Score.rookie_score,
            Score.total_individual_score,
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year),
        )
    )

    if ordinal:
        stmt = stmt.where(Score.ordinal == ordinal)
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_team_scores(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int | None,
) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.affiliate_id,
            Athlete.year,
            Athlete.team_name,
            Score.ordinal,
            func.sum(Score.participation_score).label("participation_score"),
            func.sum(Score.top3_score).label("top3_score"),
            func.sum(Score.attendance_score).label("attendance_score"),
            func.sum(Score.judge_score).label("judge_score"),
            func.sum(Score.appreciation_score).label("appreciation_score"),
            func.sum(Score.rookie_score).label("rookie_score"),
            func.sum(Score.side_challenge_score).label("side_challenge_score"),
            func.sum(Score.spirit_score).label("spirit_score"),
            func.sum(Score.total_team_score).label("total_team_score"),
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .group_by(
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            Athlete.team_name,
        )
        .where(
            (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year),
        )
    )
    if ordinal:
        stmt = stmt.where(Score.ordinal == ordinal)

    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_my_db_scores(db_session: AsyncSession, crossfit_id: int) -> list[dict[str, Any]]:
    stmt = (
        select(
            Athlete.affiliate_id,
            Athlete.year,
            Score.ordinal,
            Athlete.name,
            Athlete.crossfit_id,
            Athlete.gender,
            Athlete.age_category,
            Athlete.team_name,
            Score.affiliate_scaled,
            Score.affiliate_rank,
            Score.score_display,
            Score.tiebreak_ms,
            Score.participation_score,
            Score.top3_score,
            Score.attendance_score,
            Score.judge_score,
            Score.appreciation_score,
            Score.rookie_score,
            Score.total_individual_score,
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(Athlete.crossfit_id == crossfit_id)
    )

    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]
