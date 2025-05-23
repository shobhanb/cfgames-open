from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete
from app.sidescore.models import SideScore

from .models import Teams


async def get_db_teams(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[Teams]:
    teams = await Teams.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)
    return list(teams)


async def update_db_teams(  # noqa: PLR0913
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    team_name: str,
    instagram: str | None,
    logo_url: str | None,
) -> Teams:
    team = await Teams.find(async_session=db_session, affiliate_id=affiliate_id, year=year, team_name=team_name)
    if team:
        team.instagram = instagram
        team.logo_url = logo_url
        db_session.add(team)
        await db_session.commit()
        return team

    new_team = Teams(affiliate_id=affiliate_id, year=year, team_name=team_name, instagram=instagram, logo_url=logo_url)
    db_session.add(new_team)
    await db_session.commit()
    return new_team


async def change_db_team_name(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
    team_name: str,
    new_team_name: str,
) -> Teams:
    # Change team name in Team table
    team = await Teams.find_or_raise(
        async_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        team_name=team_name,
    )
    team.team_name = new_team_name
    db_session.add(team)
    await db_session.commit()

    # Change team name in Athlete table
    select_stmt = select(Athlete.id).where(
        (Athlete.affiliate_id == affiliate_id) & (Athlete.year == year) & (Athlete.team_name == team_name),
    )
    update_stmt = update(Athlete).where(Athlete.id.in_(select_stmt.scalar_subquery())).values(team_name=new_team_name)

    await db_session.execute(update_stmt)
    await db_session.commit()

    # Change team name in side score table
    update_stmt = (
        update(SideScore)
        .where((SideScore.affiliate_id == affiliate_id) & (SideScore.year == year) & (SideScore.team_name == team_name))
        .values(team_name=new_team_name)
    )
    await db_session.execute(update_stmt)
    await db_session.commit()

    return team
