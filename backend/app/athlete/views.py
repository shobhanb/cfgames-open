from fastapi import APIRouter, status

from app.athlete.schemas import AffiliateAthlete
from app.athlete.service import get_affiliate_athletes_list
from app.cf_games.constants import YEAR
from app.database.dependencies import db_dependency

athlete_router = APIRouter(prefix="/athlete", tags=["athlete"])


@athlete_router.get("/list", status_code=status.HTTP_200_OK, response_model=list[AffiliateAthlete])
async def get_athlete_list(  # noqa: ANN201
    db_session: db_dependency,
    year: int = int(YEAR),
    affiliate_id: int | None = None,
):
    return await get_affiliate_athletes_list(db_session=db_session, year=year, affiliate_id=affiliate_id)
