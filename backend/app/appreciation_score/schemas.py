from uuid import UUID

from app.schemas import CustomBaseModel


class AppreciationScoreModel(CustomBaseModel):
    athlete_id: UUID
    ordinal: int
    score: int
