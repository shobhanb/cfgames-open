from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.cf_games.service import apply_appreciation_score, apply_total_score
from app.database.dependencies import db_dependency
from app.user.dependencies import current_superuser

from .models import AppreciationScore
from .schemas import AppreciationScoreModel
from .service import get_db_appreciation, update_db_appreciation

appreciation_score_router = APIRouter(
    prefix="/appreciation_score",
    tags=["appreciation_score"],
    dependencies=[Depends(current_superuser)],
)


@appreciation_score_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationScoreModel],
)
async def get_appreciation_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[AppreciationScore]:
    return await get_db_appreciation(db_session=db_session, affiliate_id=affiliate_id, year=year)


@appreciation_score_router.post("/{athlete_id}/{ordinal}/{score}", status_code=status.HTTP_202_ACCEPTED)
async def update_appreciation_scores(
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


@appreciation_score_router.post("/apply/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def apply_appreciation(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_appreciation_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
