from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.auth.dependencies import check_admin_all, get_firebase_token_data
from app.database.dependencies import db_dependency
from app.user.schemas import AddUserSchema
from app.user.service import add_custom_claim_athlete, queue_add_new_user

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.put("/me/{athlete_id}", status_code=status.HTTP_202_ACCEPTED)
async def user_put_queue_athleteid_assignment(
    form_data: AddUserSchema,
    db_session: db_dependency,
    token_data: Annotated[dict, Depends(get_firebase_token_data)],
) -> None:
    await queue_add_new_user(db_session=db_session, token_data=token_data, athlete_data=form_data)


@user_router.put("/validate/{athlete_id}", status_code=status.HTTP_202_ACCEPTED)
async def auth_put_validate_athleteid_assignment(
    athlete_id: int,
    db_session: db_dependency,
    _: Annotated[dict, Depends(check_admin_all)],
) -> None:
    await add_custom_claim_athlete(db_session=db_session, athlete_id=athlete_id)
