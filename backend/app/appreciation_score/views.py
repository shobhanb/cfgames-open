from fastapi import APIRouter, Depends, status

from app.cf_games.service import apply_appreciation_score, apply_total_individual_score, apply_total_team_score
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import get_admin_user

from .models import AppreciationScore
from .schemas import AppreciationScoreModel
from .service import delete_db_appreciation, get_db_appreciation, update_db_appreciation

appreciation_score_router = APIRouter(
    prefix="/appreciation_score",
    tags=["appreciation_score"],
    dependencies=[Depends(get_admin_user)],
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


@appreciation_score_router.post(
    "/{affiliate_id}/{year}/{crossfit_id}/{ordinal}/{score}",
    status_code=status.HTTP_202_ACCEPTED,
)
async def update_appreciation_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    crossfit_id: int,
    ordinal: int,
    score: int,
) -> None:
    return await update_db_appreciation(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
        score=score,
    )


@appreciation_score_router.delete(
    "/{affiliate_id}/{year}/{crossfit_id}/{ordinal}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_appreciation_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    crossfit_id: int,
    ordinal: int,
) -> None:
    return await delete_db_appreciation(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
    )


@appreciation_score_router.post("/apply", status_code=status.HTTP_202_ACCEPTED)
async def apply_appreciation(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_appreciation_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_individual_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_team_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
