import logging
from typing import Any

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import verified_user_dependency

from .schemas import IndividualScoreModel, LeaderboardScoreModel, TeamScoreModel, UserScoreModel
from .service import get_db_individual_scores, get_db_leaderboard, get_db_team_scores, get_my_db_scores

log = logging.getLogger("uvicorn.error")

score_router = APIRouter(prefix="/score", tags=["score"])


@score_router.get(
    "/leaderboard",
    status_code=status.HTTP_200_OK,
    response_model=list[LeaderboardScoreModel],
)
async def get_leaderboard_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_leaderboard(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
    )


@score_router.get(
    "/individual",
    status_code=status.HTTP_200_OK,
    response_model=list[IndividualScoreModel],
)
async def get_individual_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_individual_scores(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
    )


@score_router.get(
    "/team",
    status_code=status.HTTP_200_OK,
    response_model=list[TeamScoreModel],
)
async def get_team_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_team_scores(
        db_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
    )


@score_router.get("/me", status_code=status.HTTP_200_OK, response_model=list[UserScoreModel])
async def get_my_scores(
    db_session: db_dependency,
    user: verified_user_dependency,
) -> list[dict[str, Any]]:
    return await get_my_db_scores(db_session=db_session, crossfit_id=user.crossfit_id)
