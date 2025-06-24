from app.schemas import CustomBaseModel


class AppreciationModelBase(CustomBaseModel):
    team_vote_crossfit_id: int
    team_vote_text: str | None
    non_team_vote_crossfit_id: int
    non_team_vote_text: str | None


class AppreciationModelOutput(AppreciationModelBase):
    crossfit_id: int
    ordinal: int


class AppreciationModelInput(AppreciationModelBase):
    pass
