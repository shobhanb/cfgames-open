from typing import Any

from firebase_admin import auth
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import CustomClaims
from app.user.models import User
from app.user.schemas import AddUserSchema


async def queue_add_new_user(
    db_session: AsyncSession,
    token_data: dict[str, Any],
    athlete_data: AddUserSchema,
) -> None:
    user = User(
        **athlete_data.model_dump(),
        uid=token_data["uid"],
        email=token_data["email"],
        provider_name=token_data["displayName"],
    )
    db_session.add(user)
    await db_session.commit()


async def add_custom_claim_athlete(
    db_session: AsyncSession,
    athlete_id: int,
) -> None:
    user = await User.find_or_raise(async_session=db_session, athlete_id=athlete_id)
    custom_claims = CustomClaims(athlete_id=athlete_id)
    auth.update_user(uid=user.uid, display_name=user.cf_name, custom_claims=custom_claims.model_dump_json())
    user.validated = True
    db_session.add(user)
    await db_session.commit()
