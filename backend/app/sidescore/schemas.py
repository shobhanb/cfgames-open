from uuid import UUID

from app.schemas import CustomBaseModel


class SideScoreModel(CustomBaseModel):
    id: UUID
    year: int
    affiliate_id: int
    ordinal: int
    score_type: str
    team_name: str
    score: int
