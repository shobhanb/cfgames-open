from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.score.models import Score

from .models import Events
from .schemas import EventsCreate, EventsUpdate


async def get_db_events_with_data(db_session: AsyncSession, affiliate_id: int) -> Sequence[Events]:
    stmt = (
        select(Events)
        .distinct()
        .join_from(Events, Score, (Events.year == Score.year) & (Events.ordinal == Score.ordinal))
        .join_from(Score, Athlete, (Score.year == Athlete.year) & (Score.crossfit_id == Athlete.crossfit_id))
        .where(Athlete.affiliate_id == affiliate_id)
        .order_by(Events.year.desc(), Events.ordinal.asc())
    )
    results = await db_session.execute(stmt)
    return results.scalars().all()


async def get_all_events(db_session: AsyncSession) -> Sequence[Events]:
    stmt = select(Events).order_by(Events.year.desc(), Events.ordinal.desc())
    results = await db_session.execute(stmt)
    return results.scalars().all()


async def get_events(
    db_session: AsyncSession,
    year: int,
) -> Sequence[Events]:
    return await Events.find_all(async_session=db_session, year=year)


async def create_event(
    db_session: AsyncSession,
    event_data: EventsCreate,
) -> Events:
    new_event = Events(
        year=event_data.year,
        ordinal=event_data.ordinal,
        event=event_data.event,
    )
    db_session.add(new_event)
    await db_session.commit()
    await db_session.refresh(new_event)
    return new_event


async def update_event(
    db_session: AsyncSession,
    year: int,
    ordinal: int,
    event_data: EventsUpdate,
) -> Events:
    event = await Events.find_or_raise(async_session=db_session, year=year, ordinal=ordinal)

    if event_data.event is not None:
        event.event = event_data.event

    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)
    return event


async def delete_event(
    db_session: AsyncSession,
    year: int,
    ordinal: int,
) -> None:
    event = await Events.find_or_raise(async_session=db_session, year=year, ordinal=ordinal)
    await event.delete(async_session=db_session)
