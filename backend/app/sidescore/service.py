from typing import Literal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import SideScore


async def get_db_sidescores(
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
) -> list[SideScore]:
    stmt = select(SideScore).where((SideScore.year == year) & (SideScore.affiliate_id == affiliate_id))
    ret = await db_session.execute(stmt)
    result = ret.scalars().all()
    return list(result)


async def update_db_sidescores(  # noqa: PLR0913
    db_session: AsyncSession,
    year: int,
    affiliate_id: int,
    ordinal: int,
    score_type: Literal["side_challenge", "spirit"],
    team_name: str,
    score: int,
) -> SideScore:
    sidescore = await SideScore.find(
        async_session=db_session,
        year=year,
        affiliate_id=affiliate_id,
        ordinal=ordinal,
        score_type=score_type,
        team_name=team_name,
    )
    if sidescore:
        sidescore.score = score
        db_session.add(sidescore)
        await db_session.commit()
        return sidescore

    new_sidescore = SideScore(
        year=year,
        affiliate_id=affiliate_id,
        ordinal=ordinal,
        score_type=score_type,
        team_name=team_name,
        score=score,
    )
    db_session.add(new_sidescore)
    await db_session.commit()
    return new_sidescore


async def delete_db_sidescore(
    db_session: AsyncSession,
    sidescore_id: UUID,
) -> None:
    sidescore = await SideScore.find_or_raise(async_session=db_session, id=sidescore_id)
    await sidescore.delete(async_session=db_session)
