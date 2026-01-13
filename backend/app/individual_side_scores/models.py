from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class IndividualSideScores(Base):
    __table_args__ = (UniqueConstraint("year", "affiliate_id", "crossfit_id", "ordinal"),)

    year: Mapped[int] = mapped_column(Integer)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    crossfit_id: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    score_type: Mapped[str] = mapped_column(String)
    score: Mapped[int] = mapped_column(Integer)
