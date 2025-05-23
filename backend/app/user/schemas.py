from uuid import UUID

from fastapi_users import schemas


class UserAffiliateMixin:
    affiliate: str
    affiliate_id: int
    name: str
    athlete_id: int


class UserAffiliateMixinOptional:
    affiliate: str | None = None
    affiliate_id: int | None = None
    name: str | None = None
    athlete_id: int | None = None


class UserRead(UserAffiliateMixin, schemas.BaseUser[UUID]):
    pass


class UserCreate(UserAffiliateMixin, schemas.BaseUserCreate):
    pass


class UserUpdate(UserAffiliateMixinOptional, schemas.BaseUserUpdate):
    pass
