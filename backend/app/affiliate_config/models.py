from __future__ import annotations

from sqlalchemy import Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.affiliate_config.constants import (
    ATTENDANCE_SCORE,
    DEFAULT_APPRECIATION_SCORE,
    DEFAULT_ROOKIE_SCORE,
    DEFAULT_SIDE_CHALLENGE_SCORE,
    DEFAULT_SPIRIT_SCORE,
    JUDGE_SCORE,
    PARTICIPATION_SCORE,
    TOP3_SCORE,
)
from app.database.base import Base


class AffiliateConfig(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "year"),)

    affiliate_id: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)

    # Scoring configuration
    participation_score: Mapped[int] = mapped_column(Integer, default=PARTICIPATION_SCORE)
    top3_score: Mapped[int] = mapped_column(Integer, default=TOP3_SCORE)
    judge_score: Mapped[int] = mapped_column(Integer, default=JUDGE_SCORE)
    attendance_score: Mapped[int] = mapped_column(Integer, default=ATTENDANCE_SCORE)
    appreciation_score: Mapped[int] = mapped_column(Integer, default=DEFAULT_APPRECIATION_SCORE)
    rookie_score: Mapped[int] = mapped_column(Integer, default=DEFAULT_ROOKIE_SCORE)
    side_challenge_score: Mapped[int] = mapped_column(Integer, default=DEFAULT_SIDE_CHALLENGE_SCORE)
    spirit_score: Mapped[int] = mapped_column(Integer, default=DEFAULT_SPIRIT_SCORE)

    # App Configuration
    use_scheduling: Mapped[bool] = mapped_column(Boolean, default=True)
    use_appreciation: Mapped[bool] = mapped_column(Boolean, default=True)
