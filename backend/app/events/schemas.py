from app.schemas import CustomBaseModel


class EventsModel(CustomBaseModel):
    year: int
    ordinal: int
    event: str


class EventsCreate(CustomBaseModel):
    year: int
    ordinal: int
    event: str


class EventsUpdate(CustomBaseModel):
    event: str | None = None
