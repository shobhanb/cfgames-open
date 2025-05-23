from uuid import UUID

from app.schemas import CustomBaseModel


class AppreciationModel(CustomBaseModel):
    athlete_id: UUID
    ordinal: int
    score: int
