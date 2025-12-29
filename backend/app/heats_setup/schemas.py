from uuid import UUID

from app.schemas import CustomBaseModel


class HeatsSetupModel(CustomBaseModel):
    id: UUID
    affiliate_id: int
    short_name: str
    start_time: str  # Military time format e.g. "08:00"
    end_time: str  # Military time format e.g. "12:00"
    interval: int
    max_athletes: int | None = None


class HeatsSetupCreate(CustomBaseModel):
    affiliate_id: int
    short_name: str
    start_time: str  # Military time format e.g. "08:00"
    end_time: str  # Military time format e.g. "12:00"
    interval: int
    max_athletes: int | None = None


class HeatsSetupUpdate(CustomBaseModel):
    short_name: str | None = None
    start_time: str | None = None  # Military time format e.g. "08:00"
    end_time: str | None = None  # Military time format e.g. "12:00"
    interval: int | None = None
    max_athletes: int | None = None
