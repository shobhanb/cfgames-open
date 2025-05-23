from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from httpx import AsyncClient, HTTPError
from httpx_limiter.async_rate_limited_transport import AsyncRateLimitedTransport
from httpx_limiter.rate import Rate
from pydantic import ValidationError
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.appreciation.models import Appreciation
from app.athlete.models import Athlete
from app.athlete_prefs.service import assign_db_athlete_prefs
from app.attendance.models import Attendance
from app.score.models import Score
from app.sidescore.models import SideScore

from .constants import (
    ATTENDANCE_SCORE,
    CF_DIVISION_MAP,
    CF_LEADERBOARD_URL,
    HTTPX_MAX_RATE_LIMIT_PER_SECOND,
    HTTPX_TIMEOUT,
    JUDGE_SCORE,
    PARTICIPATION_SCORE,
    TOP3_SCORE,
)
from .schemas import CFEntrantInputModel, CFScoreInputModel

log = logging.getLogger("uvicorn.error")


async def cf_data_api(  # noqa: PLR0913
    httpx_client: AsyncClient,
    api_url: str,
    affiliate_code: int,
    division: int,
    entrant_list: list[dict],
    scores_list: list[dict],
) -> None:
    total_pages = 1
    page = 1
    while True:
        params = {"affiliate": affiliate_code, "page": page, "per_page": 100, "view": 0, "division": division}
        response = await httpx_client.get(url=api_url, params=params)

        json_response = response.json()
        leaderboard_list = json_response.get("leaderboardRows", [])
        entrants = [x.get("entrant") for x in leaderboard_list]
        entrant_list.extend(entrants)
        scores = [x.get("scores") for x in leaderboard_list]
        scores_list.extend(scores)

        # Handle pagination
        total_pages = json_response.get("pagination", {}).get("totalPages", 1)
        if total_pages <= page:
            break

        page += 1


async def get_cf_data(affiliate_code: int, year: int) -> tuple[int, list[dict], list[dict]]:
    """Get CF leaderboard data."""
    log.info("Getting CF Leaderboard data for year %s affiliate code %s", year, affiliate_code)
    entrant_list = []
    scores_list = []

    api_url = CF_LEADERBOARD_URL.replace("YYYY", str(year))
    transport = AsyncRateLimitedTransport.create(rate=Rate.create(magnitude=HTTPX_MAX_RATE_LIMIT_PER_SECOND))

    start_time = time.time()
    try:
        async with AsyncClient(transport=transport, timeout=HTTPX_TIMEOUT) as aclient:
            await asyncio.gather(
                *[
                    cf_data_api(
                        httpx_client=aclient,
                        api_url=api_url,
                        affiliate_code=affiliate_code,
                        division=int(x),
                        entrant_list=entrant_list,
                        scores_list=scores_list,
                    )
                    for x in CF_DIVISION_MAP
                ],
            )

    except HTTPError:
        log.warning("HTTP Exception while getting CF data")
        raise

    end_time = time.time()

    log.info("Downloaded %s entrants, %s scores", len(entrant_list), len(scores_list))
    log.info("Time taken: %s", (end_time - start_time))
    return year, entrant_list, scores_list


async def process_cf_data(  # noqa: C901, PLR0912
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> dict[str, Any]:
    year, entrant_list, scores_list = await get_cf_data(affiliate_id, year)

    for entrant, scores in zip(entrant_list, scores_list, strict=True):
        try:
            entrant_model = CFEntrantInputModel.model_validate(entrant)
        except ValidationError:
            log.exception("Error validating Entrant %s", entrant)
            raise

        select_athlete_stmt = select(Athlete).where(
            (Athlete.year == year) & (Athlete.competitor_id == entrant_model.competitor_id),
        )
        athlete = await db_session.scalar(select_athlete_stmt)
        if athlete:
            for var, value in vars(entrant_model).items():
                setattr(athlete, var, value) if value else None
        else:
            athlete = Athlete(**entrant_model.model_dump(), year=year)
            db_session.add(athlete)
            await db_session.flush()
            athlete = await Athlete.find_or_raise(
                async_session=db_session,
                year=year,
                competitor_id=entrant_model.competitor_id,
            )
            await assign_db_athlete_prefs(db_session=db_session, athlete_id=athlete.id)

        if scores:
            for score in scores:
                try:
                    score_model = CFScoreInputModel.model_validate(score)
                except ValidationError:
                    log.exception("Error validating Entrant %s score %s", entrant, score)
                    raise

                affiliate_scaled = "RX" if score_model.scaled == 0 else "Scaled"

                tiebreak_ms = None
                if score_model.breakdown:
                    tiebreak_index = score_model.breakdown.rfind("Tiebreak: ")
                    if tiebreak_index > 0:
                        tiebreak_ms = score_model.breakdown[tiebreak_index + 10 :]

                select_score_stmt = select(Score).where(
                    (Score.athlete_id == athlete.id) & (Score.ordinal == score_model.ordinal),
                )
                event_score = await db_session.scalar(select_score_stmt)
                if event_score:
                    for var, value in vars(score_model).items():
                        setattr(event_score, var, value) if value else None
                    event_score.affiliate_scaled = affiliate_scaled
                    event_score.tiebreak_ms = tiebreak_ms
                else:
                    event_score = Score(
                        **score_model.model_dump(),
                        athlete_id=athlete.id,
                        affiliate_scaled=affiliate_scaled,
                        tiebreak_ms=tiebreak_ms,
                    )
                    db_session.add(event_score)

    await db_session.commit()

    await update_affiliate_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)

    return {
        "affiliate_id": affiliate_id,
        "year": year,
        "entrant_count": len(entrant_list),
        "score_count": len(scores_list),
    }


async def update_affiliate_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_participation_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_ranks(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_top3_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_judge_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_score(db_session=db_session, affiliate_id=affiliate_id, year=year)


async def apply_participation_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    select_stmt = (
        select(Score.id)
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            # & (Athlete.team_name.not_in(IGNORE_TEAMS))
            & (Score.score > 0),
        )
    )
    update_stmt = (
        update(Score).where(Score.id.in_(select_stmt.scalar_subquery())).values(participation_score=PARTICIPATION_SCORE)
    )
    await db_session.execute(update_stmt)
    await db_session.commit()


async def apply_ranks(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    select_stmt = (
        select(
            Score.id,
            func.rank()
            .over(
                partition_by=[Score.ordinal, Athlete.gender, Athlete.age_category, Score.affiliate_scaled],
                order_by=[Score.scaled.asc(), Score.score.desc()],
            )
            .label("affiliate_rank"),
        )
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            # & (Athlete.team_name.not_in(IGNORE_TEAMS))
            & (Score.score > 0),
        )
    )
    ranks = await db_session.execute(select_stmt)
    values = ranks.mappings().all()
    await db_session.execute(update(Score), [dict(x) for x in values])
    await db_session.commit()


async def apply_top3_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    rank_cutoff: int = 3,
) -> None:
    select_stmt = (
        select(Score.id)
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            # & (Athlete.team_name.not_in(IGNORE_TEAMS))
            & (Score.affiliate_rank <= rank_cutoff),
        )
    )
    update_stmt = update(Score).where(Score.id.in_(select_stmt.scalar_subquery())).values(top3_score=TOP3_SCORE)
    await db_session.execute(update_stmt)
    await db_session.commit()


async def apply_attendance_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    select_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Attendance,
            (Score.athlete_id == Attendance.athlete_id) & (Score.ordinal == Attendance.ordinal),
        )
        .where((Athlete.year == year) & (Athlete.affiliate_id == affiliate_id))
    )
    update_stmt = (
        update(Score).where(Score.id.in_(select_stmt.scalar_subquery())).values(attendance_score=ATTENDANCE_SCORE)
    )

    await db_session.execute(update_stmt)
    await db_session.commit()


async def apply_judge_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    select_judge_stmt = (
        select(Score.judge_name, Score.ordinal)
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where((Athlete.year == year) & (Athlete.affiliate_id == affiliate_id))
        .distinct()
    )
    result = await db_session.execute(select_judge_stmt)
    judges = result.mappings().all()
    for row in judges:
        select_score_stmt = (
            select(Score.id)
            .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
            .where(
                (Athlete.year == year)
                & (Athlete.affiliate_id == affiliate_id)
                & (Athlete.name == row.get("judge_name"))
                & (Score.ordinal == row.get("ordinal")),
            )
        )
        update_stmt = (
            update(Score).where(Score.id.in_(select_score_stmt.scalar_subquery())).values(judge_score=JUDGE_SCORE)
        )
        await db_session.execute(update_stmt)

    await db_session.commit()


async def apply_appreciation_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    all_scores_stmt = (
        select(Score.id)
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_appreciation_stmt = (
        update(Score).where(Score.id.in_(all_scores_stmt.scalar_subquery())).values(appreciation_score=0)
    )
    await db_session.execute(remove_appreciation_stmt)

    appreciation_scores_stmt = (
        select(Score.id, Appreciation.score)
        .join_from(
            Score,
            Appreciation,
            (Score.athlete_id == Appreciation.athlete_id) & (Score.ordinal == Appreciation.ordinal),
        )
        .join_from(Appreciation, Athlete, Appreciation.athlete_id == Athlete.id)
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id) & (Score.ordinal == Appreciation.ordinal),
        )
    )

    ret = await db_session.execute(appreciation_scores_stmt)
    update_values = ret.mappings().all()

    await db_session.execute(update(Score).values([dict(x) for x in update_values]))


async def apply_side_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    side_scores = await SideScore.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)

    for side_score in side_scores:
        select_stmt = (
            (
                select(Score)
                .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
                .where((Score.ordinal == side_score.ordinal) & (Athlete.team_name == side_score.team_name))
            )
            .order_by(Athlete.team_role.desc())
            .limit(1)
        )
        result = await db_session.execute(select_stmt)
        score = result.scalar_one_or_none()

        if score:
            if side_score.score_type == "side_challenge":
                score.side_challenge_score = side_score.score
                db_session.add(score)
                await db_session.commit()
            elif side_score.score_type == "spirit":
                score.spirit_score = side_score.score
                db_session.add(score)
                await db_session.commit()


async def apply_total_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    select_stmt = (
        select(
            Score.id,
            (
                Score.participation_score
                + Score.top3_score
                + Score.judge_score
                + Score.attendance_score
                + Score.appreciation_score
                + Score.side_challenge_score
                + Score.spirit_score
            ).label("total_score"),
        )
        .join_from(Score, Athlete, Score.athlete_id == Athlete.id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )

    results = await db_session.execute(select_stmt)
    values = results.mappings().all()
    await db_session.execute(update(Score), [dict(x) for x in values])
    await db_session.commit()
