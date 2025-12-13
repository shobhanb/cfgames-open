from sqlalchemy.ext.asyncio import AsyncSession

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
from .schemas import AffiliateConfigCreate, AffiliateConfigUpdate


async def get_db_affiliate_config(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> AffiliateConfig | None:
    return await AffiliateConfig.find(
        async_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
    )


async def get_db_affiliate_configs(
    db_session: AsyncSession,
    affiliate_id: int,
) -> list[AffiliateConfig]:
    return list(
        await AffiliateConfig.find_all(
            async_session=db_session,
            affiliate_id=affiliate_id,
        ),
    )


async def create_db_affiliate_config(
    db_session: AsyncSession,
    config_data: AffiliateConfigCreate,
) -> AffiliateConfig:
    new_config = AffiliateConfig(
        affiliate_id=config_data.affiliate_id,
        year=config_data.year,
        masters_age_cutoff=config_data.masters_age_cutoff,
        open_age_cutoff=config_data.open_age_cutoff,
        participation_score=config_data.participation_score,
        top3_score=config_data.top3_score,
        judge_score=config_data.judge_score,
        attendance_score=config_data.attendance_score,
        default_appreciation_score=config_data.default_appreciation_score,
        default_side_score=config_data.default_side_score,
    )
    db_session.add(new_config)
    await db_session.commit()
    await db_session.refresh(new_config)
    return new_config


async def update_db_affiliate_config(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    config_data: AffiliateConfigUpdate,
) -> AffiliateConfig:
    config = await AffiliateConfig.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
    )

    update_data = config_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)

    db_session.add(config)
    await db_session.commit()
    await db_session.refresh(config)
    return config


async def delete_db_affiliate_config(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> None:
    config = await AffiliateConfig.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
    )
    await config.delete(async_session=db_session)


async def get_config_or_defaults(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> AffiliateConfig:
    """Get affiliate config or return a config object with default values from constants."""
    config = await get_db_affiliate_config(db_session=db_session, affiliate_id=affiliate_id, year=year)

    if config:
        return config

    # Return a config object with default values (not saved to DB)
    return AffiliateConfig(
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
