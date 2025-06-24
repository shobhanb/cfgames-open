from fastapi import APIRouter, HTTPException, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .models import Teams
from .schemas import TeamsModel
from .service import change_db_team_name, get_db_teams, update_db_teams

teams_router = APIRouter(prefix="/teams", tags=["teams"])


@teams_router.get(
    "/{affiliate_id}/{year}/",
    status_code=status.HTTP_200_OK,
    response_model=list[TeamsModel],
)
async def get_teams(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> list[Teams]:
    return await get_db_teams(db_session=db_session, year=year, affiliate_id=affiliate_id)


@teams_router.post("/update/{affiliate_id}/{year}/", status_code=status.HTTP_202_ACCEPTED, response_model=TeamsModel)
async def update_team_info(  # noqa: PLR0913
    _: admin_user_dependency,
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    team_name: str,
    instagram: str | None = None,
    logo_url: str | None = None,
) -> Teams:
    return await update_db_teams(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        team_name=team_name,
        instagram=instagram,
        logo_url=logo_url,
    )


@teams_router.post(
    "/rename/{affiliate_id}/{year}/{team_name}/{new_team_name}",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=TeamsModel,
)
async def rename_team(
    _: admin_user_dependency,
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    team_name: str,
    new_team_name: str,
) -> Teams:
    if team_name == new_team_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New team name should be different from current team name",
        )
    return await change_db_team_name(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        team_name=team_name,
        new_team_name=new_team_name,
    )
