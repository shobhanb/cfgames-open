from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

if TYPE_CHECKING:
    pass


class Score(Base):
    __table_args__ = (UniqueConstraint("crossfit_id", "year", "ordinal"),)

    # PK / FK
    crossfit_id: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)

    # CF Fields
    rank: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer)
    valid: Mapped[bool] = mapped_column(Boolean)
    score_display: Mapped[str] = mapped_column(String)
    scaled: Mapped[int] = mapped_column(Integer)
    breakdown: Mapped[str | None] = mapped_column(Text, nullable=True)
    time: Mapped[int | None] = mapped_column(Integer, nullable=True)
    judge_user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    judge_name: Mapped[str | None] = mapped_column(String, nullable=True)
    affiliate: Mapped[str | None] = mapped_column(String, nullable=True)

    # Affiliate data
    affiliate_rank: Mapped[int] = mapped_column(Integer, default=999)
    participation_score: Mapped[int] = mapped_column(Integer, default=0)
    top3_score: Mapped[int] = mapped_column(Integer, default=0)
    judge_score: Mapped[int] = mapped_column(Integer, default=0)
    attendance_score: Mapped[int] = mapped_column(Integer, default=0)
    appreciation_score: Mapped[int] = mapped_column(Integer, default=0)
    side_challenge_score: Mapped[int] = mapped_column(Integer, default=0)
    spirit_score: Mapped[int] = mapped_column(Integer, default=0)

    # Calculated columns
    affiliate_scaled: Mapped[str] = mapped_column(String)
    tiebreak_ms: Mapped[str | None] = mapped_column(String, nullable=True)
    total_individual_score: Mapped[int] = mapped_column(Integer, default=0)
    total_team_score: Mapped[int] = mapped_column(Integer, default=0)
