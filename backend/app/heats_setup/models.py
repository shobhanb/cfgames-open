from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class HeatsSetup(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "short_name"),)

    affiliate_id: Mapped[int] = mapped_column(Integer)
    short_name: Mapped[str] = mapped_column(String)  # e.g. "Fri AM", "Sat PM"
    start_time: Mapped[str] = mapped_column(String)  # Military time e.g. "08:00", "14:30"
    end_time: Mapped[str] = mapped_column(String)  # Military time e.g. "12:00", "16:30"
    interval: Mapped[int] = mapped_column(Integer)  # Minutes between heats
    max_athletes: Mapped[int | None] = mapped_column(Integer, nullable=True)
