import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception

from .schemas import CFDataCountModel
from .service import process_cf_data

log = logging.getLogger("uvicorn.error")

cf_games_router = APIRouter(prefix="/cfgames", tags=["cfgames"])


@cf_games_router.get("/refresh", status_code=status.HTTP_200_OK, response_model=CFDataCountModel, tags=["apikey"])
async def refresh_cf_games_data(
    api_key_admin: api_key_admin_dependency,
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> dict[str, Any]:
    if api_key_admin:
        try:
            return await process_cf_data(db_session=db_session, affiliate_id=affiliate_id, year=year)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing CF data",
            ) from e
    else:
        raise unauthorised_exception()
