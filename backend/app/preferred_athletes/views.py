# ruff: noqa: I001
from typing import Any

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency
from app.apikey_auth.dependencies import api_key_admin_dependency

from .schemas import PreferredAthleteCreate
from .schemas import PreferredAthleteModel
from .schemas import PreferredAthletesInitResponse
from .schemas import PreferredAthleteUpdate
from .service import create_preferred_athlete
from .service import delete_preferred_athlete
from .service import get_all_preferred_athletes
from .service import get_preferred_athlete
from .service import initialize_preferred_athletes_from_judges
from .service import update_preferred_athlete

preferred_athletes_router = APIRouter(prefix="/preferred_athletes", tags=["preferred_athletes"])


@preferred_athletes_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[PreferredAthleteModel],
)
async def list_preferred_athletes(
    db_session: db_dependency,
    _: admin_user_dependency,
) -> list[dict[str, Any]]:
    return await get_all_preferred_athletes(db_session=db_session)


@preferred_athletes_router.get(
    "/{crossfit_id}",
    status_code=status.HTTP_200_OK,
    response_model=PreferredAthleteModel,
)
async def get_preferred_athlete_by_id(
    db_session: db_dependency,
    _: admin_user_dependency,
    crossfit_id: int,
) -> dict[str, Any]:
    return await get_preferred_athlete(db_session=db_session, crossfit_id=crossfit_id)


@preferred_athletes_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=PreferredAthleteModel,
)
async def create_preferred_athlete_entry(
    db_session: db_dependency,
    _: admin_user_dependency,
    data: PreferredAthleteCreate,
) -> dict[str, Any]:
    return await create_preferred_athlete(db_session=db_session, data=data)


@preferred_athletes_router.post(
    "/initialize",
    status_code=status.HTTP_200_OK,
    response_model=PreferredAthletesInitResponse,
)
async def initialize_preferred_athletes(
    db_session: db_dependency,
    _: api_key_admin_dependency,
) -> dict[str, int]:
    return await initialize_preferred_athletes_from_judges(db_session=db_session)


@preferred_athletes_router.patch(
    "/{crossfit_id}",
    status_code=status.HTTP_200_OK,
    response_model=PreferredAthleteModel,
)
async def update_preferred_athlete_entry(
    db_session: db_dependency,
    _: admin_user_dependency,
    crossfit_id: int,
    data: PreferredAthleteUpdate,
) -> dict[str, Any]:
    return await update_preferred_athlete(db_session=db_session, crossfit_id=crossfit_id, data=data)


@preferred_athletes_router.delete(
    "/{crossfit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_preferred_athlete_entry(
    db_session: db_dependency,
    _: admin_user_dependency,
    crossfit_id: int,
) -> None:
    await delete_preferred_athlete(db_session=db_session, crossfit_id=crossfit_id)
