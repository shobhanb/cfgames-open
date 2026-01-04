from typing import Any
from uuid import UUID

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .schemas import (
    DeleteAssignmentsByCriteriaRequest,
    DeleteAssignmentsByCriteriaResponse,
    HeatAssignmentCreate,
    HeatAssignmentModel,
    HeatAssignmentUpdate,
    RandomAssignmentRequest,
    RandomAssignmentResponse,
)
from .service import (
    assign_athletes_and_judges_randomly,
    clear_athlete_from_assignment,
    clear_judge_from_assignment,
    create_heat_assignment,
    delete_heat_assignment,
    delete_heat_assignments_by_criteria,
    get_all_heat_assignments,
    get_heat_assignment,
    get_my_db_heat_assignment_athlete,
    get_my_db_heat_assignments_judge,
    update_heat_assignment,
)

heat_assignments_router = APIRouter(prefix="/heat_assignments", tags=["heat_assignments"])


@heat_assignments_router.get(
    "/me-athlete",
    status_code=status.HTTP_200_OK,
    response_model=HeatAssignmentModel,
)
async def get_my_heat_assignments_athlete(
    db_session: db_dependency,
    user: verified_user_dependency,
    year: int,
    ordinal: int,
) -> dict[str, Any]:
    """Get heat assignments for the authenticated athlete."""
    return await get_my_db_heat_assignment_athlete(
        db_session=db_session,
        crossfit_id=user.crossfit_id,
        year=year,
        ordinal=ordinal,
    )


@heat_assignments_router.get(
    "/me-judge",
    status_code=status.HTTP_200_OK,
    response_model=list[HeatAssignmentModel],
)
async def get_my_heat_assignments_judge(
    db_session: db_dependency,
    user: verified_user_dependency,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    """Get heat assignments for the authenticated judge."""
    return await get_my_db_heat_assignments_judge(
        db_session=db_session,
        crossfit_id=user.crossfit_id,
        year=year,
        ordinal=ordinal,
    )


@heat_assignments_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[HeatAssignmentModel],
)
async def get_heat_assignments_list(
    db_session: db_dependency,
    heat_id: UUID | None = None,
) -> list[dict[str, Any]]:
    """Get all heat assignments, optionally filtered by heat_id."""
    return await get_all_heat_assignments(db_session=db_session, heat_id=heat_id)


@heat_assignments_router.get(
    "/{assignment_id}",
    status_code=status.HTTP_200_OK,
    response_model=HeatAssignmentModel,
)
async def get_heat_assignment_by_id(
    db_session: db_dependency,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Get a heat assignment by ID."""
    return await get_heat_assignment(db_session=db_session, assignment_id=assignment_id)


@heat_assignments_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=HeatAssignmentModel,
)
async def create_new_heat_assignment(
    db_session: db_dependency,
    _: admin_user_dependency,
    assignment_data: HeatAssignmentCreate,
) -> dict[str, Any]:
    """Create a new heat assignment."""
    return await create_heat_assignment(db_session=db_session, assignment_data=assignment_data)


@heat_assignments_router.patch(
    "/{assignment_id}",
    status_code=status.HTTP_200_OK,
    response_model=HeatAssignmentModel,
)
async def update_existing_heat_assignment(
    db_session: db_dependency,
    _: admin_user_dependency,
    assignment_id: UUID,
    assignment_data: HeatAssignmentUpdate,
) -> dict[str, Any]:
    """Update an existing heat assignment."""
    return await update_heat_assignment(
        db_session=db_session,
        assignment_id=assignment_id,
        assignment_data=assignment_data,
    )


@heat_assignments_router.patch(
    "/{assignment_id}/clear-athlete",
    status_code=status.HTTP_200_OK,
    response_model=HeatAssignmentModel,
)
async def clear_athlete(
    db_session: db_dependency,
    _: admin_user_dependency,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Clear the athlete assignment from a heat assignment."""
    return await clear_athlete_from_assignment(
        db_session=db_session,
        assignment_id=assignment_id,
    )


@heat_assignments_router.patch(
    "/{assignment_id}/clear-judge",
    status_code=status.HTTP_200_OK,
    response_model=HeatAssignmentModel,
)
async def clear_judge(
    db_session: db_dependency,
    _: admin_user_dependency,
    assignment_id: UUID,
) -> dict[str, Any]:
    """Clear the judge assignment from a heat assignment."""
    return await clear_judge_from_assignment(
        db_session=db_session,
        assignment_id=assignment_id,
    )


@heat_assignments_router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_existing_heat_assignment(
    db_session: db_dependency,
    _: admin_user_dependency,
    assignment_id: UUID,
) -> None:
    """Delete a heat assignment."""
    await delete_heat_assignment(db_session=db_session, assignment_id=assignment_id)


@heat_assignments_router.post(
    "/assign-random",
    status_code=status.HTTP_200_OK,
    response_model=RandomAssignmentResponse,
)
async def assign_athletes_and_judges(
    db_session: db_dependency,
    _: admin_user_dependency,
    request: RandomAssignmentRequest,
) -> dict[str, Any]:
    """
    Randomly assign athletes and judges to heats based on preferences.

    Rules:
    - Athletes with "NA" at preference_nbr 0 are skipped
    - Judges are assigned as athletes first (priority)
    - Judges cannot be assigned to judge heats within 45 minutes of their athlete assignments
    - Respects max_athletes limit of each heat
    """
    return await assign_athletes_and_judges_randomly(
        db_session=db_session,
        affiliate_id=request.affiliate_id,
        year=request.year,
        ordinal=request.ordinal,
    )


@heat_assignments_router.post(
    "/delete-by-criteria",
    status_code=status.HTTP_200_OK,
    response_model=DeleteAssignmentsByCriteriaResponse,
)
async def delete_assignments_by_criteria(
    db_session: db_dependency,
    _: admin_user_dependency,
    request: DeleteAssignmentsByCriteriaRequest,
) -> dict[str, Any]:
    """Delete all heat assignments for a specific affiliate, year, and ordinal."""
    return await delete_heat_assignments_by_criteria(
        db_session=db_session,
        affiliate_id=request.affiliate_id,
        year=request.year,
        ordinal=request.ordinal,
    )
