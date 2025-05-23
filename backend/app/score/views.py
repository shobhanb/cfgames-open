import logging
from typing import Any, Literal

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency

from .schemas import ScoreModel, TeamScoreModel
from .service import get_db_scores, get_db_team_scores_ordinal, get_db_team_scores_overall

log = logging.getLogger("uvicorn.error")

score_router = APIRouter(prefix="/score", tags=["score"])


@score_router.get(
    "/{affiliate_id}/{year}/{ordinal}",
    status_code=status.HTTP_200_OK,
    response_model=list[ScoreModel],
)
async def get_scores(  # noqa: PLR0913
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    gender: Literal["M", "F"] | None = None,
    age_category: Literal["Open", "Masters", "Masters 55+"] | None = None,
    affiliate_scaled: Literal["RX", "Scaled"] | None = None,
    top_n: int | None = None,
) -> list[dict[str, Any]]:
    return await get_db_scores(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
        ordinal=ordinal,
        gender=gender,
        age_category=age_category,
        affiliate_scaled=affiliate_scaled,
        top_n=top_n,
    )


@score_router.get(
    "/team/{affiliate_id}/{year}/{ordinal}",
    status_code=status.HTTP_200_OK,
    response_model=list[TeamScoreModel],
)
async def get_team_scores_ordinal(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    return await get_db_team_scores_ordinal(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
        ordinal=ordinal,
    )


@score_router.get(
    "/team/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[TeamScoreModel],
)
async def get_team_scores_overall(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_team_scores_overall(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
    )
