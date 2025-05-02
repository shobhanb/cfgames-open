from __future__ import annotations

from app.schemas import CustomBaseModel


class CustomClaims(CustomBaseModel):
    admin: str | None = None
    athlete_id: int
