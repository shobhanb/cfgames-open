from fastapi import APIRouter, status
from firebase_admin import auth as fireauth
from firebase_admin.auth import ListUsersPage, UserRecord
from firebase_admin.exceptions import FirebaseError

from app.database.dependencies import db_dependency

from .dependencies import admin_user_dependency
from .exceptions import already_assigned_exception, invalid_input_exception
from .models import FirebaseUser
from .schemas import CreateUser, FirebaseCustomClaims, FirebaseUserRecord

firebase_auth_router = APIRouter(prefix="/fireauth", tags=["fireauth"])


@firebase_auth_router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=FirebaseUserRecord)
async def create_user(
    db_session: db_dependency,
    user_info: CreateUser,
) -> UserRecord:
    athlete_assigned = await FirebaseUser.find(async_session=db_session, athlete_id=user_info.athlete_id)
    if athlete_assigned:
        raise already_assigned_exception()

    try:
        user: UserRecord = fireauth.create_user(
            email=user_info.email,
            password=user_info.password,
            display_name=user_info.display_name,
        )
    except (ValueError, FirebaseError) as e:
        msg = "Error creating user"
        raise invalid_input_exception(msg) from e

    user_custom_claims = FirebaseCustomClaims(
        athlete_id=user_info.athlete_id,
        affiliate_id=user_info.affiliate_id,
        affiliate_name=user_info.affiliate_name,
    )

    try:
        fireauth.set_custom_user_claims(uid=user.uid, custom_claims=user_custom_claims.model_dump_json())
    except (ValueError, FirebaseError) as e:
        msg = "Error assigning user claims"
        raise invalid_input_exception(msg) from e

    firebase_user = FirebaseUser(
        email=user_info.email,
        athlete_id=user_info.athlete_id,
        affiliate_id=user_info.affiliate_id,
        affiliate_name=user_info.affiliate_name,
    )
    db_session.add(firebase_user)
    await db_session.commit()

    return fireauth.get_user(user.uid)


@firebase_auth_router.post("/admin/{uid}", status_code=status.HTTP_202_ACCEPTED)
async def make_user_admin(
    _: admin_user_dependency,
    uid: str,
) -> None:
    user: UserRecord = fireauth.get_user(uid=uid)
    claims = user.custom_claims or {}
    validated_claims = FirebaseCustomClaims.model_validate(claims)
    validated_claims.admin = True

    fireauth.set_custom_user_claims(uid=user.uid, custom_claims=validated_claims.model_dump_json())


@firebase_auth_router.get("/{email}", status_code=status.HTTP_200_OK, response_model=FirebaseUserRecord)
async def get_user_info(
    _: admin_user_dependency,
    email: str,
) -> UserRecord:
    return fireauth.get_user_by_email(email)


@firebase_auth_router.delete("/{uid}", status_code=status.HTTP_202_ACCEPTED)
async def delete_user(
    _: admin_user_dependency,
    uid: str,
) -> None:
    fireauth.delete_user(uid)


@firebase_auth_router.get("/all", status_code=status.HTTP_200_OK, response_model=list[FirebaseUserRecord])
async def get_all_users(
    _: admin_user_dependency,
) -> list[UserRecord]:
    page: ListUsersPage = fireauth.list_users()
    return list(page.iterate_all())
