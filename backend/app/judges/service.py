from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.exceptions import not_found_exception
from app.judge_availability.constants import JUDGE_TIMESLOTS
from app.judge_availability.models import JudgeAvailability
from app.score.models import Score

from .models import Judges
from .schemas import JudgesCreate, JudgesUpdate


async def get_all_judges(
    db_session: AsyncSession,
) -> list[dict[str, Any]]:
    """Get all judges."""
    stmt = select(
        Judges.id,
        Judges.crossfit_id,
        Judges.name,
        Judges.preferred,
    ).distinct()
    result = await db_session.execute(stmt)
    rows = result.mappings().all()
    return [dict(row) for row in rows]


async def get_judge(
    db_session: AsyncSession,
    judge_id: UUID,
) -> dict[str, Any]:
    """Get a judge by ID."""
    stmt = (
        select(
            Judges.id,
            Judges.crossfit_id,
            Judges.name,
            Judges.preferred,
        )
        .where(Judges.id == judge_id)
        .distinct()
    )
    result = await db_session.execute(stmt)
    row = result.mappings().first()
    if not row:
        raise not_found_exception("Judge not found")
    return dict(row)


async def get_judge_by_crossfit_id(
    db_session: AsyncSession,
    crossfit_id: int,
) -> dict[str, Any]:
    """Get a judge by crossfit_id."""
    stmt = (
        select(
            Judges.id,
            Judges.crossfit_id,
            Judges.name,
            Judges.preferred,
        )
        .where(Judges.crossfit_id == crossfit_id)
        .distinct()
    )
    result = await db_session.execute(stmt)
    row = result.mappings().first()
    if not row:
        raise not_found_exception("Judge not found")
    return dict(row)


async def init_judge_availability(
    db_session: AsyncSession,
    judge_crossfit_id: int,
) -> None:
    """Initialize judge availability for all timeslots."""
    # Get the judge by crossfit_id
    judge = await Judges.find(async_session=db_session, crossfit_id=judge_crossfit_id)
    if not judge:
        return

    # Delete existing availability for this judge
    delete_stmt = delete(JudgeAvailability).where(JudgeAvailability.judge_id == judge.id)
    await db_session.execute(delete_stmt)

    # Create availability entries for all timeslots
    for time_slot in JUDGE_TIMESLOTS:
        availability = JudgeAvailability(
            judge_id=judge.id,
            time_slot=time_slot,
            available=True,
        )
        db_session.add(availability)

    await db_session.commit()


async def create_judge(
    db_session: AsyncSession,
    judge_data: JudgesCreate,
) -> dict[str, Any]:
    """Create a new judge."""
    new_judge = Judges(
        crossfit_id=judge_data.crossfit_id,
        name=judge_data.name,
        preferred=judge_data.preferred,
    )
    db_session.add(new_judge)
    await db_session.commit()
    await db_session.refresh(new_judge)

    # Initialize judge availability
    await init_judge_availability(
        db_session=db_session,
        judge_crossfit_id=new_judge.crossfit_id,
    )

    # Fetch the judge
    return await get_judge(db_session=db_session, judge_id=new_judge.id)


async def update_judge(
    db_session: AsyncSession,
    judge_id: UUID,
    judge_data: JudgesUpdate,
) -> dict[str, Any]:
    """Update an existing judge."""
    judge = await Judges.find_or_raise(async_session=db_session, id=judge_id)

    if judge_data.crossfit_id is not None:
        judge.crossfit_id = judge_data.crossfit_id
    if judge_data.name is not None:
        judge.name = judge_data.name
    if judge_data.preferred is not None:
        judge.preferred = judge_data.preferred

    db_session.add(judge)
    await db_session.commit()
    await db_session.refresh(judge)

    # Fetch the judge
    result = await get_judge(db_session=db_session, judge_id=judge.id)
    return result


async def delete_judge(
    db_session: AsyncSession,
    judge_id: UUID,
) -> None:
    """Delete a judge."""
    judge = await Judges.find_or_raise(async_session=db_session, id=judge_id)
    await judge.delete(async_session=db_session)


async def initialize_judges(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    """Initialize judge information for all athletes based on scoring history."""
    # Get all unique judge_user_ids from scores
    select_judge_ids_stmt = select(Score.judge_user_id).where(Score.judge_user_id.is_not(None)).distinct()
    result = await db_session.execute(select_judge_ids_stmt)
    judge_user_ids = [row[0] for row in result.all()]

    if not judge_user_ids:
        return

    # For each judge_user_id, get the athlete and create a Judges record if it doesn't exist
    for judge_user_id in judge_user_ids:
        # Check if judge already exists in Judges table
        existing_judge = await Judges.find(async_session=db_session, crossfit_id=judge_user_id)
        if existing_judge:
            continue

        # Get the athlete with this crossfit_id for the given affiliate_id and year
        athlete = await Athlete.find(
            async_session=db_session,
            crossfit_id=judge_user_id,
            affiliate_id=affiliate_id,
            year=year,
        )

        if athlete:
            # Create a new Judges record
            new_judge = Judges(
                crossfit_id=judge_user_id,
                name=athlete.name,
            )
            db_session.add(new_judge)

    await db_session.commit()

    # Initialize availability for all newly created judges
    for judge_user_id in judge_user_ids:
        await init_judge_availability(
            db_session=db_session,
            judge_crossfit_id=judge_user_id,
        )
