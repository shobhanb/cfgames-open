from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin.auth import UserRecord, verify_id_token

from app.exceptions import unauthorised_exception

firebase_bearer_scheme = HTTPBearer()


async def get_firebase_user_from_token(
    token: Annotated[HTTPAuthorizationCredentials, Depends(firebase_bearer_scheme)],
) -> UserRecord:
    return verify_id_token(token.credentials)


async def get_verified_user(user: Annotated[UserRecord, Depends(get_firebase_user_from_token)]) -> UserRecord:
    if user.email_verified:
        return user
    raise unauthorised_exception()


async def get_admin_user(user: Annotated[UserRecord, Depends(get_verified_user)]) -> UserRecord:
    custom_claims = user.custom_claims or {}
    if custom_claims.get("admin"):
        return user
    raise unauthorised_exception()


#
# Dependencies
#

verified_user_dependency = Annotated[UserRecord, Depends(get_verified_user)]
admin_user_dependency = Annotated[UserRecord, Depends(get_admin_user)]
