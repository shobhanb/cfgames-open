from fastapi import APIRouter, status

from app.apikey_auth.dependencies import api_key_admin_dependency
from app.database.dependencies import db_dependency

from .constants import (
    ATTENDANCE_SCORE,
    DEFAULT_APPRECIATION_SCORE,
    DEFAULT_SIDE_SCORE,
    JUDGE_SCORE,
    MASTERS_AGE_CUTOFF,
    OPEN_AGE_CUTOFF,
    PARTICIPATION_SCORE,
    TOP3_SCORE,
)
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
    response_model=AffiliateConfigModel,
)
async def initialize_affiliate_config(
    db_session: db_dependency,
    _: api_key_admin_dependency,
    affiliate_id: int,
    year: int,
) -> AffiliateConfig:
    """Initialize affiliate config with default values from constants."""
    config_data = AffiliateConfigCreate(
        affiliate_id=affiliate_id,
        year=year,
        masters_age_cutoff=MASTERS_AGE_CUTOFF,
        open_age_cutoff=OPEN_AGE_CUTOFF,
        participation_score=PARTICIPATION_SCORE,
        top3_score=TOP3_SCORE,
        judge_score=JUDGE_SCORE,
        attendance_score=ATTENDANCE_SCORE,
        default_appreciation_score=DEFAULT_APPRECIATION_SCORE,
        default_side_score=DEFAULT_SIDE_SCORE,
    )
    return await create_db_affiliate_config(db_session=db_session, config_data=config_data)
