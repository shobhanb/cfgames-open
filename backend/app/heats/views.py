import datetime as dt
import logging
from collections.abc import Sequence

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .models import Heats
from .schemas import (
    HeatsCreate,
    HeatsModel,
    HeatsUpdate,
    ToggleLockedRequest,
    TogglePublishedRequest,
    ToggleResponse,
)
from .service import (
    create_heat,
    create_heats_based_on_setup,
    delete_heat,
    delete_heats_by_criteria,
    get_heat,
    get_heats_by_criteria,
    toggle_heat_assignments_locked,
    toggle_heat_assignments_published,
    update_heat,
)

log = logging.getLogger("uvicorn.error")

heats_router = APIRouter(prefix="/heats", tags=["heats"])


@heats_router.get(
    "/filter/{year}/{affiliate_id}/{ordinal}",
    status_code=status.HTTP_200_OK,
    response_model=list[HeatsModel],
)
async def get_heats_by_filter(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    is_locked: bool | None = None,
    is_published: bool | None = None,
) -> Sequence[Heats]:
    """Get all heats for a specific affiliate, year, and ordinal."""
    return await get_heats_by_criteria(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@heats_router.get(
    "/{year}/{affiliate_id}/{ordinal}/{start_time}",
    status_code=status.HTTP_200_OK,
    response_model=HeatsModel,
)
async def get_heat_by_id(
    db_session: db_dependency,
    _: verified_user_dependency,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Heats | None:
    """Get a specific heat by its composite primary key."""
    return await get_heat(
        db_session=db_session,
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@heats_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=HeatsModel,
)
async def create_new_heat(
    db_session: db_dependency,
    _: admin_user_dependency,
    heat_data: HeatsCreate,
) -> Heats:
    """Create a new heat."""
    return await create_heat(db_session=db_session, heat_data=heat_data)


@heats_router.post(
    "/generate",
    status_code=status.HTTP_201_CREATED,
    response_model=list[HeatsModel],
)
async def generate_heats_from_setup(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Sequence[Heats]:
    """Generate heats based on the affiliate's predefined setup for an event."""
    return await create_heats_based_on_setup(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@heats_router.patch(
    "/{year}/{affiliate_id}/{ordinal}/{start_time}",
    status_code=status.HTTP_200_OK,
    response_model=HeatsModel,
)
async def update_existing_heat(
    db_session: db_dependency,
    _: admin_user_dependency,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
    heat_data: HeatsUpdate,
) -> Heats:
    """Update an existing heat."""
    return await update_heat(
        db_session=db_session,
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
        heat_data=heat_data,
    )


@heats_router.delete(
    "/{year}/{affiliate_id}/{ordinal}/{start_time}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_heat(
    db_session: db_dependency,
    _: admin_user_dependency,
    start_time: dt.datetime,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> None:
    """Delete a heat."""
    await delete_heat(
        db_session=db_session,
        start_time=start_time,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@heats_router.delete(
    "/bulk",
    status_code=status.HTTP_200_OK,
)
async def delete_heats_bulk(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> dict[str, int]:
    """Delete all heats for a specific affiliate, year, and ordinal."""
    count = await delete_heats_by_criteria(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )
    return {"deleted_count": count}


@heats_router.post(
    "/toggle-published",
    status_code=status.HTTP_200_OK,
    response_model=ToggleResponse,
)
async def toggle_published(
    db_session: db_dependency,
    _: admin_user_dependency,
    request: TogglePublishedRequest,
) -> dict[str, int | str]:
    """Toggle the published status of all heat assignments for a specific heat."""
    return await toggle_heat_assignments_published(
        db_session=db_session,
        heat_id=request.heat_id,
        published=request.published,
    )


@heats_router.post(
    "/toggle-locked",
    status_code=status.HTTP_200_OK,
    response_model=ToggleResponse,
)
async def toggle_locked(
    db_session: db_dependency,
    _: admin_user_dependency,
    request: ToggleLockedRequest,
) -> dict[str, int | str]:
    """Toggle the locked status of all heat assignments for a specific heat."""
    return await toggle_heat_assignments_locked(
        db_session=db_session,
        heat_id=request.heat_id,
        locked=request.locked,
    )
