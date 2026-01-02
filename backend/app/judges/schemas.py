from uuid import UUID

from app.schemas import CustomBaseModel


class JudgesModel(CustomBaseModel):
    id: UUID
    crossfit_id: int
    name: str
    preferred: bool


class JudgesCreate(CustomBaseModel):
    crossfit_id: int
    name: str
    preferred: bool = False


class JudgesUpdate(CustomBaseModel):
    crossfit_id: int | None = None
    name: str | None = None
    preferred: bool | None = None
