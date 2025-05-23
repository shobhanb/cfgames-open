from fastapi import Depends

from app.settings import auth_settings

from .core import api_key_scheme

#
# API Key Auth
#


async def verify_admin_api_key(key: str = Depends(api_key_scheme)) -> bool:
    return key == auth_settings.admin_api_key
