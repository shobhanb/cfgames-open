from typing import Any

from sqlalchemy import func, select
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


async def get_db_appreciation_text(
    db_session: AsyncSession,
    crossfit_id: int,
    year: int,
) -> list[dict[str, Any]]:
    stmt_team = select(Appreciation.year, Appreciation.ordinal, Appreciation.team_vote_text.label("text")).where(
        (Appreciation.team_vote_crossfit_id == crossfit_id) & (Appreciation.year == year),
    )
    stmt_non_team = select(
        Appreciation.year,
        Appreciation.ordinal,
        Appreciation.non_team_vote_text.label("text"),
    ).where(
        (Appreciation.non_team_vote_crossfit_id == crossfit_id) & (Appreciation.year == year),
    )
    ret = await db_session.execute(stmt_team.union_all(stmt_non_team))
    results = ret.mappings().all()
    return [dict(x) for x in results]


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


async def get_db_appreciation_counts(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int | None = None,
) -> list[dict[str, Any]]:
    stmt = (
        select(Appreciation.affiliate_id, Appreciation.year, Appreciation.ordinal, func.count().label("count"))
        .where(
            (Appreciation.affiliate_id == affiliate_id) & (Appreciation.year == year),
        )
        .group_by(Appreciation.affiliate_id, Appreciation.year, Appreciation.ordinal)
    )
    if ordinal:
        stmt = stmt.where(Appreciation.ordinal == ordinal)

    ret = await db_session.execute(stmt)
    results = ret.mappings().all()
    return [dict(x) for x in results]


async def get_db_appreciation_results(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    stmt = select(Appreciation.team_vote_crossfit_id, Appreciation.non_team_vote_crossfit_id).where(
        (Appreciation.affiliate_id == affiliate_id) & (Appreciation.year == year) & (Appreciation.ordinal == ordinal),
    )
    result = await db_session.execute(stmt)
    appreciations = result.mappings().all()

    if not appreciations:
        return []

    team_votes: list[int] = [x["team_vote_crossfit_id"] for x in appreciations]
    non_team_votes: list[int] = [x["non_team_vote_crossfit_id"] for x in appreciations]
    all_votes: list[int] = [*team_votes, *non_team_votes]

    all_crossfit_ids = set(all_votes)

    return [
        {
            "affiliate_id": affiliate_id,
            "year": year,
            "ordinal": ordinal,
            "crossfit_id": crossfit_id,
            "team_votes": team_votes.count(crossfit_id),
            "non_team_votes": non_team_votes.count(crossfit_id),
            "total_votes": all_votes.count(crossfit_id),
        }
        for crossfit_id in all_crossfit_ids
    ]


async def get_db_appreciation_results_detail(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    ordinal: int,
    crossfit_id: int,
) -> dict[str, list[dict[str, Any]]]:
    team_stmt = select(Appreciation.crossfit_id, Appreciation.team_vote_text.label("comment")).where(
        (Appreciation.affiliate_id == affiliate_id)
        & (Appreciation.year == year)
        & (Appreciation.ordinal == ordinal)
        & (Appreciation.team_vote_crossfit_id == crossfit_id),
    )
    non_team_stmt = select(Appreciation.crossfit_id, Appreciation.non_team_vote_text.label("comment")).where(
        (Appreciation.affiliate_id == affiliate_id)
        & (Appreciation.year == year)
        & (Appreciation.ordinal == ordinal)
        & (Appreciation.non_team_vote_crossfit_id == crossfit_id),
    )
    result = await db_session.execute(team_stmt)
    team_results = result.mappings().all()
    result = await db_session.execute(non_team_stmt)
    non_team_results = result.mappings().all()

    return {
        "team_votes": [dict(x) for x in team_results],
        "non_team_votes": [dict(x) for x in non_team_results],
    }
