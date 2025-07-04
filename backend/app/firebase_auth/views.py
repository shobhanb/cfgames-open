import logging

from fastapi import APIRouter, status
from firebase_admin import auth as fireauth
from firebase_admin.auth import ListUsersPage, UserRecord
from firebase_admin.exceptions import FirebaseError

from app.database.dependencies import db_dependency
from app.settings import admin_user_settings

from .dependencies import admin_user_dependency
from .exceptions import already_assigned_exception, firebase_error, invalid_input_exception
from .models import FirebaseUser
from .schemas import CreateUser, FirebaseCustomClaims, FirebaseUserRecord

log = logging.getLogger("uvicorn.error")

firebase_auth_router = APIRouter(prefix="/fireauth", tags=["fireauth"])


@firebase_auth_router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=FirebaseUserRecord)
async def create_user(
    db_session: db_dependency,
    user_info: CreateUser,
) -> UserRecord:
    athlete_assigned = await FirebaseUser.find(async_session=db_session, crossfit_id=user_info.crossfit_id)
    if athlete_assigned:
        raise already_assigned_exception()

    try:
        user: UserRecord = fireauth.create_user(
            email=user_info.email,
            password=user_info.password,
            display_name=user_info.display_name,
        )
    except ValueError as e:
        msg = "Value error - Invalid user inputs"
        raise invalid_input_exception(msg) from e
    except FirebaseError as e:
        raise firebase_error(e) from e

    user_custom_claims = FirebaseCustomClaims(
        crossfit_id=user_info.crossfit_id,
        affiliate_id=user_info.affiliate_id,
        affiliate_name=user_info.affiliate_name,
    )

    if user.email == admin_user_settings.admin_user_email:
        user_custom_claims.admin = True
    else:
        user_custom_claims.admin = False

    try:
        fireauth.set_custom_user_claims(uid=user.uid, custom_claims=user_custom_claims.model_dump_json())
    except ValueError as e:
        msg = "Invalid UID for custom claims"
        raise invalid_input_exception(msg) from e
    except FirebaseError as e:
        raise firebase_error(e) from e

    firebase_user = FirebaseUser(
        email=user_info.email,
        uid=user.uid,
        crossfit_id=user_info.crossfit_id,
        affiliate_id=user_info.affiliate_id,
        affiliate_name=user_info.affiliate_name,
    )
    db_session.add(firebase_user)
    await db_session.commit()

    return fireauth.get_user(user.uid)


@firebase_auth_router.post("/change-admin/{uid}", status_code=status.HTTP_202_ACCEPTED)
async def update_user_admin_rights(
    _: admin_user_dependency,
    uid: str,
    admin: bool,  # noqa: FBT001
) -> None:
    user: UserRecord = fireauth.get_user(uid=uid)
    claims = user.custom_claims or {}
    validated_claims = FirebaseCustomClaims.model_validate(claims)
    validated_claims.admin = admin

    fireauth.set_custom_user_claims(uid=user.uid, custom_claims=validated_claims.model_dump_json())


@firebase_auth_router.get("/user/{uid}", status_code=status.HTTP_200_OK, response_model=FirebaseUserRecord)
async def get_user_info(
    _: admin_user_dependency,
    uid: str,
) -> UserRecord:
    return fireauth.get_user(uid)


@firebase_auth_router.delete("/user/{uid}", status_code=status.HTTP_202_ACCEPTED)
async def delete_user(
    _: admin_user_dependency,
    db_session: db_dependency,
    uid: str,
) -> None:
    fireauth.delete_user(uid)
    user = await FirebaseUser.find(async_session=db_session, uid=uid)
    if user:
        await user.delete(async_session=db_session)


@firebase_auth_router.get("/all", status_code=status.HTTP_200_OK, response_model=list[FirebaseUserRecord])
async def get_all_users(
    _: admin_user_dependency,
) -> list[UserRecord]:
    page: ListUsersPage = fireauth.list_users()
    return list(page.iterate_all())


@firebase_auth_router.post("/refresh_all", status_code=status.HTTP_200_OK)
async def refresh_all_firebase_userdata(
    # _: api_key_admin_dependency,
    db_session: db_dependency,
) -> None:
    page: ListUsersPage = fireauth.list_users()
    user_list: list[UserRecord] = list(page.iterate_all())

    await FirebaseUser.delete_all(async_session=db_session)

    for user in user_list:
        if user.custom_claims:
            firebase_user = FirebaseUser(
                email=user.email,
                uid=user.uid,
                crossfit_id=user.custom_claims["crossfit_id"],
                affiliate_id=user.custom_claims["affiliate_id"],
                affiliate_name=user.custom_claims["affiliate_name"],
            )
            db_session.add(firebase_user)

    await db_session.commit()
