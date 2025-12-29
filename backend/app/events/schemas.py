import datetime as dt

from app.schemas import CustomBaseModel


class EventsModel(CustomBaseModel):
    year: int
    ordinal: int
    event: str
    start_date: dt.datetime | None = None


class EventsCreate(CustomBaseModel):
    year: int
    ordinal: int
    event: str
    start_date: dt.datetime | None = None


class EventsUpdate(CustomBaseModel):
    event: str | None = None
    start_date: dt.datetime | None = None
