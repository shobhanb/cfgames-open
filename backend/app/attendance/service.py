from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select

from app.athlete.models import Athlete
from app.attendance.models import Attendance
from app.database.dependencies import db_dependency

log = logging.getLogger("uvicorn.error")


async def get_db_attendance(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    stmt = (
        select(Athlete.year, Athlete.affiliate_id, Athlete.name, Athlete.crossfit_id, Attendance.ordinal)
        .join_from(
            Attendance,
            Athlete,
            (Attendance.crossfit_id == Athlete.crossfit_id) & (Attendance.year == Athlete.year),
        )
        .where((Athlete.year == year) & (Athlete.affiliate_id == affiliate_id) & (Attendance.ordinal == ordinal))
    )
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def update_db_attendance(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    crossfit_id: int,
) -> None:
    select_stmt = (
        select(Attendance)
        .join_from(
            Attendance,
            Athlete,
            (Attendance.crossfit_id == Athlete.crossfit_id) & (Attendance.year == Athlete.year),
        )
        .where(
            (Athlete.year == year)
            & (Athlete.affiliate_id == affiliate_id)
            & (Athlete.crossfit_id == crossfit_id)
            & (Attendance.ordinal == ordinal),
        )
    )
    ret = await db_session.execute(select_stmt)
    attendance = ret.scalar_one_or_none()

    if not attendance:
        athlete = await Athlete.find_or_raise(
            async_session=db_session,
            year=year,
            affiliate_id=affiliate_id,
            crossfit_id=crossfit_id,
        )
        new_attendance = Attendance(crossfit_id=athlete.crossfit_id, year=year, ordinal=ordinal)
        db_session.add(new_attendance)
        await db_session.commit()
