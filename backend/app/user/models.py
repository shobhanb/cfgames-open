from __future__ import annotations

import logging
from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import BackgroundTasks, Request
from fastapi_mail import FastMail, MessageSchema, MessageType
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users.db import BaseUserDatabase, SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyBaseUserTableUUID
from fastapi_users.password import PasswordHelperProtocol
from fastapi_users_db_sqlalchemy.access_token import SQLAlchemyBaseAccessTokenTableUUID
from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.emailer.core import fastmail_config
from app.settings import auth_settings, url_settings

log = logging.getLogger("uvicorn.error")

if TYPE_CHECKING:
    pass


class AuthBase(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, AuthBase):
    affiliate: Mapped[str] = mapped_column(String)
    affiliate_id: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String)
    athlete_id: Mapped[int] = mapped_column(Integer, unique=True)
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship("OAuthAccount", lazy="joined")


class AccessToken(SQLAlchemyBaseAccessTokenTableUUID, AuthBase):
    pass


class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = auth_settings.reset_password_token_key
    verification_token_secret = auth_settings.verification_token_key

    def __init__(
        self,
        user_db: BaseUserDatabase[User, UUID],
        background_tasks: BackgroundTasks,
        password_helper: PasswordHelperProtocol | None = None,
    ) -> None:
        super().__init__(user_db, password_helper)
        self.background_tasks = background_tasks

    async def on_after_register(self, user: User, request: Request | None = None) -> None:
        log.info("Registered user %s", user.email)
        await self.request_verify(user=user)
        return await super().on_after_register(user, request)

    async def on_after_request_verify(self, user: User, token: str, request: Request | None = None) -> None:
        await self.send_verification_email(user=user, token=token)
        return await super().on_after_request_verify(user, token, request)

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None) -> None:
        await self.send_forgot_password_email(user=user, token=token)
        return await super().on_after_forgot_password(user, token, request)

    async def send_verification_email(self, user: User, token: str) -> None:
        link = f"{url_settings.frontend_url}/auth/verify/{token}"
        email_body = {"user": user, "link": link}
        message = MessageSchema(
            recipients=[user.email],
            subject="CF Games Verification Email",
            template_body=email_body,
            subtype=MessageType.html,
        )
        fm = FastMail(config=fastmail_config)
        self.background_tasks.add_task(fm.send_message, message, template_name="verification_email.html")

    async def send_forgot_password_email(self, user: User, token: str) -> None:
        link = f"{url_settings.frontend_url}/auth/reset-password/{token}"
        email_body = {"user": user, "link": link}
        message = MessageSchema(
            recipients=[user.email],
            subject="CF Games Reset Password",
            template_body=email_body,
            subtype=MessageType.html,
        )
        fm = FastMail(config=fastmail_config)
        self.background_tasks.add_task(fm.send_message, message, template_name="reset_password.html")


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, AuthBase):
    pass
