import logging
from collections.abc import Sequence
from uuid import UUID

from fastapi import APIRouter, status

from app.database.dependencies import db_dependency
from app.firebase_auth.dependencies import admin_user_dependency

from .models import HomeBlog
from .schemas import CreateHomeBlogModel, HomeBlogModel

log = logging.getLogger("uvicorn.error")

home_blog_router = APIRouter(prefix="/home_blog", tags=["home_blog"])


@home_blog_router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[HomeBlogModel],
)
async def get_home_blog(
    db_session: db_dependency,
    affiliate_id: int,
    year: int,
) -> Sequence[HomeBlog]:
    return await HomeBlog.find_all(async_session=db_session, affiliate_id=affiliate_id, year=year)


@home_blog_router.post(
    "/",
    status_code=status.HTTP_200_OK,
)
async def add_home_blog(
    db_session: db_dependency,
    _: admin_user_dependency,
    affiliate_id: int,
    year: int,
    data: CreateHomeBlogModel,
) -> None:
    new_blog = HomeBlog(**data.model_dump(), affiliate_id=affiliate_id, year=year)
    db_session.add(new_blog)
    await db_session.commit()


@home_blog_router.patch(
    "/",
    status_code=status.HTTP_200_OK,
)
async def update_home_blog(
    db_session: db_dependency,
    _: admin_user_dependency,
    _id: UUID,
    data: CreateHomeBlogModel,
) -> None:
    blog = await HomeBlog.find_or_raise(async_session=db_session, id=_id)

    for var, value in vars(data).items():
        setattr(blog, var, value) if value else None

    db_session.add(blog)
    await db_session.commit()


@home_blog_router.delete(
    "/",
    status_code=status.HTTP_200_OK,
)
async def delete_home_blog(
    db_session: db_dependency,
    _: admin_user_dependency,
    _id: UUID,
) -> None:
    new_blog = await HomeBlog.find_or_raise(async_session=db_session, id=_id)
    await new_blog.delete(async_session=db_session)
