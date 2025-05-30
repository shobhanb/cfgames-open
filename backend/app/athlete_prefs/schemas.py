from uuid import UUID

from app.schemas import CustomBaseModel


class AthletePrefsOutputModel(CustomBaseModel):
    name: str
    competitor_id: int
    preference_nbr: int
    preference: str


class AthletePrefsModel(CustomBaseModel):
    athlete_id: UUID
    preference_nbr: int
    preference: str
