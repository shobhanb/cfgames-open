from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.judge_availability.models import JudgeAvailability


class Judges(Base):
    crossfit_id: Mapped[int] = mapped_column(Integer, unique=True)
    name: Mapped[str] = mapped_column(String)

    availability: Mapped[list[JudgeAvailability]] = relationship(
        back_populates="judge",
        cascade="all, delete-orphan",
    )
