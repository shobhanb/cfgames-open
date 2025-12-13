import logging
from collections.abc import Sequence

from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .constants import EVENTS
from .models import Events
from .schemas import EventsCreate, EventsModel, EventsUpdate
from .service import (
    create_event,
    delete_event,
    get_all_events,
    get_db_events_with_data,
    update_event,
)

log = logging.getLogger("uvicorn.error")

cf_events_router = APIRouter(prefix="/cfevents", tags=["cfevents"])


@cf_events_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[EventsModel],
)
async def get_events_with_data(
    db_session: db_dependency,
    affiliate_id: int,
) -> Sequence[Events]:
    return await get_db_events_with_data(db_session=db_session, affiliate_id=affiliate_id)


@cf_events_router.post(
    "/initialize",
    status_code=status.HTTP_201_CREATED,
)
async def add_update_cfevents(
    db_session: db_dependency,
    api_key_admin: api_key_admin_dependency,
) -> None:
    if api_key_admin:
        for item in EVENTS:
            event_data = EventsModel.model_validate(item)
            existing_event = await Events.find(
                async_session=db_session,
                year=event_data.year,
                ordinal=event_data.ordinal,
            )
            if existing_event:
                existing_event.event = event_data.event
                db_session.add(existing_event)
                await db_session.commit()
            else:
                new_event = Events(**event_data.model_dump())
                db_session.add(new_event)
                await db_session.commit()


@cf_events_router.get(
    "/all",
    status_code=status.HTTP_200_OK,
    response_model=list[EventsModel],
)
async def get_all_cfevents(
    db_session: db_dependency,
) -> Sequence[Events]:
    """Get all events regardless of affiliate data."""
    return await get_all_events(db_session=db_session)


@cf_events_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=EventsModel,
)
async def create_cfevent(
    db_session: db_dependency,
    _: admin_user_dependency,
    event_data: EventsCreate,
) -> Events:
    """Create a new event."""
    return await create_event(db_session=db_session, event_data=event_data)


@cf_events_router.patch(
    "/{year}/{ordinal}/",
    status_code=status.HTTP_200_OK,
    response_model=EventsModel,
)
async def update_cfevent(
    db_session: db_dependency,
    _: admin_user_dependency,
    year: int,
    ordinal: int,
    event_data: EventsUpdate,
) -> Events:
    """Update an existing event."""
    return await update_event(db_session=db_session, year=year, ordinal=ordinal, event_data=event_data)


@cf_events_router.delete(
    "/{year}/{ordinal}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_cfevent(
    db_session: db_dependency,
    _: admin_user_dependency,
    year: int,
    ordinal: int,
) -> None:
    """Delete an event."""
    await delete_event(db_session=db_session, year=year, ordinal=ordinal)
