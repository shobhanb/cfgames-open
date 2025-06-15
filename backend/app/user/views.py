from fastapi import APIRouter, status
from sqlalchemy import select

from app.database.dependencies import db_dependency
from app.settings import auth_settings

from .core import auth_backend, fastapi_users, google_oauth_client
from .dependencies import current_superuser_dependency
from .models import User
from .schemas import UserCreate, UserRead, UserUpdate

auth_router = APIRouter(prefix="/auth", tags=["auth"])

#
# Included routes
#

auth_router.include_router(fastapi_users.get_auth_router(auth_backend))

auth_router.include_router(fastapi_users.get_register_router(UserRead, UserCreate))

auth_router.include_router(fastapi_users.get_verify_router(UserRead))


auth_router.include_router(fastapi_users.get_reset_password_router())

auth_router.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))

auth_router.include_router(
    fastapi_users.get_oauth_router(
        oauth_client=google_oauth_client,
        backend=auth_backend,
        state_secret=auth_settings.oauth_token_key,
        associate_by_email=True,
    ),
    prefix="/google",
)

auth_router.include_router(
    fastapi_users.get_oauth_associate_router(
        oauth_client=google_oauth_client,
        user_schema=UserRead,
        state_secret=auth_settings.oauth_token_key,
        requires_verification=False,
    ),
    prefix="/associate/google",
)


#
# Custom routes
#


@auth_router.get("/users/all", status_code=status.HTTP_200_OK, response_model=list[UserRead])
async def get_all_users(
    db_session: db_dependency,
    super_user: current_superuser_dependency,
) -> list[User]:
    stmt = select(User).where(User.affiliate_id == super_user.affiliate_id)
    ret = await db_session.execute(stmt)
    result = ret.scalars().unique()
    return list(result)
