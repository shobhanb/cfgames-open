from typing import Literal
from uuid import UUID

from app.schemas import CustomBaseModel


class AffiliateAthlete(CustomBaseModel):
    affiliate_name: str
    affiliate_id: int
    name: str
    competitor_id: int


class AthleteDetail(CustomBaseModel):
    id: UUID
    affiliate_name: str
    affiliate_id: int
    year: int
    name: str
    competitor_id: int
    team_name: str
    team_role: int
    age_category: Literal["Open", "Masters", "Masters 55+"]
    gender: Literal["F", "M"]
