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
            Athlete,
            Attendance,
            (Attendance.crossfit_id == Athlete.crossfit_id)
            & (Attendance.year == Athlete.year)
            & (Attendance.ordinal == ordinal),
            isouter=True,
            full=True,
        )
        .where((Athlete.year == year) & (Athlete.affiliate_id == affiliate_id))
    )
    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def update_db_attendance(
    db_session: db_dependency,
    year: int,
    ordinal: int,
    crossfit_id: int,
    attendance: bool,  # noqa: FBT001
) -> dict[str, Any]:
    select_stmt = (
        select(Attendance)
        .join_from(
            Attendance,
            Athlete,
            (Attendance.crossfit_id == Athlete.crossfit_id) & (Attendance.year == Athlete.year),
        )
        .where(
            (Athlete.year == year) & (Athlete.crossfit_id == crossfit_id) & (Attendance.ordinal == ordinal),
        )
    )
    ret = await db_session.execute(select_stmt)
    attendance_record = ret.scalar_one_or_none()

    if attendance and not attendance_record:
        athlete = await Athlete.find_or_raise(
            async_session=db_session,
            year=year,
            crossfit_id=crossfit_id,
        )
        new_attendance = Attendance(crossfit_id=athlete.crossfit_id, year=year, ordinal=ordinal)
        db_session.add(new_attendance)
        await db_session.commit()

    if not attendance and attendance_record:
        await db_session.delete(attendance_record)
        await db_session.commit()

    stmt = (
        select(Athlete.year, Athlete.affiliate_id, Athlete.name, Athlete.crossfit_id, Attendance.ordinal)
        .join_from(
            Athlete,
            Attendance,
            (Attendance.crossfit_id == Athlete.crossfit_id)
            & (Attendance.year == Athlete.year)
            & (Attendance.ordinal == ordinal),
            isouter=True,
            full=True,
        )
        .where((Athlete.year == year) & (Athlete.crossfit_id == crossfit_id))
    )
    ret = await db_session.execute(stmt)
    results = ret.mappings().one()
    return dict(results)
