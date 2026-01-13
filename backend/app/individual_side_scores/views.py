from fastapi import APIRouter, Depends, status

from app.cf_games.service import apply_individual_side_scores, apply_total_individual_score, apply_total_team_score
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import get_admin_user

from .models import IndividualSideScores
from .schemas import IndividualSideScoreModel
from .service import delete_db_individual_side_score, get_db_individual_side_score, update_db_individual_side_score

individual_side_score_router = APIRouter(
    prefix="/individual_side_score",
    tags=["individual_side_score"],
    dependencies=[Depends(get_admin_user)],
)


@individual_side_score_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[IndividualSideScoreModel],
)
async def get_individual_side_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[IndividualSideScores]:
    return await get_db_individual_side_score(db_session=db_session, affiliate_id=affiliate_id, year=year)


@individual_side_score_router.post(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
)
async def update_individual_side_scores(
    db_session: db_dependency,
    input_data: IndividualSideScoreModel,
) -> None:
    return await update_db_individual_side_score(
        db_session=db_session,
        input_data=input_data,
    )


@individual_side_score_router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_individual_side_scores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    crossfit_id: int,
    ordinal: int,
) -> None:
    return await delete_db_individual_side_score(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
    )


@individual_side_score_router.post("/apply", status_code=status.HTTP_202_ACCEPTED)
async def apply_individual_side_scores_endpoint(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_individual_side_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_individual_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_team_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
