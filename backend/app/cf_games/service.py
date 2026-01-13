from __future__ import annotations

import asyncio
import logging
import time
from datetime import UTC, datetime
from typing import Any

from httpx import AsyncClient, HTTPError
from httpx_limiter.async_rate_limited_transport import AsyncRateLimitedTransport
from httpx_limiter.rate import Rate
from pydantic import ValidationError
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.affiliate_config.service import get_config_or_defaults
from app.athlete.models import Athlete
from app.athlete_prefs.service import init_assign_db_athlete_prefs
from app.attendance.models import Attendance
from app.individual_side_scores.models import IndividualSideScores
from app.score.models import Score
from app.sidescore.models import SideScore

from .constants import (
    CF_DIVISION_MAP,
    CF_LEADERBOARD_URL,
    HTTPX_MAX_RATE_LIMIT_PER_SECOND,
    HTTPX_TIMEOUT,
    IGNORE_TEAMS,
)
from .models import CfGamesData
from .schemas import CFEntrantInputModel, CFScoreInputModel

log = logging.getLogger("uvicorn.error")


async def cf_data_api(  # noqa: PLR0913
    httpx_client: AsyncClient,
    api_url: str,
    affiliate_code: int,
    division: int,
    entrant_list: list[dict],
    scores_list: list[list[dict]],
) -> None:
    total_pages = 1
    page = 1

    log.info(
        "Fetching CF data for affiliate %s, division %s",
        affiliate_code,
        division,
    )

    while True:
        params = {"affiliate": affiliate_code, "page": page, "per_page": 100, "view": 0, "division": division}

        try:
            response = await httpx_client.get(url=api_url, params=params)
            response.raise_for_status()

            log.info(
                "Successfully fetched page %s for affiliate %s, division %s (status: %s)",
                page,
                affiliate_code,
                division,
                response.status_code,
            )

        except HTTPError:
            log.exception(
                "HTTP error fetching CF data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise
        except Exception:
            log.exception(
                "Unexpected error fetching CF data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise

        try:
            json_response = response.json()
        except Exception:
            log.exception(
                "Error parsing JSON response for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise

        try:
            leaderboard_list = json_response.get("leaderboardRows", [])
            entrants = [x.get("entrant") for x in leaderboard_list]
            entrant_list.extend(entrants)
            scores = [x.get("scores") for x in leaderboard_list]
            scores_list.extend(scores)

            log.info(
                "Processed %s entrants from page %s for affiliate %s, division %s",
                len(entrants),
                page,
                affiliate_code,
                division,
            )

            # Handle pagination
            total_pages = json_response.get("pagination", {}).get("totalPages", 1)
            if total_pages <= page:
                log.info(
                    "Completed fetching all %s pages for affiliate %s, division %s (%s total entrants)",
                    total_pages,
                    affiliate_code,
                    division,
                    len(entrants),
                )
                break

            page += 1

        except Exception:
            log.exception(
                "Error processing response data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise


async def get_cf_data(affiliate_code: int, year: int) -> tuple[list[dict], list[list[dict]]]:
    """Get CF leaderboard data."""
    log.info("Getting CF Leaderboard data for year %s affiliate code %s", year, affiliate_code)
    entrant_list = []
    scores_list = []

    api_url = CF_LEADERBOARD_URL.replace("YYYY", str(year))
    transport = AsyncRateLimitedTransport.create(
        rate=Rate.create(magnitude=1, duration=1 / HTTPX_MAX_RATE_LIMIT_PER_SECOND),
    )

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
    return entrant_list, scores_list


async def process_cf_data(  # noqa: C901, PLR0912
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    entrant_list: list[dict] | None = None,
    scores_list: list[list[dict]] | None = None,
) -> dict[str, Any]:
    """Process CF leaderboard data into the database."""
    if entrant_list is None or scores_list is None:
        entrant_list, scores_list = await get_cf_data(affiliate_id, year)

    for entrant, scores in zip(entrant_list, scores_list, strict=True):
        try:
            entrant_model = CFEntrantInputModel.model_validate(entrant)
        except ValidationError:
            log.exception("Error validating Entrant %s", entrant)
            raise

        select_athlete_stmt = select(Athlete).where(
            (Athlete.crossfit_id == entrant_model.crossfit_id) & (Athlete.year == year),
        )
        athlete = await db_session.scalar(select_athlete_stmt)
        if athlete:
            for var, value in vars(entrant_model).items():
                setattr(athlete, var, value) if value else None
        else:
            athlete = Athlete(**entrant_model.model_dump(), year=year)
            db_session.add(athlete)
            await init_assign_db_athlete_prefs(db_session=db_session, crossfit_id=athlete.crossfit_id)

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
                    (Score.crossfit_id == athlete.crossfit_id)
                    & (Score.year == athlete.year)
                    & (Score.ordinal == score_model.ordinal),
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
                        crossfit_id=athlete.crossfit_id,
                        year=athlete.year,
                        affiliate_scaled=affiliate_scaled,
                        tiebreak_ms=tiebreak_ms,
                    )
                    db_session.add(event_score)

    await db_session.commit()

    await update_affiliate_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)

    # Update or create CFGamesData timestamp
    cf_games_data = await CfGamesData.find(async_session=db_session, affiliate_id=affiliate_id, year=year)
    if cf_games_data:
        cf_games_data.timestamp = datetime.now(UTC)
        db_session.add(cf_games_data)
    else:
        new_cf_games_data = CfGamesData(affiliate_id=affiliate_id, year=year, timestamp=datetime.now(UTC))
        db_session.add(new_cf_games_data)
    await db_session.commit()

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
    await apply_individual_side_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_side_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_individual_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_team_score(db_session=db_session, affiliate_id=affiliate_id, year=year)


async def apply_participation_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    config = await get_config_or_defaults(db_session=db_session, affiliate_id=affiliate_id, year=year)

    reset_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Athlete,
            (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_participation_stmt = (
        update(Score).where(Score.id.in_(reset_stmt.scalar_subquery())).values(participation_score=0)
    )
    await db_session.execute(remove_participation_stmt)

    select_stmt = (
        select(Score.id)
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            & (Athlete.team_name.not_in(IGNORE_TEAMS))
            & (Score.score > 0),
        )
    )
    update_stmt = (
        update(Score)
        .where(Score.id.in_(select_stmt.scalar_subquery()))
        .values(participation_score=config.participation_score)
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
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id) & (Score.score > 0),
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
    config = await get_config_or_defaults(db_session=db_session, affiliate_id=affiliate_id, year=year)

    reset_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Athlete,
            (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_top3_stmt = update(Score).where(Score.id.in_(reset_stmt.scalar_subquery())).values(top3_score=0)
    await db_session.execute(remove_top3_stmt)

    select_ranks_stmt = (
        select(
            Score.id,
            func.rank()
            .over(
                partition_by=[Score.ordinal, Athlete.gender, Athlete.age_category, Score.affiliate_scaled],
                order_by=[Score.scaled.asc(), Score.score.desc()],
            )
            .label("affiliate_rank"),
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            & (Athlete.team_name.not_in(IGNORE_TEAMS) & (Score.score > 0)),
        )
    )
    subquery = select_ranks_stmt.subquery()
    top3_stmt = select(subquery.c.id).where(subquery.c.affiliate_rank <= rank_cutoff)

    update_stmt = update(Score).where(Score.id.in_(top3_stmt.scalar_subquery())).values(top3_score=config.top3_score)
    await db_session.execute(update_stmt)
    await db_session.commit()


async def apply_attendance_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    config = await get_config_or_defaults(db_session=db_session, affiliate_id=affiliate_id, year=year)

    reset_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Athlete,
            (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_attendance_stmt = update(Score).where(Score.id.in_(reset_stmt.scalar_subquery())).values(attendance_score=0)
    await db_session.execute(remove_attendance_stmt)

    select_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Attendance,
            (Score.crossfit_id == Attendance.crossfit_id) & (Score.ordinal == Attendance.ordinal),
        )
        .where((Athlete.year == year) & (Athlete.affiliate_id == affiliate_id))
    )
    update_stmt = (
        update(Score)
        .where(Score.id.in_(select_stmt.scalar_subquery()))
        .values(attendance_score=config.attendance_score)
    )

    await db_session.execute(update_stmt)
    await db_session.commit()


async def apply_judge_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    config = await get_config_or_defaults(db_session=db_session, affiliate_id=affiliate_id, year=year)

    reset_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Athlete,
            (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_judge_stmt = update(Score).where(Score.id.in_(reset_stmt.scalar_subquery())).values(judge_score=0)
    await db_session.execute(remove_judge_stmt)

    select_judge_stmt = (
        select(Score.judge_name, Score.ordinal)
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
        .distinct()
    )
    result = await db_session.execute(select_judge_stmt)
    judges = result.mappings().all()
    for row in judges:
        select_score_stmt = (
            select(Score.id)
            .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
            .where(
                (Athlete.year == year)
                & (Athlete.affiliate_id == affiliate_id)
                & (Athlete.name == row.get("judge_name"))
                & (Score.ordinal == row.get("ordinal"))
                & (Athlete.team_name.not_in(IGNORE_TEAMS)),
            )
        )
        update_stmt = (
            update(Score)
            .where(Score.id.in_(select_score_stmt.scalar_subquery()))
            .values(judge_score=config.judge_score)
        )
        await db_session.execute(update_stmt)

    await db_session.commit()


async def apply_individual_side_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    reset_stmt = (
        select(Score.id)
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_individual_side_scores_stmt = (
        update(Score).where(Score.id.in_(reset_stmt.scalar_subquery())).values(appreciation_score=0, rookie_score=0)
    )
    await db_session.execute(remove_individual_side_scores_stmt)

    # Apply appreciation scores
    appreciation_stmt = (
        select(Score.id, IndividualSideScores.score.label("appreciation_score"))
        .join_from(
            Score,
            IndividualSideScores,
            (Score.crossfit_id == IndividualSideScores.crossfit_id) & (Score.ordinal == IndividualSideScores.ordinal),
        )
        .join_from(IndividualSideScores, Athlete, IndividualSideScores.crossfit_id == Athlete.crossfit_id)
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            & (IndividualSideScores.score_type == "appreciation"),
        )
    )

    appreciation_ret = await db_session.execute(appreciation_stmt)
    appreciation_values = appreciation_ret.mappings().all()

    if appreciation_values:
        await db_session.execute(update(Score), [dict(x) for x in appreciation_values])

    # Apply rookie scores
    rookie_stmt = (
        select(Score.id, IndividualSideScores.score.label("rookie_score"))
        .join_from(
            Score,
            IndividualSideScores,
            (Score.crossfit_id == IndividualSideScores.crossfit_id) & (Score.ordinal == IndividualSideScores.ordinal),
        )
        .join_from(IndividualSideScores, Athlete, IndividualSideScores.crossfit_id == Athlete.crossfit_id)
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            & (IndividualSideScores.score_type == "rookie"),
        )
    )

    rookie_ret = await db_session.execute(rookie_stmt)
    rookie_values = rookie_ret.mappings().all()

    if rookie_values:
        await db_session.execute(update(Score), [dict(x) for x in rookie_values])

    await db_session.commit()


async def apply_side_scores(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    reset_stmt = (
        select(Score.id)
        .join_from(
            Score,
            Athlete,
            (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.affiliate_id == affiliate_id),
        )
    )
    remove_side_scores_stmt = (
        update(Score)
        .where(Score.id.in_(reset_stmt.scalar_subquery()))
        .values(
            side_challenge_score=0,
            spirit_score=0,
        )
    )
    await db_session.execute(remove_side_scores_stmt)

    side_scores = await SideScore.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)

    for side_score in side_scores:
        select_stmt = (
            (
                select(Score)
                .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
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


async def apply_total_individual_score(
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
                + Score.rookie_score
            ).label("total_individual_score"),
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )

    results = await db_session.execute(select_stmt)
    values = results.mappings().all()
    await db_session.execute(update(Score), [dict(x) for x in values])
    await db_session.commit()


async def apply_total_team_score(
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
                + Score.rookie_score
                + Score.side_challenge_score
                + Score.spirit_score
            ).label("total_team_score"),
        )
        .join_from(Score, Athlete, (Score.crossfit_id == Athlete.crossfit_id) & (Score.year == Athlete.year))
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )

    results = await db_session.execute(select_stmt)
    values = results.mappings().all()
    await db_session.execute(update(Score), [dict(x) for x in values])
    await db_session.commit()
