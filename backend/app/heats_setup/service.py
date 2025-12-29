from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import HeatsSetup
from .schemas import HeatsSetupCreate, HeatsSetupUpdate


async def get_all_heats_setup(
    db_session: AsyncSession,
) -> Sequence[HeatsSetup]:
    """Get all heats setup configurations."""
    stmt = select(HeatsSetup).order_by(HeatsSetup.start_time.asc())
    results = await db_session.execute(stmt)
    return results.scalars().all()


async def get_heats_setup_by_affiliate(
    db_session: AsyncSession,
    affiliate_id: int,
) -> Sequence[HeatsSetup]:
    """Get all heats setup for a specific affiliate."""
    stmt = select(HeatsSetup).where(HeatsSetup.affiliate_id == affiliate_id).order_by(HeatsSetup.start_time.asc())
    results = await db_session.execute(stmt)
    return results.scalars().all()


async def get_heats_setup(
    db_session: AsyncSession,
    heat_id: UUID,
) -> HeatsSetup | None:
    """Get a specific heats setup by ID."""
    return await HeatsSetup.find(async_session=db_session, id=heat_id)


async def create_heats_setup(
    db_session: AsyncSession,
    heat_data: HeatsSetupCreate,
) -> HeatsSetup:
    """Create a new heats setup configuration."""
    new_heat = HeatsSetup(
        affiliate_id=heat_data.affiliate_id,
        short_name=heat_data.short_name,
        start_time=heat_data.start_time,
        end_time=heat_data.end_time,
        interval=heat_data.interval,
        max_athletes=heat_data.max_athletes,
    )
    db_session.add(new_heat)
    await db_session.commit()
    await db_session.refresh(new_heat)
    return new_heat


async def update_heats_setup(
    db_session: AsyncSession,
    heat_id: UUID,
    heat_data: HeatsSetupUpdate,
) -> HeatsSetup:
    """Update an existing heats setup configuration."""
    heat = await HeatsSetup.find_or_raise(async_session=db_session, id=heat_id)

    if heat_data.short_name is not None:
        heat.short_name = heat_data.short_name
    if heat_data.start_time is not None:
        heat.start_time = heat_data.start_time
    if heat_data.end_time is not None:
        heat.end_time = heat_data.end_time
    if heat_data.interval is not None:
        heat.interval = heat_data.interval
    if heat_data.max_athletes is not None:
        heat.max_athletes = heat_data.max_athletes

    db_session.add(heat)
    await db_session.commit()
    await db_session.refresh(heat)
    return heat


async def delete_heats_setup(
    db_session: AsyncSession,
    heat_id: UUID,
) -> None:
    """Delete a heats setup configuration."""
    heat = await HeatsSetup.find_or_raise(async_session=db_session, id=heat_id)
    await heat.delete(async_session=db_session)
