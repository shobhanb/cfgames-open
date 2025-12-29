from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PreferredAthletes(Base):
    crossfit_id: Mapped[int] = mapped_column(Integer, unique=True)
    name: Mapped[str] = mapped_column(String)
