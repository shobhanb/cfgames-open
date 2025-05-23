from app.schemas import CustomBaseModel


class SideScoreModel(CustomBaseModel):
    year: int
    affiliate_id: int
    ordinal: int
    score_type: str
    team_name: str
    score: int
