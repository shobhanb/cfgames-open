from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import not_found_exception

from .models import JudgeAvailability
from .schemas import JudgeAvailabilityCreate, JudgeAvailabilityUpdate


async def get_all_judge_availabilities(
    db_session: AsyncSession,
) -> list[dict[str, Any]]:
    """Get all judge availabilities."""
    stmt = select(
        JudgeAvailability.id,
        JudgeAvailability.judge_id,
        JudgeAvailability.time_slot,
        JudgeAvailability.available,
    ).order_by(JudgeAvailability.judge_id, JudgeAvailability.created_at.asc())
    result = await db_session.execute(stmt)
    rows = result.mappings().all()
    return [dict(row) for row in rows]


async def get_judge_availability(
    db_session: AsyncSession,
    availability_id: UUID,
) -> dict[str, Any]:
    """Get a judge availability by ID."""
    stmt = (
        select(
            JudgeAvailability.id,
            JudgeAvailability.judge_id,
            JudgeAvailability.time_slot,
            JudgeAvailability.available,
        )
        .where(JudgeAvailability.id == availability_id)
        .distinct()
    )
    result = await db_session.execute(stmt)
    row = result.mappings().first()
    if not row:
        msg = "Judge availability not found"
        raise not_found_exception(msg)
    return dict(row)


async def get_judge_availabilities_by_judge(
    db_session: AsyncSession,
    judge_id: UUID,
) -> list[dict[str, Any]]:
    """Get all availabilities for a specific judge."""
    stmt = (
        select(
            JudgeAvailability.id,
            JudgeAvailability.judge_id,
            JudgeAvailability.time_slot,
            JudgeAvailability.available,
        )
        .where(JudgeAvailability.judge_id == judge_id)
        .order_by(JudgeAvailability.created_at.asc())
    )
    result = await db_session.execute(stmt)
    rows = result.mappings().all()
    return [dict(row) for row in rows]


async def create_judge_availability(
    db_session: AsyncSession,
    availability_data: JudgeAvailabilityCreate,
) -> dict[str, Any]:
    """Create a new judge availability."""
    new_availability = JudgeAvailability(
        judge_id=availability_data.judge_id,
        time_slot=availability_data.time_slot,
        available=availability_data.available,
    )
    db_session.add(new_availability)
    await db_session.commit()
    await db_session.refresh(new_availability)

    # Fetch the availability
    return await get_judge_availability(
        db_session=db_session,
        availability_id=new_availability.id,
    )


async def update_judge_availability(
    db_session: AsyncSession,
    availability_id: UUID,
    availability_data: JudgeAvailabilityUpdate,
) -> dict[str, Any]:
    """Update an existing judge availability."""
    availability = await JudgeAvailability.find_or_raise(
        async_session=db_session,
        id=availability_id,
    )

    if availability_data.time_slot is not None:
        availability.time_slot = availability_data.time_slot
    if availability_data.available is not None:
        availability.available = availability_data.available

    db_session.add(availability)
    await db_session.commit()
    await db_session.refresh(availability)

    # Fetch the availability
    return await get_judge_availability(
        db_session=db_session,
        availability_id=availability.id,
    )


async def delete_judge_availability(
    db_session: AsyncSession,
    availability_id: UUID,
) -> None:
    """Delete a judge availability."""
    availability = await JudgeAvailability.find_or_raise(
        async_session=db_session,
        id=availability_id,
    )
    await availability.delete(async_session=db_session)
