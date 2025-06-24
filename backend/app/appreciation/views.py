from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .models import Appreciation
from .schemas import AppreciationModelInput, AppreciationModelOutput
from .service import get_db_appreciation, update_db_appreciation

appreciation_router = APIRouter(prefix="/appreciation", tags=["appreciation"])


@appreciation_router.get(
    "/{affiliate_id}/{year}/{ordinal}",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationModelOutput],
)
async def get_appreciation(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    _: admin_user_dependency,
) -> list[Appreciation]:
    return await get_db_appreciation(db_session=db_session, affiliate_id=affiliate_id, year=year, ordinal=ordinal)


@appreciation_router.post(
    "/{crossfit_id}/{ordinal}",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=AppreciationModelOutput,
)
async def update_appreciation(
    db_session: db_dependency,
    crossfit_id: int,
    ordinal: int,
    input_data: AppreciationModelInput,
    user: verified_user_dependency,
) -> Appreciation:
    if user.crossfit_id != crossfit_id:
        raise unauthorised_exception()
    return await update_db_appreciation(
        db_session=db_session,
        crossfit_id=crossfit_id,
        ordinal=ordinal,
        input_data=input_data,
    )
