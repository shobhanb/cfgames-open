from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import (
    get_firebase_token_data,
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/me", status_code=status.HTTP_200_OK)
async def auth_get_current_user_info(user_data: Annotated[dict, Depends(get_firebase_token_data)]) -> dict:
    return user_data
