from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from athlete_prefs_2025 import ATHLETE_PREFS_2025

from .constants import TIME_PREFS
from .models import AthleteTimePref
from .schemas import AthletePrefsModel

log = logging.getLogger("uvicorn.error")


def _convert_preference_format(pref: str) -> str:
    """Convert preference from format like 'Sat 7am' to 'Sat AM'."""
    parts = pref.split()
    if len(parts) != 2:
        return "NA"

    day = parts[0]  # e.g., "Sat"
    time = parts[1].lower()  # e.g., "7am"

    # Extract AM/PM from the time
    if "am" in time:
        period = "AM"
    elif "pm" in time:
        period = "PM"
    else:
        return "NA"

    result = f"{day} {period}"

    # Validate against TIME_PREFS
    if result in TIME_PREFS:
        return result

    return "NA"


async def get_db_athlete_prefs(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    time_pref_stmt = (
        select(
            Athlete.name,
            Athlete.gender,
            Athlete.age_category,
            AthleteTimePref.crossfit_id,
            AthleteTimePref.preference_nbr,
            AthleteTimePref.preference,
        )
        .join_from(
            AthleteTimePref,
            Athlete,
            AthleteTimePref.crossfit_id == Athlete.crossfit_id,
        )
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )
    ret = await db_session.execute(time_pref_stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def init_assign_db_athlete_prefs(
    db_session: AsyncSession,
    crossfit_id: int,
) -> None:
    time_pref_exists = await AthleteTimePref.find(async_session=db_session, crossfit_id=crossfit_id)
    if not time_pref_exists:
        for nbr, pref in enumerate(TIME_PREFS):
            time_pref = AthleteTimePref(crossfit_id=crossfit_id, preference_nbr=nbr, preference=pref)
            db_session.add(time_pref)

    await db_session.commit()


async def update_db_user_prefs(
    db_session: AsyncSession,
    crossfit_id: int,
    prefs: list[AthletePrefsModel],
) -> None:
    delete_stmt = delete(AthleteTimePref).where(AthleteTimePref.crossfit_id == crossfit_id)
    await db_session.execute(delete_stmt)

    for pref_data in prefs:
        db_session.add(AthleteTimePref(**pref_data.model_dump(), crossfit_id=crossfit_id))

    await db_session.commit()


async def initialize_2025_prefs(db_session: AsyncSession) -> dict[str, Any]:
    """Initialize athlete preferences for 2025 from the athlete_prefs_2025 file."""

    # Track statistics
    processed = 0
    inserted = 0
    skipped = 0
    errors = 0

    # Group by crossfit_id to avoid duplicates
    athlete_prefs_map: dict[int, list[str]] = {}

    for entry in ATHLETE_PREFS_2025:
        try:
            preference_raw = entry[1]
            crossfit_id = int(entry[2])

            # Convert preference format
            preference = _convert_preference_format(preference_raw)

            # Group by crossfit_id
            if crossfit_id not in athlete_prefs_map:
                athlete_prefs_map[crossfit_id] = []

            if preference not in athlete_prefs_map[crossfit_id]:
                athlete_prefs_map[crossfit_id].append(preference)

            processed += 1

            for pref in TIME_PREFS:
                if pref not in athlete_prefs_map[crossfit_id]:
                    athlete_prefs_map[crossfit_id].append(pref)

        except (IndexError, ValueError):
            log.exception("Error processing entry: %s", entry)
            errors += 1
            continue

    # Insert into database
    for crossfit_id, prefs in athlete_prefs_map.items():
        delete_stmt = delete(AthleteTimePref).where(AthleteTimePref.crossfit_id == crossfit_id)
        await db_session.execute(delete_stmt)
        await db_session.commit()

        for idx, pref in enumerate(prefs):
            # Insert preferences
            new_pref = AthleteTimePref(
                crossfit_id=crossfit_id,
                preference_nbr=idx,
                preference=pref,
            )
            db_session.add(new_pref)
            inserted += 1

    await db_session.commit()

    return {
        "processed": processed,
        "inserted": inserted,
        "skipped": skipped,
        "errors": errors,
        "athletes": len(athlete_prefs_map),
    }
