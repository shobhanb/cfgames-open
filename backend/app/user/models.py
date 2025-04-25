from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.athlete.models import Athlete


class User(Base):
    email: Mapped[str] = mapped_column(String, primary_key=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey("athlete.athlete_id"), unique=True)

    admin: Mapped[bool] = mapped_column(Boolean, default=False)

    athlete: Mapped[Athlete] = relationship(back_populates="user")
