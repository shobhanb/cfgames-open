from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency

from .constants import AFFILIATE_CONFIG_DEFAULTS
from .models import AffiliateConfig
from .schemas import AffiliateConfigCreate, AffiliateConfigModel
from .service import (
    create_db_affiliate_config,
    get_db_affiliate_config,
)

affiliate_config_router = APIRouter(
    prefix="/affiliate_config",
    tags=["affiliate_config"],
)


@affiliate_config_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=AffiliateConfigModel | None,
)
async def get_affiliate_config(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> AffiliateConfig | None:
    """Get affiliate config for a specific affiliate and year."""
    return await get_db_affiliate_config(db_session=db_session, affiliate_id=affiliate_id, year=year)


@affiliate_config_router.post(
    "/initialize",
    status_code=status.HTTP_201_CREATED,
    response_model=list[AffiliateConfigModel],
)
async def initialize_affiliate_config(
    db_session: db_dependency,
    _: api_key_admin_dependency,
) -> list[AffiliateConfig]:
    """Initialize affiliate configs with default values from constants."""
    configs = []
    for config_dict in AFFILIATE_CONFIG_DEFAULTS:
        config_data = AffiliateConfigCreate(**config_dict)
        config = await create_db_affiliate_config(db_session=db_session, config_data=config_data)
        configs.append(config)
    return configs
