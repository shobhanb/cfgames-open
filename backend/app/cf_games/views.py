import logging
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import verify_admin_api_key
from app.cf_games.constants import AFFILIATE_ID, YEAR
from app.cf_games.service import process_cf_data
from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception

log = logging.getLogger("uvicorn.error")

cf_games_router = APIRouter(prefix="/cfgames", tags=["cfgames"])


@cf_games_router.get("/refresh", status_code=status.HTTP_200_OK)
async def refresh_cf_games_data(
    api_key_admin: Annotated[bool, Depends(verify_admin_api_key)],
    db_session: db_dependency,
    year: int = int(YEAR),
    affiliate_id: int = int(AFFILIATE_ID),
) -> None:
    if api_key_admin:
        await process_cf_data(db_session=db_session, affiliate_id=affiliate_id, year=year)
    else:
        raise unauthorised_exception()
