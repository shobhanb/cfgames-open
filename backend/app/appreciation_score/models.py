from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AppreciationScore(Base):
    __table_args__ = (UniqueConstraint("athlete_id", "ordinal"),)

    athlete_id: Mapped[UUID] = mapped_column(ForeignKey("athlete.id"))
    ordinal: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer)
