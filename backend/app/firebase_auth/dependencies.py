from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin.auth import verify_id_token

from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception

from .models import FirebaseUser

firebase_bearer_scheme = HTTPBearer()


async def get_firebase_user_from_token(
    token: Annotated[HTTPAuthorizationCredentials, Depends(firebase_bearer_scheme)],
) -> dict:
    return verify_id_token(token.credentials)


async def get_verified_user(
    user_record: Annotated[dict, Depends(get_firebase_user_from_token)],
    db_session: db_dependency,
) -> FirebaseUser:
    if user_record.get("email_verified"):
        return await FirebaseUser.find_or_raise(async_session=db_session, uid=user_record.get("uid"))
    raise unauthorised_exception()


async def get_admin_user(
    user_record: Annotated[dict, Depends(get_firebase_user_from_token)],
    db_session: db_dependency,
) -> FirebaseUser:
    if user_record.get("admin") and user_record.get("email_verified"):
        return await FirebaseUser.find_or_raise(async_session=db_session, uid=user_record.get("uid"))
    raise unauthorised_exception()


#
# Dependencies
#

verified_user_dependency = Annotated[FirebaseUser, Depends(get_verified_user)]
admin_user_dependency = Annotated[FirebaseUser, Depends(get_admin_user)]
