import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import firebase_admin
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.affiliate_config.views import affiliate_config_router
from app.appreciation.views import appreciation_router
from app.appreciation_score.views import appreciation_score_router
from app.appreciation_status.views import appreciation_open_router
from app.athlete.views import athlete_router
from app.athlete_prefs.views import athlete_prefs_router
from app.attendance.views import attendance_router
from app.cf_games.views import cf_games_router
from app.database.base import Base
from app.database.core import session_manager
from app.events.views import cf_events_router
from app.firebase_auth.views import firebase_auth_router
from app.home_blog.views import home_blog_router
from app.score.views import score_router
from app.settings import env_settings, url_settings
from app.sidescore.views import sidescore_router
from app.teams.views import teams_router

log = logging.getLogger("uvicorn.error")

RESET_DB = False

cred = firebase_admin.credentials.Certificate("firebase_service_account_key.json")
default_app = firebase_admin.initialize_app(credential=cred)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator:
    # Run pre-load stuff
    if RESET_DB:
        async with session_manager.connect() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    yield


app_configs: dict[str, Any] = {"debug": True, "title": "CF Games Community Cup API", "lifespan": lifespan}

ENVIRONMENT = env_settings.environment
DEV_ENVIRONMENTS = {"local", "dev", "test"}
if ENVIRONMENT not in DEV_ENVIRONMENTS:
    app_configs["openapi_url"] = None

app = FastAPI(**app_configs)

app.include_router(cf_events_router)
app.include_router(cf_games_router)
app.include_router(firebase_auth_router)
app.include_router(athlete_router)
app.include_router(score_router)
app.include_router(attendance_router)
app.include_router(appreciation_score_router)
app.include_router(appreciation_router)
app.include_router(appreciation_open_router)
app.include_router(sidescore_router)
app.include_router(teams_router)
app.include_router(athlete_prefs_router)
app.include_router(home_blog_router)
app.include_router(affiliate_config_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[url_settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "Ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
