import datetime as dt
from uuid import UUID

from app.schemas import CustomBaseModel


class HeatAssignmentModel(CustomBaseModel):
    id: UUID
    heat_id: UUID
    athlete_crossfit_id: int | None
    athlete_name: str | None
    judge_crossfit_id: int | None
    judge_name: str | None
    preference_nbr: int | None
    is_locked: bool
    is_published: bool


class HeatAssignmentCreate(CustomBaseModel):
    heat_id: UUID
    athlete_crossfit_id: int | None = None
    athlete_name: str | None = None
    judge_crossfit_id: int | None = None
    judge_name: str | None = None
    preference_nbr: int | None = None
    is_locked: bool | None = None
    is_published: bool | None = None


class HeatAssignmentUpdate(CustomBaseModel):
    heat_id: UUID | None = None
    athlete_crossfit_id: int | None = None
    athlete_name: str | None = None
    judge_crossfit_id: int | None = None
    judge_name: str | None = None
    preference_nbr: int | None = None
    is_locked: bool | None = None
    is_published: bool | None = None


class RandomAssignmentRequest(CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int


class RandomAssignmentResponse(CustomBaseModel):
    assigned_count: int
    heats_processed: int
    athletes_assigned: int
    judges_assigned: int
    skipped_athletes: list[dict[str, str | int]]


class DeleteAssignmentsByCriteriaRequest(CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int


class DeleteAssignmentsByCriteriaResponse(CustomBaseModel):
    deleted_count: int
    heats_found: int
    message: str


class HeatAttendanceModel(CustomBaseModel):
    athlete_name: str
    athlete_crossfit_id: int
    start_time: dt.datetime
    email: str | None
