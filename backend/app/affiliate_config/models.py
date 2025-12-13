from __future__ import annotations

from sqlalchemy import Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AffiliateConfig(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "year"),)

    affiliate_id: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)

    # Scoring configuration
    masters_age_cutoff: Mapped[int] = mapped_column(Integer, default=55)
    open_age_cutoff: Mapped[int] = mapped_column(Integer, default=35)
    participation_score: Mapped[int] = mapped_column(Integer, default=1)
    top3_score: Mapped[int] = mapped_column(Integer, default=3)
    judge_score: Mapped[int] = mapped_column(Integer, default=2)
    attendance_score: Mapped[int] = mapped_column(Integer, default=2)
    default_appreciation_score: Mapped[int] = mapped_column(Integer, default=10)
    default_side_score: Mapped[int] = mapped_column(Integer, default=25)
