from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import DateTime, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CfGamesData(Base):
    __table_args__ = (UniqueConstraint("affiliate_id", "year"),)

    affiliate_id: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
