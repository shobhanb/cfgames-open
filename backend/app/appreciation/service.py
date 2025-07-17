from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Appreciation
from .schemas import AppreciationModel


async def get_db_appreciation(
    db_session: AsyncSession,
    crossfit_id: int | None = None,
    year: int | None = None,
    ordinal: int | None = None,
) -> list[Appreciation]:
    stmt = select(Appreciation)
    if year:
        stmt = stmt.where(Appreciation.year == year)
    if ordinal:
        stmt = stmt.where(Appreciation.ordinal == ordinal)
    if crossfit_id:
        stmt = stmt.where(Appreciation.crossfit_id == crossfit_id)
    ret = await db_session.execute(stmt)
    results = ret.scalars().all()
    return list(results)


async def update_db_appreciation(
    db_session: AsyncSession,
    input_data: AppreciationModel,
) -> Appreciation:
    appreciation = await Appreciation.find(
        db_session,
        crossfit_id=input_data.crossfit_id,
        ordinal=input_data.ordinal,
        year=input_data.year,
    )
    if appreciation:
        for var, value in vars(input_data).items():
            setattr(appreciation, var, value) if value else None
    else:
        appreciation = Appreciation(**input_data.model_dump())
        db_session.add(appreciation)

    await db_session.commit()
    return appreciation
