from __future__ import annotations

import datetime as dt

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Heats(Base):
    start_time: Mapped[dt.datetime] = mapped_column(DateTime, primary_key=True)
    max_athletes: Mapped[int] = mapped_column(Integer)

    year: Mapped[int] = mapped_column(Integer, primary_key=True)
    ordinal: Mapped[int] = mapped_column(Integer, primary_key=True)
    event: Mapped[str] = mapped_column(String, unique=True)
