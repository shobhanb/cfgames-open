from typing import Any, Literal

from fastapi import APIRouter, status

from app.athlete.models import Athlete
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .schemas import AffiliateAthlete, AthleteDetail, TeamName
from .service import (
    assign_db_athlete_to_team,
    get_affiliate_athletes_list_unassigned,
    get_db_athlete_detail,
    get_db_athlete_detail_all,
    get_db_team_names,
    get_user_data,
    random_assign_db_athletes,
    rename_db_team_names,
)

athlete_router = APIRouter(prefix="/athlete", tags=["athlete"])


@athlete_router.get("/me", status_code=status.HTTP_200_OK, response_model=AthleteDetail)
async def get_my_athlete_data(
    db_session: db_dependency,
    user: verified_user_dependency,
) -> Athlete:
    return await get_user_data(db_session=db_session, crossfit_id=user.crossfit_id)


@athlete_router.get("/list", status_code=status.HTTP_200_OK, response_model=list[AffiliateAthlete])
async def get_athlete_list(
    db_session: db_dependency,
    affiliate_id: int | None = None,
    year: int | None = None,
) -> list[dict[str, Any]]:
    return await get_affiliate_athletes_list_unassigned(db_session=db_session, affiliate_id=affiliate_id, year=year)


@athlete_router.get("/detail/all", status_code=status.HTTP_200_OK, response_model=list[AthleteDetail])
async def get_athlete_detail_all(  # noqa: PLR0913
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    team_name: str | None = None,
    age_category: Literal["Open", "Masters", "Masters 55+"] | None = None,
    gender: Literal["F", "M"] | None = None,
) -> list[dict[str, Any]]:
    return await get_db_athlete_detail_all(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        team_name=team_name,
        age_category=age_category,
        gender=gender,
    )


@athlete_router.get("/detail", status_code=status.HTTP_200_OK, response_model=AthleteDetail)
async def get_athlete_detail(
    db_session: db_dependency,
    crossfit_id: int,
    year: int,
) -> dict[str, Any]:
    return await get_db_athlete_detail(
        db_session=db_session,
        crossfit_id=crossfit_id,
        year=year,
    )


@athlete_router.put("/team/assign", status_code=status.HTTP_202_ACCEPTED, response_model=AthleteDetail)
async def assign_athlete_to_team(
    db_session: db_dependency,
    crossfit_id: int,
    year: int,
    team_name: str,
    team_role: int,
    _: admin_user_dependency,
) -> dict[str, Any]:
    return await assign_db_athlete_to_team(
        db_session=db_session,
        crossfit_id=crossfit_id,
        year=year,
        team_name=team_name,
        team_role=team_role,
    )


@athlete_router.get("/team/assign/random/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def random_assign_athletes(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    _: admin_user_dependency,
) -> None:
    await random_assign_db_athletes(db_session=db_session, affiliate_id=affiliate_id, year=year)


@athlete_router.get("/team_names", status_code=status.HTTP_200_OK, response_model=list[TeamName])
async def get_team_names(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_team_names(db_session=db_session, affiliate_id=affiliate_id, year=year)


@athlete_router.put("/rename_teams", status_code=status.HTTP_202_ACCEPTED, response_model=list[TeamName])
async def rename_teams(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    old_team_name: str,
    new_team_name: str,
) -> list[dict[str, Any]]:
    return await rename_db_team_names(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        old_team_name=old_team_name,
        new_team_name=new_team_name,
    )
