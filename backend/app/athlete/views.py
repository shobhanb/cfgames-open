from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, status

from app.athlete.models import Athlete
from app.database.dependencies import db_dependency
from app.user.dependencies import current_superuser_dependency, current_user_dependency

from .schemas import AffiliateAthlete, AthleteDetail
from .service import (
    assign_db_athlete_to_team,
    get_affiliate_athletes_list_unassigned,
    get_db_athlete_detail,
    get_user_data,
    random_assign_db_athletes,
)

athlete_router = APIRouter(prefix="/athlete", tags=["athlete"])


@athlete_router.get("/me", status_code=status.HTTP_200_OK, response_model=AthleteDetail)
async def get_my_athlete_data(
    db_session: db_dependency,
    user: current_user_dependency,
) -> Athlete:
    return await get_user_data(db_session=db_session, competitor_id=user.athlete_id)


@athlete_router.get("/list", status_code=status.HTTP_200_OK, response_model=list[AffiliateAthlete])
async def get_athlete_list(
    db_session: db_dependency,
    affiliate_id: int | None = None,
    year: int | None = None,
) -> list[dict[str, Any]]:
    return await get_affiliate_athletes_list_unassigned(db_session=db_session, affiliate_id=affiliate_id, year=year)


@athlete_router.get("/detail", status_code=status.HTTP_200_OK, response_model=list[AthleteDetail])
async def get_athlete_detail(  # noqa: PLR0913
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    team_name: str | None = None,
    age_category: Literal["Open", "Masters", "Masters 55+"] | None = None,
    gender: Literal["F", "M"] | None = None,
) -> list[dict[str, Any]]:
    return await get_db_athlete_detail(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        team_name=team_name,
        age_category=age_category,
        gender=gender,
    )


@athlete_router.put("/team/assign", status_code=status.HTTP_202_ACCEPTED)
async def assign_athlete_to_team(
    db_session: db_dependency,
    athlete_id: UUID,
    team_name: str,
    team_role: int,
    _: current_superuser_dependency,
) -> None:
    return await assign_db_athlete_to_team(
        db_session=db_session,
        athlete_id=athlete_id,
        team_name=team_name,
        team_role=team_role,
    )


@athlete_router.get("/team/assign/random/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def random_assign_athletes(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    _: current_superuser_dependency,
) -> None:
    await random_assign_db_athletes(db_session=db_session, affiliate_id=affiliate_id, year=year)
