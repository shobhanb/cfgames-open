from __future__ import annotations

from sqlalchemy import Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Appreciation(Base):
    __table_args__ = (UniqueConstraint("crossfit_id", "ordinal"),)

    crossfit_id: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    team_vote_crossfit_id: Mapped[int] = mapped_column(Integer)
    team_vote_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    non_team_vote_crossfit_id: Mapped[int] = mapped_column(Integer)
    non_team_vote_text: Mapped[str | None] = mapped_column(Text, nullable=True)
