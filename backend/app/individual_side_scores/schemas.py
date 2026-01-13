from typing import Literal

from app.schemas import CustomBaseModel


class IndividualSideScoreModel(CustomBaseModel):
    year: int
    affiliate_id: int
    crossfit_id: int
    ordinal: int
    score_type: Literal["appreciation", "rookie"]
    score: int
