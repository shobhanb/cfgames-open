from typing import Literal

from fastapi import APIRouter, status

from app.cf_games.service import apply_side_scores, apply_total_score
from app.database.dependencies import db_dependency
from app.sidescore.models import SideScore

from .schemas import SideScoreModel
from .service import get_db_sidescores, update_db_sidescores

sidescore_router = APIRouter(prefix="/sidescore", tags=["sidescore"])


@sidescore_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[SideScoreModel],
)
async def get_sidescores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[SideScore]:
    return await get_db_sidescores(db_session=db_session, year=year, affiliate_id=affiliate_id)


@sidescore_router.post("/{affiliate_id}/{year}/", status_code=status.HTTP_202_ACCEPTED, response_model=SideScoreModel)
async def update_sidescores(  # noqa: PLR0913
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    score_type: Literal["side_challenge", "spirit"],
    team_name: str,
    score: int,
) -> SideScore:
    return await update_db_sidescores(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        score_type=score_type,
        team_name=team_name,
        ordinal=ordinal,
        score=score,
    )


@sidescore_router.post("/apply/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def apply_sidescores(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_side_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
