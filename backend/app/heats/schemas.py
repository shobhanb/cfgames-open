import datetime as dt
from uuid import UUID

from app.schemas import CustomBaseModel


class HeatsModel(CustomBaseModel):
    id: UUID
    short_name: str
    start_time: dt.datetime
    affiliate_id: int
    year: int
    ordinal: int
    max_athletes: int | None = None


class HeatsCreate(CustomBaseModel):
    short_name: str
    start_time: dt.datetime
    affiliate_id: int
    year: int
    ordinal: int
    max_athletes: int | None = None


class HeatsUpdate(CustomBaseModel):
    short_name: str | None = None
    start_time: dt.datetime | None = None
    max_athletes: int | None = None


class TogglePublishedRequest(CustomBaseModel):
    heat_id: UUID
    published: bool


class ToggleLockedRequest(CustomBaseModel):
    heat_id: UUID
    locked: bool


class ToggleResponse(CustomBaseModel):
    updated_count: int
    message: str
