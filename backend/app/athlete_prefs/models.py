from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AthleteTimePref(Base):
    __table_args__ = (
        UniqueConstraint("competitor_id", "preference_nbr"),
        UniqueConstraint("competitor_id", "preference"),
    )

    competitor_id: Mapped[int] = mapped_column(ForeignKey("athlete.competitor_id"))
    preference_nbr: Mapped[int] = mapped_column(Integer)
    preference: Mapped[str] = mapped_column(String)
