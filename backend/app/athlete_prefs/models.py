from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AthleteTimePref(Base):
    __table_args__ = (
        UniqueConstraint("crossfit_id", "preference_nbr"),
        UniqueConstraint("crossfit_id", "preference"),
    )

    crossfit_id: Mapped[int] = mapped_column(Integer)
    preference_nbr: Mapped[int] = mapped_column(Integer)
    preference: Mapped[str] = mapped_column(String)
