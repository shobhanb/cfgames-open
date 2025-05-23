from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from fastapi_users.exceptions import InvalidVerifyToken, UserAlreadyVerified, UserNotExists
from fastapi_users.router.common import ErrorCode
from sqlalchemy import update

from app.auth.dependencies import verify_admin_api_key
from app.database.dependencies import db_dependency
from app.settings import auth_settings

from .core import auth_backend, fastapi_users, get_user_manager, google_oauth_client
from .models import User, UserManager
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


@auth_router.get("/verify/", status_code=status.HTTP_200_OK, response_class=PlainTextResponse)
async def auth_verify_email(token: str, user_manager: Annotated[UserManager, Depends(get_user_manager)]) -> str:
    try:
        user = await user_manager.verify(token)
    except (InvalidVerifyToken, UserNotExists) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorCode.VERIFY_USER_BAD_TOKEN,
        ) from e
    except UserAlreadyVerified:
        return "Email already verified"
    else:
        return f"Thanks for verifying your email {user.email}, {user.name}"


@auth_router.post("/create_superuser", status_code=status.HTTP_202_ACCEPTED, tags=["apikey"])
async def create_superuser(
    admin: Annotated[bool, Depends(verify_admin_api_key)],
    db_session: db_dependency,
    email: str,
) -> None:
    if admin:
        stmt = update(User).where(User.email == email).values(is_superuser=True)  # type: ignore  # noqa: PGH003
        await db_session.execute(stmt)
        await db_session.commit()
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
