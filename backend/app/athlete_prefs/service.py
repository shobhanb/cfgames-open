from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .constants import TIME_PREFS
from .models import AthleteTimePref
from .schemas import AthletePrefsModel

log = logging.getLogger("uvicorn.error")


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
