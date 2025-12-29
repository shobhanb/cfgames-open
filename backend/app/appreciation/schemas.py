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


class AppreciationCountsModel(CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int
    count: int


class AppreciationResults(CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int
    crossfit_id: int
    team_votes: int
    non_team_votes: int
    total_votes: int


class AppreciationSource(CustomBaseModel):
    crossfit_id: int
    comment: str | None


class AppreciationResultDetail(CustomBaseModel):
    team_votes: list[AppreciationSource]
    non_team_votes: list[AppreciationSource]


class AppreciationResultNotes(CustomBaseModel):
    year: int
    ordinal: int
    text: str
