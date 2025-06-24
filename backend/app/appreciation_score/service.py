from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .models import AppreciationScore


async def get_db_appreciation(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[AppreciationScore]:
    stmt = (
        select(AppreciationScore)
        .join_from(AppreciationScore, Athlete, AppreciationScore.crossfit_id == Athlete.crossfit_id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )
    ret = await db_session.execute(stmt)
    results = ret.scalars().all()
    return list(results)


async def update_db_appreciation(
    db_session: AsyncSession,
    crossfit_id: int,
    ordinal: int,
    score: int,
) -> None:
    appreciation = await AppreciationScore.find(
        async_session=db_session,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
    )
    if appreciation:
        appreciation.score = score
        db_session.add(appreciation)
        await db_session.commit()
    else:
        new_appreciation = AppreciationScore(
            crossfit_id=crossfit_id,
            ordinal=ordinal,
            score=score,
        )
        db_session.add(new_appreciation)
        await db_session.commit()
