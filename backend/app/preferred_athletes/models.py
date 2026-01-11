from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PreferredAthletes(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "crossfit_id"),)

    affiliate_id: Mapped[int] = mapped_column(Integer)
    crossfit_id: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    start_time: Mapped[str] = mapped_column(String)  # e.g. "Sat 7AM", "Fri 6PM"
