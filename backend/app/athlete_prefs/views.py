from collections.abc import Sequence
from typing import Any

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .models import AthleteTimePref
from .schemas import AthletePrefsModel, AthletePrefsOutputModel
from .service import get_db_athlete_prefs, update_db_user_prefs

athlete_prefs_router = APIRouter(prefix="/athlete-prefs", tags=["athlete-prefs"])


@athlete_prefs_router.get("/me", status_code=status.HTTP_200_OK, response_model=list[AthletePrefsModel])
async def get_my_prefs(
    db_session: db_dependency,
    user: verified_user_dependency,
) -> Sequence[AthleteTimePref]:
    return await AthleteTimePref.find_all(async_session=db_session, crossfit_id=user.crossfit_id)


@athlete_prefs_router.post("/me", status_code=status.HTTP_202_ACCEPTED)
async def update_my_prefs(
    db_session: db_dependency,
    user: verified_user_dependency,
    prefs: list[AthletePrefsModel],
) -> None:
    await update_db_user_prefs(db_session=db_session, crossfit_id=user.crossfit_id, prefs=prefs)


@athlete_prefs_router.get("/all", status_code=status.HTTP_200_OK, response_model=list[AthletePrefsOutputModel])
async def get_all_athlete_prefs(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    _: admin_user_dependency,
) -> list[dict[str, Any]]:
    return await get_db_athlete_prefs(db_session=db_session, affiliate_id=affiliate_id, year=year)


@athlete_prefs_router.get(
    "/{crossfit_id}",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=list[AthletePrefsModel],
)
async def get_athlete_prefs(
    db_session: db_dependency,
    _: admin_user_dependency,
    crossfit_id: int,
) -> Sequence[AthleteTimePref]:
    return await AthleteTimePref.find_all(async_session=db_session, crossfit_id=crossfit_id)


@athlete_prefs_router.post("/{crossfit_id}", status_code=status.HTTP_202_ACCEPTED)
async def update_athlete_prefs(
    db_session: db_dependency,
    _: admin_user_dependency,
    crossfit_id: int,
    prefs: list[AthletePrefsModel],
) -> None:
    await update_db_user_prefs(db_session=db_session, crossfit_id=crossfit_id, prefs=prefs)
