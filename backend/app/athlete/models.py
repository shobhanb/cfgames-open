from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.engine.default import DefaultExecutionContext
from sqlalchemy.orm import Mapped, mapped_column

from app.cf_games.constants import CF_DIVISION_MAP, DEFAULT_TEAM_NAME, MASTERS_AGE_CUTOFF, OPEN_AGE_CUTOFF
from app.database.base import Base

if TYPE_CHECKING:
    pass


def apply_age_category(context: DefaultExecutionContext) -> str:
    age = context.get_current_parameters()["age"]
    if int(age) >= int(MASTERS_AGE_CUTOFF):
        return "Masters 55+"
    if int(age) >= int(OPEN_AGE_CUTOFF):
        return "Masters"
    return "Open"


def apply_division_name(context: DefaultExecutionContext) -> str:
    division_id = context.get_current_parameters()["division_id"]
    return CF_DIVISION_MAP[str(division_id)]


class Athlete(Base):
    __table_args__ = (UniqueConstraint("crossfit_id", "year"),)

    crossfit_id: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)

    # CF Games data
    affiliate_id: Mapped[int] = mapped_column(Integer)
    affiliate_name: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    gender: Mapped[str] = mapped_column(String)
    division_id: Mapped[int] = mapped_column(Integer)
    age: Mapped[int] = mapped_column(Integer)

    # Affiliate columns
    age_category: Mapped[str] = mapped_column(String, default=apply_age_category, onupdate=apply_age_category)
    team_name: Mapped[str] = mapped_column(String, default=DEFAULT_TEAM_NAME)
    team_role: Mapped[int] = mapped_column(Integer, default=0)
