from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

if TYPE_CHECKING:
    pass


class User(Base):
    email: Mapped[str] = mapped_column(String, primary_key=True)
    uid: Mapped[int] = mapped_column(Integer, unique=True)
    athlete_id: Mapped[int] = mapped_column(Integer, unique=True)
    provider_name: Mapped[str | None] = mapped_column(String)
    cf_name: Mapped[str] = mapped_column(String)
    cf_gym: Mapped[str] = mapped_column(String)
    validated: Mapped[bool] = mapped_column(Boolean, default=False)
