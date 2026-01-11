from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import not_found_exception
from app.judges.models import Judges

from .models import PreferredAthletes
from .schemas import PreferredAthleteCreate, PreferredAthleteUpdate


def _to_dict(record: PreferredAthletes) -> dict[str, Any]:
    return {
        "id": record.id,
        "affiliate_id": record.affiliate_id,
        "crossfit_id": record.crossfit_id,
        "name": record.name,
        "start_time": record.start_time,
    }


async def get_all_preferred_athletes(db_session: AsyncSession, affiliate_id: int) -> list[dict[str, Any]]:
    stmt = (
        select(PreferredAthletes).where(PreferredAthletes.affiliate_id == affiliate_id).order_by(PreferredAthletes.name)
    )
    result = await db_session.execute(stmt)
    records = result.scalars().all()
    return [_to_dict(rec) for rec in records]


async def get_preferred_athlete(db_session: AsyncSession, affiliate_id: int, crossfit_id: int) -> dict[str, Any]:
    record = await PreferredAthletes.find(async_session=db_session, affiliate_id=affiliate_id, crossfit_id=crossfit_id)
    if not record:
        msg = f"Preferred athlete not found for crossfit_id={crossfit_id}"
        raise not_found_exception(msg)
    return _to_dict(record)


async def create_preferred_athlete(
    db_session: AsyncSession,
    data: PreferredAthleteCreate,
) -> dict[str, Any]:
    record = await PreferredAthletes.find(
        async_session=db_session,
        affiliate_id=data.affiliate_id,
        crossfit_id=data.crossfit_id,
    )
    if record:
        # Replace the name and start_time if already present to keep id stable
        record.name = data.name
        record.start_time = data.start_time
    else:
        record = PreferredAthletes(
            affiliate_id=data.affiliate_id,
            crossfit_id=data.crossfit_id,
            name=data.name,
            start_time=data.start_time,
        )
        db_session.add(record)

    await db_session.commit()
    await db_session.refresh(record)
    return _to_dict(record)


async def update_preferred_athlete(
    db_session: AsyncSession,
    affiliate_id: int,
    crossfit_id: int,
    data: PreferredAthleteUpdate,
) -> dict[str, Any]:
    record = await PreferredAthletes.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        crossfit_id=crossfit_id,
    )

    if data.affiliate_id is not None:
        record.affiliate_id = data.affiliate_id
    if data.crossfit_id is not None:
        record.crossfit_id = data.crossfit_id
    if data.name is not None:
        record.name = data.name
    if data.start_time is not None:
        record.start_time = data.start_time

    db_session.add(record)
    await db_session.commit()
    await db_session.refresh(record)
    return _to_dict(record)


async def delete_preferred_athlete(db_session: AsyncSession, affiliate_id: int, crossfit_id: int) -> None:
    record = await PreferredAthletes.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        crossfit_id=crossfit_id,
    )
    await record.delete(async_session=db_session)


async def initialize_preferred_athletes_from_judges(db_session: AsyncSession, affiliate_id: int) -> dict[str, int]:
    """Populate PreferredAthletes from Judges, upserting by crossfit_id."""
    stmt = select(Judges).where(Judges.affiliate_id == affiliate_id).order_by(Judges.name)
    result = await db_session.execute(stmt)
    judges = result.scalars().all()

    processed = 0
    inserted = 0
    updated = 0

    for judge in judges:
        processed += 1
        existing = await PreferredAthletes.find(
            async_session=db_session,
            affiliate_id=affiliate_id,
            crossfit_id=judge.crossfit_id,
        )
        if existing:
            if existing.name != judge.name:
                existing.name = judge.name
                db_session.add(existing)
                updated += 1
        else:
            new_pref = PreferredAthletes(
                affiliate_id=affiliate_id,
                crossfit_id=judge.crossfit_id,
                name=judge.name,
                start_time="",
            )
            db_session.add(new_pref)
            inserted += 1

    await db_session.commit()

    return {
        "processed": processed,
        "inserted": inserted,
        "updated": updated,
    }
