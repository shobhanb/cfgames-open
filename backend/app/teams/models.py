from __future__ import annotations

from sqlalchemy import Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Teams(Base):
    __table_args__ = (UniqueConstraint("year", "affiliate_id", "team_name"),)

    year: Mapped[int] = mapped_column(Integer)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    team_name: Mapped[str] = mapped_column(String)
    instagram: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
