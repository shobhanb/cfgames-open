from typing import Literal

from app.schemas import CustomBaseModel


class ScoreExtendedModel:
    participation_score: int
    top3_score: int
    judge_score: int
    attendance_score: int
    appreciation_score: int
    side_challenge_score: int
    spirit_score: int
    total_score: int


class ScoreModel(ScoreExtendedModel, CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int
    name: str
    gender: Literal["M", "F"]
    age_category: Literal["Open", "Masters", "Masters 55+"]
    team_name: str | None = None
    affiliate_scaled: Literal["RX", "Scaled"]
    affiliate_rank: int | None = None
    score_display: str | None = None
    tiebreak_ms: str | None = None


class TeamScoreModel(ScoreExtendedModel, CustomBaseModel):
    team_name: str
    affiliate_id: int
    year: int
    ordinal: int | None = None
