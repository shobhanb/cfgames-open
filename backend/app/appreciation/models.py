from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Appreciation(Base):
    __table_args__ = (UniqueConstraint("athlete_id", "ordinal"),)

    athlete_id: Mapped[UUID] = mapped_column(ForeignKey("athlete.id"))
    ordinal: Mapped[int] = mapped_column(Integer)
    team_vote_athlete_id: Mapped[UUID] = mapped_column(ForeignKey("athlete.id"))
    team_vote_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    non_team_vote_athlete_id: Mapped[UUID] = mapped_column(ForeignKey("athlete.id"))
    non_team_vote_text: Mapped[str | None] = mapped_column(Text, nullable=True)
