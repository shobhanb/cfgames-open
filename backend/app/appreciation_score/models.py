from __future__ import annotations

from sqlalchemy import Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AppreciationScore(Base):
    __table_args__ = (UniqueConstraint("crossfit_id", "ordinal"),)

    crossfit_id: Mapped[int] = mapped_column(Integer)
    ordinal: Mapped[int] = mapped_column(Integer)
    score: Mapped[int] = mapped_column(Integer)
