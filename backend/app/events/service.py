from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.score.models import Score

from .models import Events


async def get_events_with_data(db_session: AsyncSession, affiliate_id: int) -> Sequence[Events]:
    stmt = (
        select(Events)
        .distinct()
        .join_from(Events, Score, (Events.year == Score.year) & (Events.ordinal == Score.ordinal))
        .join_from(Score, Athlete, (Score.year == Athlete.year) & (Score.crossfit_id == Athlete.crossfit_id))
        .where(Athlete.affiliate_id == affiliate_id)
        .order_by(Events.year.desc(), Events.ordinal.desc())
    )
    results = await db_session.execute(stmt)
    return results.scalars().all()
