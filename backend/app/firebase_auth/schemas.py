from pydantic import EmailStr

from app.schemas import CustomBaseModel


class FirebaseCustomClaims(CustomBaseModel):
    crossfit_id: int | None
    affiliate_id: int | None
    affiliate_name: str | None
    admin: bool = False
    super_admin: bool = False


class FirebaseUserRecord(CustomBaseModel):
    uid: str
    display_name: str | None
    email: str | None
    photo_url: str | None
    provider_id: str
    email_verified: bool
    disabled: bool
    custom_claims: FirebaseCustomClaims | None
    tenant_id: str | None


class CreateUser(CustomBaseModel):
    email: EmailStr
    password: str
    display_name: str
    crossfit_id: int
    affiliate_id: int
    affiliate_name: str
