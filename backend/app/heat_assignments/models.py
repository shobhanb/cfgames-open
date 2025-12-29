from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.heats.models import Heats


class HeatAssignments(Base):
    __table_args__ = (
        UniqueConstraint("heat_id", "athlete_crossfit_id"),
        UniqueConstraint("heat_id", "judge_crossfit_id"),
    )

    heat_id: Mapped[UUID] = mapped_column(ForeignKey("heats.id"))
    athlete_crossfit_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    athlete_name: Mapped[str | None] = mapped_column(String, nullable=True)
    judge_crossfit_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    judge_name: Mapped[str | None] = mapped_column(String, nullable=True)
    preference_nbr: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    heat: Mapped[Heats] = relationship("Heats", back_populates="heat_assignments")
