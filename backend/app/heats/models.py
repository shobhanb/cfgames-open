from __future__ import annotations

import datetime as dt
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.heat_assignments.models import HeatAssignments


class Heats(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "year", "start_time", "ordinal"),)

    short_name: Mapped[str] = mapped_column(String)
    start_time: Mapped[dt.datetime] = mapped_column(DateTime)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    max_athletes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    heat_assignments: Mapped[list[HeatAssignments]] = relationship(
        "HeatAssignments",
        back_populates="heat",
        cascade="all, delete-orphan",
    )
