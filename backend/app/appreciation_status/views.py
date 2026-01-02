from collections.abc import Sequence

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.exceptions import conflict_exception
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .models import AppreciationStatus
from .schemas import AppreciationStatusModel

appreciation_open_router = APIRouter(prefix="/appreciation_status", tags=["appreciation_status"])


@appreciation_open_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationStatusModel],
)
async def get_open_appreciation_status(
    db_session: db_dependency,
    _: verified_user_dependency,
    affiliate_id: int,
    year: int,
) -> Sequence[AppreciationStatus]:
    return await AppreciationStatus.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)


@appreciation_open_router.put(
    "/",
    status_code=status.HTTP_201_CREATED,
)
async def add_open_appreciation_status(
    db_session: db_dependency,
    _: admin_user_dependency,
    data: AppreciationStatusModel,
) -> None:
    appreciation_open = await AppreciationStatus.find(
        async_session=db_session,
        affiliate_id=data.affiliate_id,
        year=data.year,
        ordinal=data.ordinal,
    )
    if appreciation_open:
        raise conflict_exception()

    appreciation_status = AppreciationStatus(**data.model_dump())
    db_session.add(appreciation_status)
    await db_session.commit()


@appreciation_open_router.delete(
    "/",
    status_code=status.HTTP_200_OK,
)
async def delete_open_appreciation_status(
    db_session: db_dependency,
    _: admin_user_dependency,
    data: AppreciationStatusModel,
) -> None:
    appreciation_open = await AppreciationStatus.find_or_raise(
        async_session=db_session,
        affiliate_id=data.affiliate_id,
        year=data.year,
        ordinal=data.ordinal,
    )
    await appreciation_open.delete(async_session=db_session)
