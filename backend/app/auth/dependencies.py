from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from firebase_admin import auth
from firebase_admin.exceptions import FirebaseError

from app.auth.core import api_key_scheme, bearer_scheme
from app.auth.exceptions import bearer_token_error
from app.exceptions import unauthorised_exception
from app.settings import settings

#
# API Key Auth
#


async def verify_admin_api_key(key: str = Depends(api_key_scheme)) -> bool:
    return key == settings.admin_api_key


#
# Firebase Auth
#


async def get_firebase_token_data(
    token: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> dict:
    try:
        if not token:
            raise bearer_token_error()
        return auth.verify_id_token(id_token=token)
    except FirebaseError as e:
        raise unauthorised_exception() from e


async def get_current_user_uid(token_data: Annotated[dict, Depends(get_firebase_token_data)]) -> str:
    return token_data["uid"]


async def get_current_user_email(token_data: Annotated[dict, Depends(get_firebase_token_data)]) -> str:
    return token_data["email"]


async def get_current_admin_user(token_data: Annotated[dict, Depends(get_firebase_token_data)]) -> bool:
    return token_data["admin"] is True


async def get_current_user_competitor_id(token_data: Annotated[dict, Depends(get_firebase_token_data)]) -> int:
    return token_data["AthleteId"]
