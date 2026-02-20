from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.engine.default import DefaultExecutionContext
from sqlalchemy.orm import Mapped, mapped_column

from app.cf_games.constants import CF_DIVISION_MAP, DEFAULT_TEAM_NAME
from app.database.base import Base

if TYPE_CHECKING:
    pass


def apply_age_category(context: DefaultExecutionContext) -> str:
    division_id = int(context.get_current_parameters()["division_id"])
    year = int(context.get_current_parameters()["year"])

    # Assign division_id to age category based on the following rules:
    # division_id 1, 2: Open
    # division_id 14, 15, 16, 17: U18
    # division_id 7, 8, 36, 37, 40, 41, 42, 43: Masters 55+
    # division_id 12, 13, 18, 19: Masters 35-45
    # division_id 3,4,5,6: Masters 45-55

    category = "Open"

    if division_id in {14, 15, 16, 17}:
        category = "U18"
    if division_id in {7, 8, 36, 37, 40, 41, 42, 43}:
        category = "Masters 55+"
    if year >= 2026:  # noqa: PLR2004
        if division_id in {12, 13, 18, 19}:
            category = "Masters 35-45"
        if division_id in {3, 4, 5, 6}:
            category = "Masters 45-55"
    else:
        if division_id in {3, 4, 5, 6}:
            category = "Masters"
        if division_id in {12, 13, 18, 19}:
            category = "Masters"

    return category


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
    age_category: Mapped[str] = mapped_column(String, default=apply_age_category)
    team_name: Mapped[str] = mapped_column(String, default=DEFAULT_TEAM_NAME)
    team_role: Mapped[int] = mapped_column(Integer, default=0)
