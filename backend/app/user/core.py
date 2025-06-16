from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import BackgroundTasks, Depends
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, BearerTransport
from fastapi_users.authentication.strategy.db import AccessTokenDatabase, DatabaseStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import SQLAlchemyAccessTokenDatabase
from httpx_oauth.clients.google import GoogleOAuth2

from app.database.dependencies import db_dependency
from app.settings import auth_settings

from .models import AccessToken, OAuthAccount, User, UserManager

#
# User DB Dependency
#


async def get_user_db(session: db_dependency) -> AsyncGenerator:
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)


#
# Transport
#

bearer_transport = BearerTransport(tokenUrl="auth/login")

#
# Strategy
#

# Token DB Dependency


async def get_access_token_db(session: db_dependency) -> AsyncGenerator:
    yield SQLAlchemyAccessTokenDatabase(session, AccessToken)


def get_database_strategy(
    access_token_db: Annotated[AccessTokenDatabase[AccessToken], Depends(get_access_token_db)],
) -> DatabaseStrategy:
    return DatabaseStrategy(access_token_db, lifetime_seconds=auth_settings.token_lifetime_seconds)


#
# Backend
#

auth_backend = AuthenticationBackend(name="db", transport=bearer_transport, get_strategy=get_database_strategy)

#
# User Manager DB dependency
#


async def get_user_manager(
    user_db: Annotated[SQLAlchemyUserDatabase, Depends(get_user_db)],
    background_tasks: BackgroundTasks,
) -> AsyncGenerator:
    yield UserManager(user_db, background_tasks)


#
# Google Oauth2 client
#

google_oauth_client = GoogleOAuth2(auth_settings.google_oauth_client_id, auth_settings.google_oauth_client_secret)


#
# Main fastapi_users instance
#

fastapi_users = FastAPIUsers[User, UUID](get_user_manager, [auth_backend])
