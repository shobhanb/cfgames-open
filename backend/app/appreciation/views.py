from collections.abc import Sequence
from typing import Any

from fastapi import APIRouter, status

from app.appreciation_status.models import AppreciationStatus
from app.database.dependencies import db_dependency
from app.exceptions import unauthorised_exception
from app.firebase_auth.dependencies import admin_user_dependency, verified_user_dependency

from .models import Appreciation
from .schemas import (
    AppreciationCountsModel,
    AppreciationModel,
    AppreciationResultDetail,
    AppreciationResultNotes,
    AppreciationResults,
)
from .service import (
    get_db_appreciation,
    get_db_appreciation_counts,
    get_db_appreciation_results,
    get_db_appreciation_results_detail,
    get_db_appreciation_text,
    update_db_appreciation,
)

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


@appreciation_router.get(
    "/my-appreciation-text",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationResultNotes],
)
async def get_my_appreciation_text(
    db_session: db_dependency,
    user: verified_user_dependency,
    year: int,
) -> list[dict[str, Any]]:
    return await get_db_appreciation_text(
        db_session=db_session,
        crossfit_id=user.crossfit_id,
        year=year,
    )


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
    appreciation_status = await AppreciationStatus.find(
        async_session=db_session,
        affiliate_id=input_data.affiliate_id,
        year=input_data.year,
        ordinal=input_data.ordinal,
    )
    if not appreciation_status:
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
    appreciation_status = await AppreciationStatus.find(
        async_session=db_session,
        affiliate_id=user.affiliate_id,
        year=year,
        ordinal=ordinal,
    )
    if not appreciation_status:
        msg = "Event not open for appreciation submission"
        raise unauthorised_exception(detail=msg)

    appreciation = await Appreciation.find_or_raise(
        async_session=db_session,
        crossfit_id=user.crossfit_id,
        year=year,
        ordinal=ordinal,
    )
    await appreciation.delete(async_session=db_session)


@appreciation_router.get(
    "/all",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationModel],
)
async def get_all_appreciation(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> Sequence[Appreciation]:
    return await Appreciation.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year, ordinal=ordinal)


@appreciation_router.get(
    "/counts",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationCountsModel],
)
async def get_appreciation_counts(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int | None = None,
) -> list[dict[str, Any]]:
    return await get_db_appreciation_counts(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@appreciation_router.get(
    "/results",
    status_code=status.HTTP_200_OK,
    response_model=list[AppreciationResults],
)
async def get_appreciation_results(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
) -> list[dict[str, Any]]:
    return await get_db_appreciation_results(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
    )


@appreciation_router.get(
    "/detail",
    status_code=status.HTTP_200_OK,
    response_model=AppreciationResultDetail,
)
async def get_appreciation_results_detail(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    ordinal: int,
    crossfit_id: int,
) -> dict[str, list[dict[str, Any]]]:
    return await get_db_appreciation_results_detail(
        db_session=db_session,
        affiliate_id=affiliate_id,
        year=year,
        ordinal=ordinal,
        crossfit_id=crossfit_id,
    )
