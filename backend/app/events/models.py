from __future__ import annotations

import datetime as dt

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Events(Base):
    __table_args__ = (UniqueConstraint("year", "ordinal"),)

    year: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    event: Mapped[str] = mapped_column(String, unique=True)
    start_date: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)
