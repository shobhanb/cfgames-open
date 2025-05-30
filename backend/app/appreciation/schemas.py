from uuid import UUID

from app.schemas import CustomBaseModel


class AppreciationModelBase(CustomBaseModel):
    team_vote_athlete_id: UUID
    team_vote_text: str | None
    non_team_vote_athlete_id: UUID
    non_team_vote_text: str | None


class AppreciationModelOutput(AppreciationModelBase):
    athlete_id: UUID
    ordinal: int


class AppreciationModelInput(AppreciationModelBase):
    pass
