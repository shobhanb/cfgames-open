from uuid import UUID

from app.schemas import CustomBaseModel


class JudgesModel(CustomBaseModel):
    id: UUID
    affiliate_id: int
    crossfit_id: int
    name: str
    preferred: bool


class JudgesCreate(CustomBaseModel):
    affiliate_id: int
    crossfit_id: int
    name: str
    preferred: bool = False


class JudgesUpdate(CustomBaseModel):
    affiliate_id: int | None = None
    crossfit_id: int | None = None
    name: str | None = None
    preferred: bool | None = None
