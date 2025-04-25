from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.engine.default import DefaultExecutionContext
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.athlete.models import Athlete


def apply_affiliate_scaled(context: DefaultExecutionContext) -> str:
    scaled = context.get_current_parameters()["scaled"]
    if scaled == 0:
        return "RX"
    return "Scaled"


def apply_tiebreak_ms(context: DefaultExecutionContext) -> str | None:
    breakdown = context.get_current_parameters().get("breakdown", "")
    tiebreak_index = breakdown.rfind("Tiebreak: ")
    if tiebreak_index > 0:
        return breakdown[tiebreak_index + 10 :]
    return None


def apply_total_score(context: DefaultExecutionContext) -> int:
    return (
        context.get_current_parameters().get("participation_score", 0)
        + context.get_current_parameters().get("top3_score", 0)
        + context.get_current_parameters().get("judge_score", 0)
        + context.get_current_parameters().get("attendance_score", 0)
        + context.get_current_parameters().get("side_challenge_score", 0)
        + context.get_current_parameters().get("spirit_score", 0)
    )


class Score(Base):
    __table_args__ = (UniqueConstraint("athlete_id", "ordinal"),)

    # PK / FK
    athlete_id: Mapped[UUID] = mapped_column(Uuid, ForeignKey("athlete.id"))
    ordinal: Mapped[int] = mapped_column(Integer)

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
    team_name: Mapped[str] = mapped_column(String, default="Teamless")
    affiliate_rank: Mapped[int] = mapped_column(Integer, default=999)
    participation_score: Mapped[int] = mapped_column(Integer, default=0)
    top3_score: Mapped[int] = mapped_column(Integer, default=0)
    judge_score: Mapped[int] = mapped_column(Integer, default=0)
    attendance_score: Mapped[int] = mapped_column(Integer, default=0)
    appreciation_score: Mapped[int] = mapped_column(Integer, default=0)
    side_challenge_score: Mapped[int] = mapped_column(Integer, default=0)
    spirit_score: Mapped[int] = mapped_column(Integer, default=0)

    # Calculated columns
    affiliate_scaled: Mapped[str] = mapped_column(
        String,
        default=apply_affiliate_scaled,
    )
    tiebreak_ms: Mapped[str | None] = mapped_column(
        Integer,
        nullable=True,
        default=apply_tiebreak_ms,
        onupdate=apply_tiebreak_ms,
    )
    total_score: Mapped[int] = mapped_column(Integer, default=apply_total_score, onupdate=apply_total_score)

    # Relationships
    athlete: Mapped[Athlete] = relationship(back_populates="scores")


class SideScore(Base):
    ordinal: Mapped[int] = mapped_column(Integer)
    score_type: Mapped[str] = mapped_column(String)
    team_name: Mapped[str] = mapped_column(String)
    score: Mapped[int] = mapped_column(Integer)
