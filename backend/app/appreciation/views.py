from uuid import UUID

from fastapi import APIRouter, status

from app.cf_games.service import apply_appreciation_score, apply_total_score
from app.database.dependencies import db_dependency

from .models import Appreciation
from .schemas import AppreciationModel
from .service import get_db_appreciation, update_db_appreciation

appreciation_router = APIRouter(prefix="/appreciation", tags=["appreciation"])


@appreciation_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationModel],
)
async def get_appreciation(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[Appreciation]:
    return await get_db_appreciation(db_session=db_session, affiliate_id=affiliate_id, year=year)


@appreciation_router.post("/{athlete_id}/{ordinal}/{score}", status_code=status.HTTP_202_ACCEPTED)
async def update_appreciation(
    db_session: db_dependency,
    athlete_id: UUID,
    ordinal: int,
    score: int,
) -> None:
    return await update_db_appreciation(
        db_session=db_session,
        athlete_id=athlete_id,
        ordinal=ordinal,
        score=score,
    )


@appreciation_router.post("/apply/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def apply_appreciation(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_appreciation_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
