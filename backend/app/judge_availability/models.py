from __future__ import annotations

from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.judges.models import Judges


class JudgeAvailability(Base):
    __table_args__ = (UniqueConstraint("judge_id", "time_slot", name="uq_judge_timeslot"),)

    judge_id: Mapped[UUID] = mapped_column(ForeignKey("judges.id"))
    time_slot: Mapped[str] = mapped_column(String)
    available: Mapped[bool] = mapped_column(Boolean, default=True)

    judge: Mapped[Judges] = relationship(back_populates="availability")
