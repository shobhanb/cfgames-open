from typing import Literal

from app.schemas import CustomBaseModel


class AffiliateAthlete(CustomBaseModel):
    affiliate_name: str
    affiliate_id: int
    name: str
    crossfit_id: int


class AthleteDetail(AffiliateAthlete):
    year: int
    team_name: str
    team_role: int
    age_category: Literal["U18", "Open", "Masters", "Masters 35-45", "Masters 45-55", "Masters 55+"]
    gender: Literal["F", "M"]
    judge: bool
    nth: int


class TeamName(CustomBaseModel):
    team_name: str


class UpdateTeamName(CustomBaseModel):
    old_team_name: str
    new_team_name: str


class AutoTeamAssignmentOutput(CustomBaseModel):
    name: str
    team_name: str


class AutoTeamAssignmentInput(CustomBaseModel):
    affiliate_id: int
    year: int
    assign_from_team_name: str
    assign_to_team_names: list[str]


class AthleteSummaryCounts(CustomBaseModel):
    athlete_count: int
    affiliate_id: int
    affiliate_name: str
    year: int
