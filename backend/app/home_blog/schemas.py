from datetime import datetime
from uuid import UUID

from app.schemas import CustomBaseModel


class HomeBlogModel(CustomBaseModel):
    id: UUID
    created_at: datetime
    affiliate_id: int
    year: int
    title: str
    subtitle: str | None
    image_link: str | None
    content: str
    action_text: str | None
    action_link: str | None


class CreateHomeBlogModel(CustomBaseModel):
    title: str
    subtitle: str | None = None
    image_link: str | None = None
    content: str
    action_text: str | None = None
    action_link: str | None = None
