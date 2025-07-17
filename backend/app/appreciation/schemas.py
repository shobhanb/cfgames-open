from app.schemas import CustomBaseModel


class AppreciationModel(CustomBaseModel):
    crossfit_id: int
    affiliate_id: int
    year: int
    ordinal: int
    team_vote_crossfit_id: int
    team_vote_text: str | None
    non_team_vote_crossfit_id: int
    non_team_vote_text: str | None
