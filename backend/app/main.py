from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.athlete.views import athlete_router
from app.auth.views import auth_router
from app.cf_games.views import cf_games_router
from app.database.base import Base
from app.database.engine import session_manager
from app.settings import settings

RESET_DB = False


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator:
    # Run pre-load stuff
    if RESET_DB:
        async with session_manager.connect() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
    yield


ENVIRONMENT = settings.environment
SHOW_DOCS_ENVIRONMENT = {"local", "dev", "test"}

app_configs: dict[str, Any] = {"debug": True, "title": "CF Games API", "lifespan": lifespan}
if ENVIRONMENT not in SHOW_DOCS_ENVIRONMENT:
    app_configs["openapi_url"] = None

app = FastAPI(**app_configs)

app.include_router(cf_games_router)
app.include_router(auth_router)
app.include_router(athlete_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


@app.get("/health")
async def health_check() -> dict:
    return {"status": "Ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
