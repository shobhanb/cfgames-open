import logging
from collections.abc import Sequence
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.cf_games.models import CfGamesData
from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .schemas import CFDataCountModel, CFGamesDataModel
from .service import process_cf_data

log = logging.getLogger("uvicorn.error")

cf_games_router = APIRouter(prefix="/cfgames", tags=["cfgames"])


@cf_games_router.post("/admin-refresh", status_code=status.HTTP_200_OK, response_model=CFDataCountModel)
async def admin_refresh_cf_games_data(
    _: admin_user_dependency,
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> dict[str, Any]:
    try:
        return await process_cf_data(db_session=db_session, affiliate_id=affiliate_id, year=year)
    except Exception as e:
        log.exception("Error processing CF data: %s")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing CF data",
        ) from e


@cf_games_router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    response_model=CFDataCountModel,
    tags=["apikey"],
)
async def apikey_refresh_cf_games_data(
    _: api_key_admin_dependency,
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> dict[str, Any]:
    try:
        return await process_cf_data(db_session=db_session, affiliate_id=affiliate_id, year=year)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing CF data",
        ) from e


@cf_games_router.get(
    "/data/all",
    status_code=status.HTTP_200_OK,
    response_model=list[CFGamesDataModel],
)
async def get_all_cf_games_data_endpoint(
    db_session: db_dependency,
) -> Sequence[CfGamesData]:
    """Get all CF games data refresh timestamps."""
    return await CfGamesData.find_all(async_session=db_session)


@cf_games_router.get(
    "/data/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[CFGamesDataModel],
)
async def get_cf_games_data_endpoint(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> Sequence[CfGamesData]:
    """Get CF games data refresh timestamp for a specific affiliate and year."""
    return await CfGamesData.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)
