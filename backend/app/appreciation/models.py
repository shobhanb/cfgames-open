from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.cf_games.constants import DEFAULT_APPRECIATION_SCORE
from app.database.base import Base


class Appreciation(Base):
    __table_args__ = (UniqueConstraint("athlete_id", "ordinal"),)

    athlete_id: Mapped[UUID] = mapped_column(ForeignKey("athlete.id"))
    ordinal: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer, default=DEFAULT_APPRECIATION_SCORE)
