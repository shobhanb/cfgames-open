import logging

from firebase_admin import auth
from firebase_admin._user_mgt import UserRecord

from app.auth.schemas import CustomClaims

log = logging.getLogger("uvicorn.error")


async def create_user_with_email_password(email: str, password: str, display_name: str, competitor_id: int) -> None:
    user: UserRecord = auth.create_user(email=email, password=password, display_name=display_name)
    auth.set_custom_user_claims(uid=user.uid, custom_claims={"AthleteId": competitor_id})


async def assign_competitor_id_to_user(uid: str, competitor_id: int) -> None:
    auth.set_custom_user_claims(uid=uid, custom_claims={"AthleteId": competitor_id})


async def remove_custom_claims(uid: str) -> None:
    auth.set_custom_user_claims(uid=uid, custom_claims=None)


async def make_user_admin(uid: str) -> None:
    auth.set_custom_user_claims(uid=uid, custom_claims={"admin": True})


async def make_user_gym_admin(uid: str) -> None:
    auth.set_custom_user_claims(uid=uid, custom_claims={"gym_admin": True})


async def create_admin_user(email: str, athlete_id: int) -> None:
    user: UserRecord = auth.get_user_by_email(email)
    custom_claims = CustomClaims(admin="all", athlete_id=athlete_id)
    new_user: UserRecord = auth.update_user(uid=user.uid, custom_claims=custom_claims.model_dump_json())
    log.info("Updated admin claims for user %s: %s", new_user.email, new_user.custom_claims)


async def get_custom_claims_by_email(email: str) -> dict | None:
    user: UserRecord = auth.get_user_by_email(email)
    return user.custom_claims
