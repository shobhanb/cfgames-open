from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .core import get_async_session

db_dependency = Annotated[AsyncSession, Depends(get_async_session, use_cache=True)]
