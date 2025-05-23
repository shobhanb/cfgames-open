from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.athlete_prefs.constants import TIME_PREFS
from app.athlete_prefs.models import AthleteTimePref

log = logging.getLogger("uvicorn.error")


async def get_db_athlete_prefs(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[dict[str, Any]]:
    time_pref_stmt = (
        select(
            Athlete.name,
            AthleteTimePref.athlete_id,
            AthleteTimePref.preference_nbr,
            AthleteTimePref.preference,
        )
        .join_from(
            AthleteTimePref,
            Athlete,
            AthleteTimePref.athlete_id == Athlete.id,
        )
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )
    ret = await db_session.execute(time_pref_stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def assign_db_athlete_prefs(
    db_session: AsyncSession,
    athlete_id: UUID,
) -> None:
    time_pref_exists = await AthleteTimePref.find(async_session=db_session, athlete_id=athlete_id)
    if not time_pref_exists:
        for nbr, pref in enumerate(TIME_PREFS):
            time_pref = AthleteTimePref(athlete_id=athlete_id, preference_nbr=nbr, preference=pref)
            db_session.add(time_pref)

    await db_session.commit()
