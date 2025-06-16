from app.schemas import CustomBaseModel


class EventsModel(CustomBaseModel):
    year: int
    ordinal: int
    event: str
