from typing import Annotated

from fastapi import Depends

from .core import fastapi_users
from .models import User

# FastAPI current users

current_verified_user = fastapi_users.current_user(active=True, verified=True)
current_superuser = fastapi_users.current_user(active=True, verified=True, superuser=True)

# Annotated dependency

current_verified_user_dependency = Annotated[User, Depends(current_verified_user)]
current_superuser_dependency = Annotated[User, Depends(current_superuser)]
