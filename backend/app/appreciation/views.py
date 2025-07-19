from fastapi import APIRouter, status

from app.appreciation_status.models import AppreciationStatus
from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception
from app.firebase_auth.dependencies import verified_user_dependency

from .models import Appreciation
from .schemas import AppreciationModel
from .service import get_db_appreciation, update_db_appreciation

appreciation_router = APIRouter(prefix="/appreciation", tags=["appreciation"])


@appreciation_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationModel],
)
async def get_my_appreciation(
    db_session: db_dependency,
    user: verified_user_dependency,
    year: int | None = None,
    ordinal: int | None = None,
) -> list[Appreciation]:
    return await get_db_appreciation(db_session=db_session, crossfit_id=user.crossfit_id, year=year, ordinal=ordinal)


@appreciation_router.post(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=AppreciationModel,
)
async def update_my_appreciation(
    db_session: db_dependency,
    input_data: AppreciationModel,
    user: verified_user_dependency,
) -> Appreciation:
    if user.crossfit_id != input_data.crossfit_id:
        raise unauthorised_exception()
    appreciation_open = await AppreciationStatus.find(
        async_session=db_session,
        affiliate_id=input_data.affiliate_id,
        year=input_data.year,
        ordinal=input_data.ordinal,
    )
    if not appreciation_open:
        msg = "Event not open for appreciation submission"
        raise unauthorised_exception(detail=msg)
    return await update_db_appreciation(
        db_session=db_session,
        input_data=input_data,
    )


@appreciation_router.delete(
    "/",
    status_code=status.HTTP_202_ACCEPTED,
)
async def delete_my_appreciation(
    db_session: db_dependency,
    user: verified_user_dependency,
    year: int,
    ordinal: int,
) -> None:
    appreciation_open = await AppreciationStatus.find(
        async_session=db_session,
        affiliate_id=user.affiliate_id,
        year=year,
        ordinal=ordinal,
    )
    if not appreciation_open:
        msg = "Event not open for appreciation submission"
        raise unauthorised_exception(detail=msg)

    appreciation = await Appreciation.find_or_raise(
        async_session=db_session,
        crossfit_id=user.crossfit_id,
        year=year,
        ordinal=ordinal,
    )
    await appreciation.delete(async_session=db_session)
