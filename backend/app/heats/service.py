import datetime as dt
from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events.models import Events
from app.exceptions import conflict_exception
from app.heat_assignments.models import HeatAssignments
from app.heats_setup.models import HeatsSetup

from .models import Heats
from .schemas import HeatsCreate, HeatsUpdate


async def get_all_heats(
    db_session: AsyncSession,
) -> Sequence[Heats]:
    """Get all heats."""
    stmt = select(Heats).order_by(Heats.year.desc(), Heats.start_time.desc())
    results = await db_session.execute(stmt)
    return results.scalars().unique().all()


async def get_heats_by_affiliate(
    db_session: AsyncSession,
    affiliate_id: int,
) -> Sequence[Heats]:
    """Get all heats for a specific affiliate."""
    return await Heats.find_all(
        async_session=db_session,
        relationships=[Heats.heat_assignments],
        affiliate_id=affiliate_id,
    )


async def get_heats_by_year(
    db_session: AsyncSession,
    year: int,
) -> Sequence[Heats]:
    """Get all heats for a specific year."""
    return await Heats.find_all(
        async_session=db_session,
        relationships=[Heats.heat_assignments],
        year=year,
    )


async def get_heats_by_criteria(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Sequence[Heats]:
    """Get all heats for a specific affiliate, year, and ordinal."""
    stmt = (
        select(Heats)
        .where((Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal))
        .order_by(Heats.start_time)
    )
    results = await db_session.execute(stmt)
    return results.scalars().unique().all()


async def get_heat(
    db_session: AsyncSession,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Heats | None:
    """Get a specific heat by its composite primary key."""
    return await Heats.find(
        async_session=db_session,
        relationships=[Heats.heat_assignments],
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


async def create_heat(
    db_session: AsyncSession,
    heat_data: HeatsCreate,
) -> Heats:
    """Create a new heat."""
    new_heat = Heats(
        short_name=heat_data.short_name,
        start_time=heat_data.start_time,
        affiliate_id=heat_data.affiliate_id,
        year=heat_data.year,
        ordinal=heat_data.ordinal,
        max_athletes=heat_data.max_athletes,
    )
    db_session.add(new_heat)
    await db_session.commit()
    await db_session.refresh(new_heat)
    return new_heat


async def update_heat(
    db_session: AsyncSession,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
    heat_data: HeatsUpdate,
) -> Heats:
    """Update an existing heat."""
    heat = await Heats.find_or_raise(
        async_session=db_session,
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )

    # Check if any heat assignments are locked
    stmt = select(HeatAssignments).where(
        (HeatAssignments.heat_id == heat.id) & (HeatAssignments.is_locked.is_(True)),
    )
    result = await db_session.execute(stmt)
    locked_assignments = result.scalars().first()

    if locked_assignments:
        raise conflict_exception(detail="Cannot update heat: heat has locked assignments")

    if heat_data.short_name is not None:
        heat.short_name = heat_data.short_name
    if heat_data.start_time is not None:
        heat.start_time = heat_data.start_time
    if heat_data.max_athletes is not None:
        heat.max_athletes = heat_data.max_athletes

    db_session.add(heat)
    await db_session.commit()
    await db_session.refresh(heat)
    return heat


async def delete_heat(
    db_session: AsyncSession,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> None:
    """Delete a heat."""
    heat = await Heats.find_or_raise(
        async_session=db_session,
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )

    # Check if any heat assignments are locked
    stmt = select(HeatAssignments).where(
        (HeatAssignments.heat_id == heat.id) & (HeatAssignments.is_locked.is_(True)),
    )
    result = await db_session.execute(stmt)
    locked_assignments = result.scalars().first()

    if locked_assignments:
        raise conflict_exception(detail="Cannot delete heat: heat has locked assignments")

    await heat.delete(async_session=db_session)


async def delete_heats_by_criteria(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> int:
    """Delete all heats matching the given criteria."""
    stmt = select(Heats).where(
        (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
    )
    result = await db_session.execute(stmt)
    heats = result.scalars().all()

    # Check if any heat assignments are locked for these heats
    heat_ids = [heat.id for heat in heats]
    if heat_ids:
        locked_stmt = select(HeatAssignments).where(
            (HeatAssignments.heat_id.in_(heat_ids)) & (HeatAssignments.is_locked.is_(True)),
        )
        locked_result = await db_session.execute(locked_stmt)
        locked_assignments = locked_result.scalars().first()

        if locked_assignments:
            raise conflict_exception(detail="Cannot delete heats: some heats have locked assignments")

    count = len(heats)
    for heat in heats:
        await db_session.delete(heat)

    await db_session.commit()
    return count


async def create_heats_based_on_setup(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Sequence[Heats]:
    """Create heats based on the affiliate's setup for a given year."""

    # 0. Check that no heats already exist for this affiliate, year, and ordinal
    existing_heats = await get_heats_by_criteria(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )

    if existing_heats:
        raise conflict_exception(
            detail=f"Heats already exist for affiliate_id={affiliate_id}, year={year}, ordinal={ordinal}. Cannot generate heats.",
        )

    # 1. Pull data from HeatsSetup for this affiliate_id
    heats_setup_list = await HeatsSetup.find_all(async_session=db_session, affiliate_id=affiliate_id)

    if not heats_setup_list:
        return []

    # 2. Pull Events for this year and ordinal. This contains the start date for the event
    event = await Events.find_or_raise(async_session=db_session, year=year, ordinal=ordinal)

    if not event.start_date:
        raise conflict_exception(detail=f"Event {year}.{ordinal} has no start_date defined")

    # 3. For each setup entry, create Heats entries in the database
    created_heats = []

    # Map day names to weekday numbers (Monday=0, Sunday=6)
    day_map = {
        "Mon": 0,
        "Tue": 1,
        "Wed": 2,
        "Thu": 3,
        "Fri": 4,
        "Sat": 5,
        "Sun": 6,
    }

    for setup in heats_setup_list:
        # Parse the day of week from short_name (e.g. "Fri AM" -> "Fri")
        day_name = setup.short_name.split()[0]

        if day_name not in day_map:
            raise conflict_exception(
                detail=f"Invalid day name '{day_name}' in HeatsSetup.short_name '{setup.short_name}'"
            )

        target_weekday = day_map[day_name]

        # Find the first occurrence of this day on or after the event start_date
        event_date = event.start_date.date() if isinstance(event.start_date, dt.datetime) else event.start_date
        current_weekday = event_date.weekday()
        days_until_target = (target_weekday - current_weekday) % 7
        target_date = event_date + dt.timedelta(days=days_until_target)

        # Parse start and end times (handle HH:MM or HH:MM:SS format)
        start_parts = setup.start_time.split(":")
        start_hour, start_min = int(start_parts[0]), int(start_parts[1])
        end_parts = setup.end_time.split(":")
        end_hour, end_min = int(end_parts[0]), int(end_parts[1])

        # Generate heat times from start_time to end_time with the given interval
        current_time = dt.time(start_hour, start_min)
        end_time = dt.time(end_hour, end_min)
        heat_number = 1

        while current_time < end_time:
            heat_datetime = dt.datetime.combine(target_date, current_time)

            # Create the heat
            new_heat = Heats(
                short_name=setup.short_name,
                start_time=heat_datetime,
                affiliate_id=affiliate_id,
                year=year,
                ordinal=ordinal,
                max_athletes=setup.max_athletes if setup.max_athletes is not None else 10,
            )
            db_session.add(new_heat)
            created_heats.append(new_heat)

            # Move to next time slot
            next_datetime = heat_datetime + dt.timedelta(minutes=setup.interval)
            current_time = next_datetime.time()
            heat_number += 1

    await db_session.commit()

    for heat in created_heats:
        await db_session.refresh(heat)

    return created_heats


async def toggle_heat_assignments_published(
    db_session: AsyncSession,
    heat_id: UUID,
    published: bool,
) -> dict[str, int | str]:
    """Toggle the published status of all heat assignments for a specific heat."""
    stmt = select(HeatAssignments).where(HeatAssignments.heat_id == heat_id)
    result = await db_session.execute(stmt)
    assignments = list(result.scalars().all())

    if not assignments:
        return {
            "updated_count": 0,
            "message": f"No heat assignments found for heat_id {heat_id}",
        }

    for assignment in assignments:
        assignment.is_published = published
        db_session.add(assignment)

    await db_session.commit()

    return {
        "updated_count": len(assignments),
        "message": f"Updated {len(assignments)} heat assignments to published={published}",
    }


async def toggle_heat_assignments_locked(
    db_session: AsyncSession,
    heat_id: UUID,
    locked: bool,
) -> dict[str, int | str]:
    """Toggle the locked status of all heat assignments for a specific heat."""
    stmt = select(HeatAssignments).where(HeatAssignments.heat_id == heat_id)
    result = await db_session.execute(stmt)
    assignments = list(result.scalars().all())

    if not assignments:
        return {
            "updated_count": 0,
            "message": f"No heat assignments found for heat_id {heat_id}",
        }

    for assignment in assignments:
        assignment.is_locked = locked
        db_session.add(assignment)

    await db_session.commit()

    return {
        "updated_count": len(assignments),
        "message": f"Updated {len(assignments)} heat assignments to locked={locked}",
    }
