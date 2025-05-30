from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.appreciation.schemas import AppreciationModelInput
from app.athlete.models import Athlete

from .models import Appreciation


async def get_db_appreciation(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[Appreciation]:
    stmt = (
        select(Appreciation)
        .join_from(Appreciation, Athlete, Appreciation.athlete_id == Athlete.id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year) & (Appreciation.ordinal == ordinal))
    )
    ret = await db_session.execute(stmt)
    results = ret.scalars().all()
    return list(results)


async def update_db_appreciation(
    db_session: AsyncSession,
    athlete_id: UUID,
    ordinal: int,
    input_data: AppreciationModelInput,
) -> Appreciation:
    appreciation = await Appreciation.find(db_session, athlete_id=athlete_id, ordinal=ordinal)
    if appreciation:
        for var, value in vars(input_data).items():
            setattr(appreciation, var, value) if value else None
    else:
        appreciation = Appreciation(**input_data.model_dump(), athlete_id=athlete_id, ordinal=ordinal)
        db_session.add(appreciation)

    await db_session.commit()
    return appreciation
