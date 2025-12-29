import logging
from typing import Any
from uuid import UUID

from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .schemas import JudgesCreate, JudgesModel, JudgesUpdate
from .service import (
    create_judge,
    delete_judge,
    get_all_judges,
    get_judge,
    get_judge_by_crossfit_id,
    initialize_judges,
    update_judge,
)

log = logging.getLogger("uvicorn.error")

judges_router = APIRouter(prefix="/judges", tags=["judges"])


@judges_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[JudgesModel],
)
async def get_judges_list(
    db_session: db_dependency,
) -> list[dict[str, Any]]:
    """Get all judges."""
    return await get_all_judges(db_session=db_session)


@judges_router.get(
    "/{judge_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgesModel,
)
async def get_judge_by_id(
    db_session: db_dependency,
    judge_id: UUID,
) -> dict[str, Any]:
    """Get a judge by ID."""
    return await get_judge(db_session=db_session, judge_id=judge_id)


@judges_router.get(
    "/crossfit_id/{crossfit_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgesModel,
)
async def get_judge_by_id_crossfit(
    db_session: db_dependency,
    crossfit_id: int,
) -> dict[str, Any]:
    """Get a judge by crossfit_id."""
    return await get_judge_by_crossfit_id(db_session=db_session, crossfit_id=crossfit_id)


@judges_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=JudgesModel,
)
async def create_new_judge(
    db_session: db_dependency,
    _: admin_user_dependency,
    judge_data: JudgesCreate,
) -> dict[str, Any]:
    """Create a new judge."""
    return await create_judge(db_session=db_session, judge_data=judge_data)


@judges_router.patch(
    "/{judge_id}",
    status_code=status.HTTP_200_OK,
    response_model=JudgesModel,
)
async def update_existing_judge(
    db_session: db_dependency,
    _: admin_user_dependency,
    judge_id: UUID,
    judge_data: JudgesUpdate,
) -> dict[str, Any]:
    """Update an existing judge."""
    return await update_judge(
        db_session=db_session,
        judge_id=judge_id,
        judge_data=judge_data,
    )


@judges_router.delete(
    "/{judge_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_judge(
    db_session: db_dependency,
    _: admin_user_dependency,
    judge_id: UUID,
) -> None:
    """Delete a judge."""
    await delete_judge(db_session=db_session, judge_id=judge_id)


@judges_router.post(
    "/initialize/{affiliate_id}/{year}",
    status_code=status.HTTP_200_OK,
)
async def init_judges(
    db_session: db_dependency,
    _: api_key_admin_dependency,
    affiliate_id: int,
    year: int,
) -> dict[str, str]:
    """Initialize judge information for all athletes based on scoring history."""
    await initialize_judges(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
    )
    return {"message": "Judge information initialized successfully"}
