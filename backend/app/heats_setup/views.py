import logging
from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .constants import HEATS_SETUP
from .models import HeatsSetup
from .schemas import HeatsSetupCreate, HeatsSetupModel, HeatsSetupUpdate
from .service import (
    create_heats_setup,
    delete_heats_setup,
    get_all_heats_setup,
    get_heats_setup,
    get_heats_setup_by_affiliate,
    update_heats_setup,
)

log = logging.getLogger("uvicorn.error")

heats_setup_router = APIRouter(prefix="/heats_setup", tags=["heats_setup"])


@heats_setup_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[HeatsSetupModel],
)
async def get_heats_setup_list(
    db_session: db_dependency,
    _: admin_user_dependency,
) -> Sequence[HeatsSetup]:
    """Get all heats setup configurations."""
    return await get_all_heats_setup(db_session=db_session)


@heats_setup_router.post(
    "/initialize",
    status_code=status.HTTP_201_CREATED,
)
async def initialize_heats_setup(
    db_session: db_dependency,
    _: api_key_admin_dependency,
) -> None:
    """Initialize heats setup from constants with validation."""
    for item in HEATS_SETUP:
        heat_data = HeatsSetupCreate.model_validate(item)
        existing_heat = await HeatsSetup.find(
            async_session=db_session,
            affiliate_id=heat_data.affiliate_id,
            short_name=heat_data.short_name,
        )
        if existing_heat:
            existing_heat.start_time = heat_data.start_time
            existing_heat.end_time = heat_data.end_time
            existing_heat.interval = heat_data.interval
            existing_heat.max_athletes = heat_data.max_athletes
            db_session.add(existing_heat)
            await db_session.commit()
        else:
            new_heat = HeatsSetup(**heat_data.model_dump(exclude={"id"}))
            db_session.add(new_heat)
            await db_session.commit()


@heats_setup_router.get(
    "/affiliate/{affiliate_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[HeatsSetupModel],
)
async def get_heats_setup_by_affiliate_id(
    db_session: db_dependency,
    affiliate_id: int,
    _: admin_user_dependency,
) -> Sequence[HeatsSetup]:
    """Get all heats setup for a specific affiliate."""
    return await get_heats_setup_by_affiliate(db_session=db_session, affiliate_id=affiliate_id)


@heats_setup_router.get(
    "/{heat_id}",
    status_code=status.HTTP_200_OK,
    response_model=HeatsSetupModel,
)
async def get_heats_setup_by_id(
    db_session: db_dependency,
    heat_id: UUID,
    _: admin_user_dependency,
) -> HeatsSetup | None:
    """Get a specific heats setup by ID."""
    return await get_heats_setup(db_session=db_session, heat_id=heat_id)


@heats_setup_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=HeatsSetupModel,
)
async def create_new_heats_setup(
    db_session: db_dependency,
    heat_data: HeatsSetupCreate,
    _: admin_user_dependency,
) -> HeatsSetup:
    """Create a new heats setup configuration."""
    return await create_heats_setup(db_session=db_session, heat_data=heat_data)


@heats_setup_router.patch(
    "/{heat_id}",
    status_code=status.HTTP_200_OK,
    response_model=HeatsSetupModel,
)
async def update_existing_heats_setup(
    db_session: db_dependency,
    heat_id: UUID,
    heat_data: HeatsSetupUpdate,
    _: admin_user_dependency,
) -> HeatsSetup:
    """Update an existing heats setup configuration."""
    return await update_heats_setup(
        db_session=db_session,
        heat_id=heat_id,
        heat_data=heat_data,
    )


@heats_setup_router.delete(
    "/{heat_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_heats_setup(
    db_session: db_dependency,
    heat_id: UUID,
    _: admin_user_dependency,
) -> None:
    """Delete a heats setup configuration."""
    await delete_heats_setup(db_session=db_session, heat_id=heat_id)
