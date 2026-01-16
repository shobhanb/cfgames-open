from typing import Literal

from app.schemas import CustomBaseModel


class BaseModel(CustomBaseModel):
    affiliate_id: int
    year: int
    team_name: str
    ordinal: int


class AthleteModel(BaseModel):
    name: str
    crossfit_id: int
    gender: Literal["M", "F"]
    age_category: Literal["U18", "Open", "Masters", "Masters 55+"]


class LeaderboardScoreModel(AthleteModel):
    affiliate_scaled: Literal["RX", "Scaled"]
    affiliate_rank: int
    score_display: str
    tiebreak_ms: str | None = None


class IndividualScoreModel(AthleteModel):
    participation_score: int
    top3_score: int
    judge_score: int
    attendance_score: int
    appreciation_score: int
    rookie_score: int
    total_individual_score: int


class TeamScoreModel(BaseModel):
    participation_score: int
    top3_score: int
    judge_score: int
    attendance_score: int
    appreciation_score: int
    rookie_score: int
    side_challenge_score: int
    spirit_score: int
    total_team_score: int


class UserScoreModel(IndividualScoreModel):
    affiliate_scaled: Literal["RX", "Scaled"]
    affiliate_rank: int
    score_display: str
    tiebreak_ms: str | None = None
