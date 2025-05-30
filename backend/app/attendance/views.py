from typing import Any

from fastapi import APIRouter, Depends, status

from app.cf_games.service import apply_attendance_scores, apply_total_score
from app.database.dependencies import db_dependency
from app.user.dependencies import current_superuser

from .schemas import AttendanceModel
from .service import get_db_attendance, update_db_attendance

attendance_router = APIRouter(prefix="/attendance", tags=["attendance"], dependencies=[Depends(current_superuser)])


@attendance_router.get(
    "/{affiliate_id}/{year}/{ordinal}/",
    status_code=status.HTTP_200_OK,
    response_model=list[AttendanceModel],
)
async def get_attendance(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    return await get_db_attendance(db_session=db_session, year=year, affiliate_id=affiliate_id, ordinal=ordinal)


@attendance_router.post("/{affiliate_id}/{year}/", status_code=status.HTTP_202_ACCEPTED)
async def update_attendance(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    competitor_id: int,
    ordinal: int,
) -> None:
    return await update_db_attendance(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        competitor_id=competitor_id,
        ordinal=ordinal,
    )


@attendance_router.post("/apply/{affiliate_id}/{year}", status_code=status.HTTP_202_ACCEPTED)
async def apply_attendance(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> None:
    await apply_attendance_scores(db_session=db_session, affiliate_id=affiliate_id, year=year)
    await apply_total_score(db_session=db_session, affiliate_id=affiliate_id, year=year)
