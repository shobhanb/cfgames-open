from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .models import IndividualSideScores
from .schemas import IndividualSideScoreModel


async def get_db_individual_side_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[IndividualSideScores]:
    stmt = (
        select(IndividualSideScores)
        .join_from(IndividualSideScores, Athlete, IndividualSideScores.crossfit_id == Athlete.crossfit_id)
        .where((Athlete.affiliate_id == affiliate_id) & (Athlete.year == year))
    )
    ret = await db_session.execute(stmt)
    results = ret.scalars().all()
    return list(results)


async def update_db_individual_side_score(
    db_session: AsyncSession,
    input_data: IndividualSideScoreModel,
) -> None:
    appreciation = await IndividualSideScores.find(
        async_session=db_session,
        affiliate_id=input_data.affiliate_id,
        year=input_data.year,
        crossfit_id=input_data.crossfit_id,
        ordinal=input_data.ordinal,
    )
    if appreciation:
        appreciation.score_type = input_data.score_type
        appreciation.score = input_data.score
        db_session.add(appreciation)
        await db_session.commit()
    else:
        new_appreciation = IndividualSideScores(
            affiliate_id=input_data.affiliate_id,
            year=input_data.year,
            crossfit_id=input_data.crossfit_id,
            ordinal=input_data.ordinal,
            score_type=input_data.score_type,
            score=input_data.score,
        )
        db_session.add(new_appreciation)
        await db_session.commit()


async def delete_db_individual_side_score(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    crossfit_id: int,
    ordinal: int,
) -> None:
    appreciation = await IndividualSideScores.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
    )
    await appreciation.delete(async_session=db_session)
