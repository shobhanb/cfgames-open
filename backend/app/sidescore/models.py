from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SideScore(Base):
    __table_args__ = (UniqueConstraint("year", "affiliate_id", "ordinal", "score_type", "team_name"),)

    year: Mapped[int] = mapped_column(Integer)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    score_type: Mapped[str] = mapped_column(String)
    team_name: Mapped[str] = mapped_column(String)
    score: Mapped[int] = mapped_column(Integer)
