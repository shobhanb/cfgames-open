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
    age_category: Literal["Open", "Masters", "Masters 55+"]
    gender: Literal["F", "M"]


class TeamName(CustomBaseModel):
    team_name: str


class UpdateTeamName(CustomBaseModel):
    old_team_name: str
    new_team_name: str


class AutoTeamAssignment(CustomBaseModel):
    name: str
    team_name: str
