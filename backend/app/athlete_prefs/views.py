from typing import Any

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency

from .schemas import AthletePrefsModel
from .service import get_db_athlete_prefs

athlete_prefs_router = APIRouter(prefix="/athlete-prefs", tags=["athlete-prefs"])


@athlete_prefs_router.get("/", status_code=status.HTTP_200_OK, response_model=list[AthletePrefsModel])
async def get_athlete_prefs(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_athlete_prefs(db_session=db_session, affiliate_id=affiliate_id, year=year)
