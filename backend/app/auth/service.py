from firebase_admin import auth
from firebase_admin._user_mgt import UserRecord


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
