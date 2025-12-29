import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.exceptions import not_found_exception
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency
from app.judges.models import Judges

from .schemas import (
    JudgeAvailabilityCreate,
    JudgeAvailabilityModel,
    JudgeAvailabilityUpdate,
)
from .service import (
    create_judge_availability,
    delete_judge_availability,
    get_all_judge_availabilities,
    get_judge_availabilities_by_judge,
    get_judge_availability,
    update_judge_availability,
)

log = logging.getLogger("uvicorn.error")

judge_availability_router = APIRouter(
    prefix="/judge-availability",
    tags=["judge-availability"],
)


@judge_availability_router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    response_model=list[JudgeAvailabilityModel],
)
async def get_my_judge_availability(
    db_session: db_dependency,
    user: verified_user_dependency,
) -> list[dict[str, Any]]:
    """Get all judge availabilities."""
    judge = await Judges.find_or_raise(async_session=db_session, crossfit_id=user.crossfit_id)
    if not judge:
        msg = f"Judge with CrossFit ID {user.crossfit_id} not found."
        raise not_found_exception(detail=msg)
    return await get_availabilities_by_judge_id(db_session=db_session, judge_id=judge.id)


@judge_availability_router.patch(
    "/me/{availability_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgeAvailabilityModel,
)
async def update_my_judge_availability(
    db_session: db_dependency,
    user: verified_user_dependency,
    availability_id: UUID,
    availability_data: JudgeAvailabilityUpdate,
) -> dict[str, Any]:
    """Update an existing judge availability."""
    judge = await Judges.find_or_raise(async_session=db_session, crossfit_id=user.crossfit_id)
    if not judge:
        msg = f"Judge with CrossFit ID {user.crossfit_id} not found."
        raise not_found_exception(detail=msg)

    existing_availability = await get_judge_availability(db_session=db_session, availability_id=availability_id)
    if existing_availability["judge_id"] != judge.id:
        msg = "You do not have permission to update this availability."
        raise not_found_exception(detail=msg)

    return await update_judge_availability(
        db_session=db_session,
        availability_id=availability_id,
        availability_data=availability_data,
    )


@judge_availability_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[JudgeAvailabilityModel],
)
async def get_judge_availabilities_list(
    db_session: db_dependency,
) -> list[dict[str, Any]]:
    """Get all judge availabilities."""
    return await get_all_judge_availabilities(db_session=db_session)


@judge_availability_router.get(
    "/{availability_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgeAvailabilityModel,
)
async def get_judge_availability_by_id(
    db_session: db_dependency,
    availability_id: UUID,
) -> dict[str, Any]:
    """Get a judge availability by ID."""
    return await get_judge_availability(
        db_session=db_session,
        availability_id=availability_id,
    )


@judge_availability_router.get(
    "/judge/{judge_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[JudgeAvailabilityModel],
)
async def get_availabilities_by_judge_id(
    db_session: db_dependency,
    judge_id: UUID,
) -> list[dict[str, Any]]:
    """Get all availabilities for a specific judge."""
    return await get_judge_availabilities_by_judge(
        db_session=db_session,
        judge_id=judge_id,
    )


@judge_availability_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=JudgeAvailabilityModel,
)
async def create_new_judge_availability(
    db_session: db_dependency,
    _: admin_user_dependency,
    availability_data: JudgeAvailabilityCreate,
) -> dict[str, Any]:
    """Create a new judge availability."""
    return await create_judge_availability(
        db_session=db_session,
        availability_data=availability_data,
    )


@judge_availability_router.patch(
    "/{availability_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgeAvailabilityModel,
)
async def update_existing_judge_availability(
    db_session: db_dependency,
    _: admin_user_dependency,
    availability_id: UUID,
    availability_data: JudgeAvailabilityUpdate,
) -> dict[str, Any]:
    """Update an existing judge availability."""
    return await update_judge_availability(
        db_session=db_session,
        availability_id=availability_id,
        availability_data=availability_data,
    )


@judge_availability_router.delete(
    "/{availability_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_judge_availability(
    db_session: db_dependency,
    _: admin_user_dependency,
    availability_id: UUID,
) -> None:
    """Delete a judge availability."""
    await delete_judge_availability(
        db_session=db_session,
        availability_id=availability_id,
    )
