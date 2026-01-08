import datetime as dt
import logging
import random
from collections.abc import Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.athlete_prefs.models import AthleteTimePref
from app.exceptions import not_found_exception
from app.firebase_auth.models import FirebaseUser
from app.heats.models import Heats
from app.judge_availability.models import JudgeAvailability
from app.judges.models import Judges
from app.preferred_athletes.models import PreferredAthletes

from .constants import JUDGE_BUFFER_MINUTES, MIN_JUDGE_GAP_MINUTES, PREFERRED_ATHLETE_BUFFER_MINUTES
from .models import HeatAssignments
from .schemas import HeatAssignmentCreate, HeatAssignmentUpdate

log = logging.getLogger("uvicorn.error")


async def get_all_heat_assignments(
    db_session: AsyncSession,
    heat_id: UUID | None = None,
) -> list[dict[str, Any]]:
    """Get all heat assignments with athlete and judge details."""
    stmt = select(HeatAssignments)

    if heat_id:
        stmt = stmt.where(HeatAssignments.heat_id == heat_id)

    result = await db_session.execute(stmt)
    assignments = result.scalars().all()

    return [
        {
            "id": assignment.id,
            "heat_id": assignment.heat_id,
            "athlete_crossfit_id": assignment.athlete_crossfit_id,
            "athlete_name": assignment.athlete_name,
            "judge_crossfit_id": assignment.judge_crossfit_id,
            "judge_name": assignment.judge_name,
            "preference_nbr": assignment.preference_nbr,
            "is_locked": assignment.is_locked,
            "is_published": assignment.is_published,
        }
        for assignment in assignments
    ]


async def get_heat_assignment(
    db_session: AsyncSession,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Get a heat assignment by ID with athlete and judge details."""
    assignment = await HeatAssignments.find(async_session=db_session, id=assignment_id)

    if not assignment:
        msg = "Heat assignment not found"
        raise not_found_exception(msg)

    return {
        "id": assignment.id,
        "heat_id": assignment.heat_id,
        "athlete_crossfit_id": assignment.athlete_crossfit_id,
        "athlete_name": assignment.athlete_name,
        "judge_crossfit_id": assignment.judge_crossfit_id,
        "judge_name": assignment.judge_name,
        "preference_nbr": assignment.preference_nbr,
        "is_locked": assignment.is_locked,
        "is_published": assignment.is_published,
    }


async def get_my_db_heat_assignments_judge(
    db_session: AsyncSession,
    crossfit_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    """Get heat assignments for a judge by their crossfit_id and ordinal."""
    stmt = (
        select(HeatAssignments)
        .join(Heats, HeatAssignments.heat_id == Heats.id)
        .where(
            HeatAssignments.judge_crossfit_id == crossfit_id,
            Heats.ordinal == ordinal,
            Heats.year == year,
            HeatAssignments.is_published.is_(True),
        )
    )

    result = await db_session.execute(stmt)
    assignments = result.scalars().all()

    if not assignments:
        msg = "Judge Heat assignment not found for the authenticated user"
        raise not_found_exception(msg)

    return [
        {
            "id": assignment.id,
            "heat_id": assignment.heat_id,
            "athlete_crossfit_id": assignment.athlete_crossfit_id,
            "athlete_name": assignment.athlete_name,
            "judge_crossfit_id": assignment.judge_crossfit_id,
            "judge_name": assignment.judge_name,
            "preference_nbr": assignment.preference_nbr,
            "is_locked": assignment.is_locked,
            "is_published": assignment.is_published,
        }
        for assignment in assignments
    ]


async def get_my_db_heat_assignment_athlete(
    db_session: AsyncSession,
    crossfit_id: int,
    year: int,
    ordinal: int,
) -> dict[str, Any]:
    """Get heat assignment for an athlete by their crossfit_id and ordinal."""
    stmt = (
        select(HeatAssignments)
        .join(Heats, HeatAssignments.heat_id == Heats.id)
        .where(
            HeatAssignments.athlete_crossfit_id == crossfit_id,
            Heats.ordinal == ordinal,
            Heats.year == year,
            HeatAssignments.is_published.is_(True),
        )
    )

    result = await db_session.execute(stmt)
    assignment = result.scalar_one_or_none()

    if not assignment:
        msg = "Heat assignment not found for the authenticated athlete"
        raise not_found_exception(msg)

    return {
        "id": assignment.id,
        "heat_id": assignment.heat_id,
        "athlete_crossfit_id": assignment.athlete_crossfit_id,
        "athlete_name": assignment.athlete_name,
        "judge_crossfit_id": assignment.judge_crossfit_id,
        "judge_name": assignment.judge_name,
        "preference_nbr": assignment.preference_nbr,
        "is_locked": assignment.is_locked,
        "is_published": assignment.is_published,
    }


async def create_heat_assignment(
    db_session: AsyncSession,
    assignment_data: HeatAssignmentCreate,
) -> dict[str, Any]:
    """Create a new heat assignment."""
    athlete_name = assignment_data.athlete_name
    judge_name = assignment_data.judge_name

    # Get athlete name if not provided
    if assignment_data.athlete_crossfit_id and not athlete_name:
        athlete = await Athlete.find(async_session=db_session, crossfit_id=assignment_data.athlete_crossfit_id)
        if athlete:
            athlete_name = athlete.name

    # Get judge name if not provided
    if assignment_data.judge_crossfit_id and not judge_name:
        judge = await Judges.find(async_session=db_session, crossfit_id=assignment_data.judge_crossfit_id)
        if judge:
            judge_name = judge.name

    new_assignment = HeatAssignments(
        heat_id=assignment_data.heat_id,
        athlete_crossfit_id=assignment_data.athlete_crossfit_id,
        athlete_name=athlete_name,
        judge_crossfit_id=assignment_data.judge_crossfit_id,
        judge_name=judge_name,
        preference_nbr=assignment_data.preference_nbr,
        is_locked=assignment_data.is_locked if assignment_data.is_locked is not None else False,
        is_published=assignment_data.is_published if assignment_data.is_published is not None else False,
    )
    db_session.add(new_assignment)
    await db_session.commit()
    await db_session.refresh(new_assignment)

    return await get_heat_assignment(db_session=db_session, assignment_id=new_assignment.id)


async def update_heat_assignment(
    db_session: AsyncSession,
    assignment_id: UUID,
    assignment_data: HeatAssignmentUpdate,
) -> dict[str, Any]:
    """Update an existing heat assignment."""
    assignment = await HeatAssignments.find_or_raise(async_session=db_session, id=assignment_id)

    if assignment_data.heat_id is not None:
        assignment.heat_id = assignment_data.heat_id

    if assignment_data.athlete_crossfit_id is not None:
        assignment.athlete_crossfit_id = assignment_data.athlete_crossfit_id
        # Update athlete_name when athlete_crossfit_id changes
        if assignment_data.athlete_name:
            assignment.athlete_name = assignment_data.athlete_name
        elif assignment_data.athlete_crossfit_id:
            athlete = await Athlete.find(async_session=db_session, crossfit_id=assignment_data.athlete_crossfit_id)
            if athlete:
                assignment.athlete_name = athlete.name
        else:
            assignment.athlete_name = None
    elif assignment_data.athlete_name is not None:
        assignment.athlete_name = assignment_data.athlete_name

    if assignment_data.judge_crossfit_id is not None:
        assignment.judge_crossfit_id = assignment_data.judge_crossfit_id
        # Update judge_name when judge_crossfit_id changes
        if assignment_data.judge_name:
            assignment.judge_name = assignment_data.judge_name
        elif assignment_data.judge_crossfit_id:
            judge = await Judges.find(async_session=db_session, crossfit_id=assignment_data.judge_crossfit_id)
            if judge:
                assignment.judge_name = judge.name
        else:
            assignment.judge_name = None
    elif assignment_data.judge_name is not None:
        assignment.judge_name = assignment_data.judge_name

    if assignment_data.preference_nbr is not None:
        assignment.preference_nbr = assignment_data.preference_nbr

    if assignment_data.is_locked is not None:
        assignment.is_locked = assignment_data.is_locked

    if assignment_data.is_published is not None:
        assignment.is_published = assignment_data.is_published

    db_session.add(assignment)
    await db_session.commit()
    await db_session.refresh(assignment)

    return await get_heat_assignment(db_session=db_session, assignment_id=assignment.id)


async def delete_heat_assignment(
    db_session: AsyncSession,
    assignment_id: UUID,
) -> None:
    """Delete a heat assignment."""
    assignment = await HeatAssignments.find_or_raise(async_session=db_session, id=assignment_id)
    await assignment.delete(async_session=db_session)


async def clear_athlete_from_assignment(
    db_session: AsyncSession,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Clear athlete fields from a heat assignment."""
    assignment = await HeatAssignments.find_or_raise(async_session=db_session, id=assignment_id)

    assignment.athlete_crossfit_id = None
    assignment.athlete_name = None
    assignment.preference_nbr = None

    db_session.add(assignment)
    await db_session.commit()
    await db_session.refresh(assignment)

    return await get_heat_assignment(db_session=db_session, assignment_id=assignment.id)


async def clear_judge_from_assignment(
    db_session: AsyncSession,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Clear judge fields from a heat assignment."""
    assignment = await HeatAssignments.find_or_raise(async_session=db_session, id=assignment_id)

    assignment.judge_crossfit_id = None
    assignment.judge_name = None

    db_session.add(assignment)
    await db_session.commit()
    await db_session.refresh(assignment)

    return await get_heat_assignment(db_session=db_session, assignment_id=assignment.id)


async def delete_heat_assignments_by_criteria(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> dict[str, Any]:
    """Delete all heat assignments for heats matching affiliate_id, year, and ordinal."""
    # Get all heats matching the criteria
    heats_stmt = select(Heats).where(
        (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
    )
    heats_result = await db_session.execute(heats_stmt)
    heats = list(heats_result.scalars().all())

    if not heats:
        return {
            "deleted_count": 0,
            "heats_found": 0,
            "message": f"No heats found for affiliate_id={affiliate_id}, year={year}, ordinal={ordinal}",
        }

    heat_ids = [heat.id for heat in heats]

    # Get all assignments for these heats
    assignments_stmt = select(HeatAssignments).where(HeatAssignments.heat_id.in_(heat_ids))
    assignments_result = await db_session.execute(assignments_stmt)
    assignments = list(assignments_result.scalars().all())

    # Delete all assignments
    for assignment in assignments:
        await assignment.delete(async_session=db_session)

    await db_session.commit()

    return {
        "deleted_count": len(assignments),
        "heats_found": len(heats),
        "message": f"Deleted {len(assignments)} heat assignments from {len(heats)} heats",
    }


def _organize_athlete_preferences(
    athletes_data: Sequence[tuple[Athlete, AthleteTimePref]],
) -> dict[int, dict[str, Any]]:
    """Organize athlete preferences by crossfit_id."""
    athlete_prefs: dict[int, dict[str, Any]] = {}
    for athlete, pref in athletes_data:
        if athlete.crossfit_id not in athlete_prefs:
            athlete_prefs[athlete.crossfit_id] = {
                "name": athlete.name,
                "crossfit_id": athlete.crossfit_id,
                "preferences": [],
            }
        athlete_prefs[athlete.crossfit_id]["preferences"].append(
            {
                "preference_nbr": pref.preference_nbr,
                "preference": pref.preference,
            },
        )
    return athlete_prefs


def _filter_available_athletes(
    athlete_prefs: dict[int, dict[str, Any]],
) -> tuple[dict[int, dict[str, Any]], list[dict[str, Any]]]:
    """Filter out athletes with NA at preference_nbr 0."""
    available_athletes = {}
    skipped_athletes = []

    for crossfit_id, data in athlete_prefs.items():
        if data["preferences"] and data["preferences"][0]["preference"] == "NA":
            skipped_athletes.append(
                {
                    "crossfit_id": crossfit_id,
                    "name": data["name"],
                    "reason": "Not available (NA at preference 0)",
                },
            )
        else:
            available_athletes[crossfit_id] = data

    return available_athletes, skipped_athletes


def _separate_judges_and_athletes(
    available_athletes: dict[int, dict[str, Any]],
    judge_crossfit_ids: set[int],
) -> tuple[dict[int, dict[str, Any]], dict[int, dict[str, Any]]]:
    """Separate judges who are also athletes from regular athletes."""
    judges_as_athletes = {cid: data for cid, data in available_athletes.items() if cid in judge_crossfit_ids}
    regular_athletes = {cid: data for cid, data in available_athletes.items() if cid not in judge_crossfit_ids}
    return judges_as_athletes, regular_athletes


def _build_heats_by_preference_index(heats: list[Heats]) -> dict[str, list[Heats]]:
    """Index heats by preference (short_name) in start time order."""
    index: dict[str, list[Heats]] = {}
    for heat in heats:
        key = heat.short_name.lower()
        if key not in index:
            index[key] = []
        index[key].append(heat)
    return index


def _get_time_slot_for_heat(heat_time: dt.datetime) -> str:
    """Map a heat's start time to a time slot string.

    Each time slot is 1 hour long. E.g., 'Sat 6PM' covers 6:00 PM - 6:59 PM.
    """
    # Get day of week (0=Monday, 6=Sunday)
    day_map = {
        4: "Fri",  # Friday
        5: "Sat",  # Saturday
        6: "Sun",  # Sunday
        0: "Mon",  # Monday
    }

    day_name = day_map.get(heat_time.weekday())
    if not day_name:
        return ""

    hour = heat_time.hour

    # Determine AM/PM and format hour
    if hour == 0:
        time_str = "12AM"
    elif hour < 12:  # noqa: PLR2004
        time_str = f"{hour}AM"
    elif hour == 12:  # noqa: PLR2004
        time_str = "12PM"
    else:
        time_str = f"{hour - 12}PM"

    return f"{day_name} {time_str}"


def _is_within_time_buffer(
    heat_time: dt.datetime,
    preferred_time_slot: str,
    buffer_minutes: int = PREFERRED_ATHLETE_BUFFER_MINUTES,
) -> bool:
    """Check if heat_time is within buffer_minutes of the preferred time slot.

    Args:
        heat_time: The actual datetime of the heat
        preferred_time_slot: Time slot string like "Sat 6AM", "Fri 7PM"
        buffer_minutes: The buffer in minutes (default 30)

    Returns:
        True if heat_time is within the buffer of the preferred time slot
    """
    # Parse the preferred time slot
    parts = preferred_time_slot.split()
    if len(parts) != 2:  # noqa: PLR2004
        return False

    day_str, time_str = parts

    # Map day names to weekday numbers
    day_map = {
        "Fri": 4,
        "Sat": 5,
        "Sun": 6,
        "Mon": 0,
    }

    preferred_weekday = day_map.get(day_str)
    if preferred_weekday is None:
        return False

    # Parse the time (e.g., "6AM", "7PM", "12PM")
    if time_str.endswith("AM"):
        hour_str = time_str[:-2]
        hour = int(hour_str)
        if hour == 12:  # noqa: PLR2004
            hour = 0
    elif time_str.endswith("PM"):
        hour_str = time_str[:-2]
        hour = int(hour_str)
        if hour != 12:  # noqa: PLR2004
            hour += 12
    else:
        return False

    # Check if same day
    if heat_time.weekday() != preferred_weekday:
        return False

    # Calculate time difference in minutes
    heat_hour = heat_time.hour
    heat_minute = heat_time.minute

    # Convert both to minutes since midnight
    heat_minutes = heat_hour * 60 + heat_minute
    preferred_minutes = hour * 60

    # Check if within buffer
    time_diff = abs(heat_minutes - preferred_minutes)
    return time_diff <= buffer_minutes


def _can_judge_be_assigned(
    judge_crossfit_id: int,
    heat_id: UUID,
    judge_athlete_assignments: dict[int, list[UUID]],
    heat_times: dict[UUID, Any],
    heats_sorted_by_time: list[Heats] | None = None,
) -> bool:
    """Check if judge can be assigned considering buffer from their athlete slots.

    Also ensures judges are not assigned to heats immediately before or after
    their athlete assignments.
    """
    if judge_crossfit_id not in judge_athlete_assignments:
        return True

    judge_heat_time = heat_times[heat_id]

    for athlete_heat_id in judge_athlete_assignments[judge_crossfit_id]:
        athlete_heat_time = heat_times[athlete_heat_id]
        time_diff = abs((judge_heat_time - athlete_heat_time).total_seconds() / 60)

        # Check time buffer
        if time_diff < JUDGE_BUFFER_MINUTES:
            return False

        # Check if this is immediately before or after their athlete heat
        if heats_sorted_by_time:
            try:
                # Find the athlete heat and judge heat in sorted list
                athlete_heat_idx = next(i for i, h in enumerate(heats_sorted_by_time) if h.id == athlete_heat_id)
                judge_heat_idx = next(i for i, h in enumerate(heats_sorted_by_time) if h.id == heat_id)

                # Don't allow assignment to immediately adjacent heats
                if abs(athlete_heat_idx - judge_heat_idx) == 1:
                    return False
            except StopIteration:
                # If we can't find the heats, skip this check
                pass

    return True


def _has_back_to_back_assignment(
    judge_crossfit_id: int,
    heat_id: UUID,
    judge_assignments: dict[int, list[UUID]],
    heat_times: dict[UUID, dt.datetime],
) -> bool:
    """Check if assigning this judge would create a back-to-back assignment."""
    if judge_crossfit_id not in judge_assignments:
        return False

    current_heat_time = heat_times[heat_id]

    for assigned_heat_id in judge_assignments[judge_crossfit_id]:
        assigned_heat_time = heat_times[assigned_heat_id]
        time_diff_minutes = abs((current_heat_time - assigned_heat_time).total_seconds() / 60)

        # Don't allow assignments within MIN_JUDGE_GAP_MINUTES
        if time_diff_minutes < MIN_JUDGE_GAP_MINUTES:
            return True

    return False


def _assign_preferred_athlete_to_heat(
    crossfit_id: int,
    athlete_data: dict[str, Any],
    preferred_start_time: str,
    heat_athlete_counts: dict[UUID, int],
    heats: list[Heats],
    db_session: AsyncSession,
    judge_athlete_assignments: dict[int, list[UUID]] | None = None,
) -> tuple[HeatAssignments | None, int]:
    """Assign a preferred athlete to a heat matching their start_time preference."""
    # Find heats matching the preferred start_time (within 30 minute buffer)
    matching_heats = []
    for heat in heats:
        if _is_within_time_buffer(heat.start_time, preferred_start_time, buffer_minutes=30):
            matching_heats.append(heat)

    # Try to assign to a matching heat
    for heat in matching_heats:
        if heat.max_athletes is not None and heat_athlete_counts[heat.id] >= heat.max_athletes:
            continue

        new_assignment = HeatAssignments(
            heat_id=heat.id,
            athlete_crossfit_id=crossfit_id,
            athlete_name=athlete_data["name"],
            judge_crossfit_id=None,
            judge_name=None,
            preference_nbr=0,  # Preferred athlete, highest priority
        )
        log.info(
            "Assigning preferred athlete %s to heat %s at %s (matched start_time: %s)",
            athlete_data["name"],
            heat.short_name,
            heat.start_time,
            preferred_start_time,
        )
        db_session.add(new_assignment)
        heat_athlete_counts[heat.id] += 1
        if judge_athlete_assignments is not None and crossfit_id in judge_athlete_assignments:
            judge_athlete_assignments[crossfit_id].append(heat.id)
        return new_assignment, 1

    # If no matching heat found, log and return None
    log.warning(
        "No matching heat found for preferred athlete %s with start_time %s",
        athlete_data["name"],
        preferred_start_time,
    )
    return None, 0


def _assign_athlete_to_heat(
    crossfit_id: int,
    athlete_data: dict[str, Any],
    heat_athlete_counts: dict[UUID, int],
    db_session: AsyncSession,
    judge_athlete_assignments: dict[int, list[UUID]] | None = None,
    heats_by_pref: dict[str, list[Heats]] | None = None,
) -> tuple[HeatAssignments | None, int]:
    """Try to assign an athlete to a heat based on preferences."""
    prefs = athlete_data["preferences"]
    sorted_prefs = sorted(prefs, key=lambda x: x["preference_nbr"])

    for pref in sorted_prefs:
        if pref["preference"] == "NA":
            continue

        preference_key = pref["preference"].lower()
        matching_heats = (heats_by_pref or {}).get(preference_key, [])

        for heat in matching_heats:
            if heat.max_athletes is not None and heat_athlete_counts[heat.id] >= heat.max_athletes:
                continue

            new_assignment = HeatAssignments(
                heat_id=heat.id,
                athlete_crossfit_id=crossfit_id,
                athlete_name=athlete_data["name"],
                judge_crossfit_id=None,
                judge_name=None,
                preference_nbr=pref["preference_nbr"] + 1,
            )
            log.info(
                "Assigning athlete %s to heat %s at %s with preference %s",
                athlete_data["name"],
                heat.short_name,
                heat.start_time,
                pref["preference_nbr"],
            )
            db_session.add(new_assignment)
            heat_athlete_counts[heat.id] += 1
            if judge_athlete_assignments is not None and crossfit_id in judge_athlete_assignments:
                judge_athlete_assignments[crossfit_id].append(heat.id)
            return new_assignment, 1

    return None, 0


async def assign_athletes_randomly(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> dict[str, Any]:
    """
    Assign athletes to heats based on their time preferences.

    Rules:
    1. Pull athlete time preferences (AthleteTimePref)
    2. Skip athletes with "NA" at preference_nbr 0
    3. Assign preferred athletes first (PreferredAthletes), then preferred judges, then others
    4. Respect max_athletes limit of each heat
    """
    # Get all heats for the given criteria
    heats_stmt = (
        select(Heats)
        .where(
            (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
        )
        .order_by(Heats.start_time)
    )
    heats_result = await db_session.execute(heats_stmt)
    heats = list(heats_result.scalars().all())

    heats_by_pref = _build_heats_by_preference_index(heats)

    if not heats:
        msg = f"No heats found for affiliate_id={affiliate_id}, year={year}, ordinal={ordinal}"
        raise not_found_exception(msg)

    # Get all athletes with their preferences for this affiliate and year
    athletes_stmt = (
        select(Athlete, AthleteTimePref)
        .join(AthleteTimePref, Athlete.crossfit_id == AthleteTimePref.crossfit_id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
        .order_by(Athlete.crossfit_id, AthleteTimePref.preference_nbr)
    )
    athletes_result = await db_session.execute(athletes_stmt)
    # Normalize to list of tuples for type clarity
    athletes_data = [(row[0], row[1]) for row in athletes_result.all()]

    # Organize athlete preferences
    athlete_prefs = _organize_athlete_preferences(athletes_data)

    # Filter out athletes with "NA" at preference_nbr 0
    available_athletes, skipped_athletes = _filter_available_athletes(athlete_prefs)

    # Pull preferred athletes with their start_time preferences
    preferred_stmt = select(PreferredAthletes)
    preferred_result = await db_session.execute(preferred_stmt)
    preferred_athletes_records = list(preferred_result.scalars().all())
    preferred_ids = {pref.crossfit_id for pref in preferred_athletes_records}
    # Map crossfit_id to start_time for preferred athletes
    preferred_start_times = {pref.crossfit_id: pref.start_time for pref in preferred_athletes_records}

    # Get all judges
    judges_stmt = select(Judges)
    judges_result = await db_session.execute(judges_stmt)
    all_judges = list(judges_result.scalars().all())
    judge_crossfit_ids = {judge.crossfit_id for judge in all_judges}
    preferred_judge_ids = {judge.crossfit_id for judge in all_judges if judge.preferred}

    # Split preferred vs remaining
    preferred_athletes = {cid: data for cid, data in available_athletes.items() if cid in preferred_ids}
    remaining_after_preferred = {cid: data for cid, data in available_athletes.items() if cid not in preferred_ids}

    # Among remaining, separate preferred judges from everyone else
    # Preferred judges get priority, non-preferred judges are treated as regular athletes
    preferred_judges_after_pref = {
        cid: data for cid, data in remaining_after_preferred.items() if cid in preferred_judge_ids
    }
    regular_after_pref = {
        cid: data for cid, data in remaining_after_preferred.items() if cid not in preferred_judge_ids
    }

    # Track athlete assignments for judges (to enforce buffer)
    judge_athlete_assignments: dict[int, list[UUID]] = {judge.crossfit_id: [] for judge in all_judges}

    # Get existing assignments to respect them
    existing_assignments_stmt = (
        select(HeatAssignments)
        .join(Heats, HeatAssignments.heat_id == Heats.id)
        .where(
            (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
        )
    )
    existing_result = await db_session.execute(existing_assignments_stmt)
    existing_assignments = list(existing_result.scalars().all())

    # Track current assignments per heat
    heat_athlete_counts: dict[UUID, int] = {heat.id: 0 for heat in heats}
    heat_judges: dict[UUID, set[int]] = {heat.id: set() for heat in heats}
    new_assignments: list[HeatAssignments] = []

    # Track already assigned athletes to avoid reassigning them
    already_assigned_athletes: set[int] = set()

    for assignment in existing_assignments:
        if assignment.athlete_crossfit_id:
            heat_athlete_counts[assignment.heat_id] += 1
            already_assigned_athletes.add(assignment.athlete_crossfit_id)
            # Track if this athlete is a judge
            if assignment.athlete_crossfit_id in judge_crossfit_ids:
                judge_athlete_assignments[assignment.athlete_crossfit_id].append(assignment.heat_id)
        if assignment.judge_crossfit_id:
            heat_judges[assignment.heat_id].add(assignment.judge_crossfit_id)

    athletes_assigned = 0

    # Assign preferred athletes first using their start_time preferences (skip already assigned)
    preferred_list = sorted(
        (cid, data) for cid, data in preferred_athletes.items() if cid not in already_assigned_athletes
    )

    for crossfit_id, athlete_data in preferred_list:
        # Get the preferred start_time for this athlete
        preferred_start_time = preferred_start_times.get(crossfit_id, "")

        if preferred_start_time:
            # Use start_time matching for preferred athletes
            assignment, count = _assign_preferred_athlete_to_heat(
                crossfit_id,
                athlete_data,
                preferred_start_time,
                heat_athlete_counts,
                heats,
                db_session,
                judge_athlete_assignments,
            )
        else:
            # Fall back to regular preference-based assignment if no start_time
            assignment, count = _assign_athlete_to_heat(
                crossfit_id,
                athlete_data,
                heat_athlete_counts,
                db_session,
                judge_athlete_assignments,
                heats_by_pref,
            )

        if assignment:
            new_assignments.append(assignment)
            athletes_assigned += count

    # Assign preferred judges who are also athletes next (skip already assigned)
    preferred_judge_list = sorted(
        (cid, data) for cid, data in preferred_judges_after_pref.items() if cid not in already_assigned_athletes
    )

    for crossfit_id, athlete_data in preferred_judge_list:
        assignment, count = _assign_athlete_to_heat(
            crossfit_id,
            athlete_data,
            heat_athlete_counts,
            db_session,
            judge_athlete_assignments,
            heats_by_pref,
        )
        if assignment:
            new_assignments.append(assignment)
            athletes_assigned += count

    # Then, assign regular athletes (including non-preferred judges) (skip already assigned)
    athlete_list = [(cid, data) for cid, data in regular_after_pref.items() if cid not in already_assigned_athletes]
    random.shuffle(athlete_list)

    for crossfit_id, athlete_data in athlete_list:
        assignment, count = _assign_athlete_to_heat(
            crossfit_id,
            athlete_data,
            heat_athlete_counts,
            db_session,
            judge_athlete_assignments if crossfit_id in judge_crossfit_ids else None,
            heats_by_pref,
        )
        if assignment:
            new_assignments.append(assignment)
            athletes_assigned += count

    await db_session.commit()

    return {
        "heats_processed": len(heats),
        "athletes_assigned": athletes_assigned,
        "skipped_athletes": skipped_athletes,
    }


async def assign_judges_randomly(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> dict[str, Any]:
    """
    Assign judges to heats based on judge availability and athlete assignments.

    Rules:
    1. Ensure judges are not assigned to judge heats within 45 minutes of their athlete assignments
    2. Prefer assigning judges who have marked themselves as available for that time slot
    3. Distribute assignments evenly among preferred judges
    4. Avoid back-to-back judge assignments
    """
    # Get all heats for the given criteria
    heats_stmt = (
        select(Heats)
        .where(
            (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
        )
        .order_by(Heats.start_time)
    )
    heats_result = await db_session.execute(heats_stmt)
    heats = list(heats_result.scalars().all())

    if not heats:
        msg = f"No heats found for affiliate_id={affiliate_id}, year={year}, ordinal={ordinal}"
        raise not_found_exception(msg)

    # Get all judges
    judges_stmt = select(Judges)
    judges_result = await db_session.execute(judges_stmt)
    all_judges = list(judges_result.scalars().all())
    judge_crossfit_ids = {judge.crossfit_id for judge in all_judges}

    # Create a heat time index for quick lookup
    heat_times = {heat.id: heat.start_time for heat in heats}

    # Track athlete assignments for judges (to enforce buffer)
    judge_athlete_assignments: dict[int, list[UUID]] = {judge.crossfit_id: [] for judge in all_judges}

    # Get existing assignments
    existing_assignments_stmt = (
        select(HeatAssignments)
        .join(Heats, HeatAssignments.heat_id == Heats.id)
        .where(
            (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
        )
    )
    existing_result = await db_session.execute(existing_assignments_stmt)
    existing_assignments = list(existing_result.scalars().all())

    # Track current assignments per heat
    heat_judges: dict[UUID, set[int]] = {heat.id: set() for heat in heats}

    # Build judge athlete assignments map
    for assignment in existing_assignments:
        if assignment.athlete_crossfit_id and assignment.athlete_crossfit_id in judge_crossfit_ids:
            judge_athlete_assignments[assignment.athlete_crossfit_id].append(assignment.heat_id)
        if assignment.judge_crossfit_id:
            heat_judges[assignment.heat_id].add(assignment.judge_crossfit_id)
    judge_availability_stmt = select(JudgeAvailability)
    judge_availability_result = await db_session.execute(judge_availability_stmt)
    all_judge_availability = list(judge_availability_result.scalars().all())

    # Build index: judge_id -> {time_slot: available}
    judge_availability_map: dict[UUID, dict[str, bool]] = {}
    for avail in all_judge_availability:
        if avail.judge_id not in judge_availability_map:
            judge_availability_map[avail.judge_id] = {}
        judge_availability_map[avail.judge_id][avail.time_slot] = avail.available

    # Track judge assignments for back-to-back checking
    judge_judging_assignments: dict[int, list[UUID]] = {judge.crossfit_id: [] for judge in all_judges}

    # Track total assignment counts per judge for load balancing
    judge_assignment_counts: dict[int, int] = {judge.crossfit_id: 0 for judge in all_judges}

    # Track existing judge assignments
    for assignment in existing_assignments:
        if assignment.judge_crossfit_id:
            judge_judging_assignments[assignment.judge_crossfit_id].append(assignment.heat_id)
            judge_assignment_counts[assignment.judge_crossfit_id] += 1

    judges_assigned = 0

    # Assign judges to every athlete assignment that doesn't have a judge yet
    slots_needing_judges = [
        assignment
        for assignment in existing_assignments
        if assignment.athlete_crossfit_id is not None and assignment.judge_crossfit_id is None
    ]

    for assignment in slots_needing_judges:
        # Get the heat for this assignment to check time
        heat = next((h for h in heats if h.id == assignment.heat_id), None)
        if not heat:
            continue

        # Get the time slot for this heat
        time_slot = _get_time_slot_for_heat(heat.start_time)

        candidate_judges = [
            judge
            for judge in all_judges
            if judge.crossfit_id not in heat_judges[assignment.heat_id]
            and _can_judge_be_assigned(
                judge.crossfit_id,
                assignment.heat_id,
                judge_athlete_assignments,
                heat_times,
                heats,
            )
            and not _has_back_to_back_assignment(
                judge.crossfit_id,
                assignment.heat_id,
                judge_judging_assignments,
                heat_times,
            )
            and (
                judge.id not in judge_availability_map
                or time_slot not in judge_availability_map[judge.id]
                or judge_availability_map[judge.id][time_slot]
            )
        ]

        if not candidate_judges:
            continue

        # Separate preferred and non-preferred judges
        preferred_judges = [j for j in candidate_judges if j.preferred]
        non_preferred_judges = [j for j in candidate_judges if not j.preferred]

        # For preferred judges, select the one with the fewest current assignments
        # This ensures even distribution among preferred judges
        if preferred_judges:
            # Find the minimum assignment count among preferred judges
            min_assignments = min(judge_assignment_counts[j.crossfit_id] for j in preferred_judges)
            # Get all preferred judges with this minimum count
            least_assigned_preferred = [
                j for j in preferred_judges if judge_assignment_counts[j.crossfit_id] == min_assignments
            ]
            # Randomly select from judges with equal minimum assignments
            chosen_judge = random.choice(least_assigned_preferred)  # noqa: S311
        elif non_preferred_judges:
            # If no preferred judges available, fall back to non-preferred with fewest assignments
            min_assignments = min(judge_assignment_counts[j.crossfit_id] for j in non_preferred_judges)
            least_assigned_non_preferred = [
                j for j in non_preferred_judges if judge_assignment_counts[j.crossfit_id] == min_assignments
            ]
            chosen_judge = random.choice(least_assigned_non_preferred)  # noqa: S311
        else:
            continue

        assignment.judge_crossfit_id = chosen_judge.crossfit_id
        assignment.judge_name = chosen_judge.name
        heat_judges[assignment.heat_id].add(chosen_judge.crossfit_id)
        judge_judging_assignments[chosen_judge.crossfit_id].append(assignment.heat_id)
        judge_assignment_counts[chosen_judge.crossfit_id] += 1
        judges_assigned += 1
        log.info(
            "Assigned judge %s to heat %s for athlete %s (total assignments: %d)",
            chosen_judge.name,
            assignment.heat_id,
            assignment.athlete_name,
            judge_assignment_counts[chosen_judge.crossfit_id],
        )

    await db_session.commit()

    return {
        "heats_processed": len(heats),
        "judges_assigned": judges_assigned,
    }


async def get_db_heat_attendance(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    """Get heat attendance summary for heats matching affiliate_id, year, and ordinal."""
    stmt = (
        select(HeatAssignments.athlete_name, HeatAssignments.athlete_crossfit_id, Heats.start_time, FirebaseUser.email)
        .join_from(
            HeatAssignments,
            Heats,
            HeatAssignments.heat_id == Heats.id,
        )
        .join_from(
            HeatAssignments,
            FirebaseUser,
            HeatAssignments.athlete_crossfit_id == FirebaseUser.crossfit_id,
            isouter=True,
        )
        .where(
            (Heats.affiliate_id == affiliate_id) & (Heats.year == year) & (Heats.ordinal == ordinal),
        )
    )
    result = await db_session.execute(stmt)
    attendance = result.mappings().all()

    return [dict(row) for row in attendance]
