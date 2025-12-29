from uuid import UUID

from app.schemas import CustomBaseModel


class JudgeAvailabilityModel(CustomBaseModel):
    id: UUID
    judge_id: UUID
    time_slot: str
    available: bool


class JudgeAvailabilityCreate(CustomBaseModel):
    judge_id: UUID
    time_slot: str
    available: bool = True


class JudgeAvailabilityUpdate(CustomBaseModel):
    time_slot: str | None = None
    available: bool | None = None
