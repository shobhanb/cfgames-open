import logging
from collections.abc import Sequence

from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency

from .constants import EVENTS
from .models import Events
from .schemas import EventsModel
from .service import get_events_with_data

log = logging.getLogger("uvicorn.error")

cf_events_router = APIRouter(prefix="/cfevents", tags=["cfevents"])


@cf_events_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[EventsModel],
)
async def get_cfevents(
    db_session: db_dependency,
    affiliate_id: int,
) -> Sequence[Events]:
    return await get_events_with_data(db_session=db_session, affiliate_id=affiliate_id)


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
