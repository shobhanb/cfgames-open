from __future__ import annotations

from fastapi import HTTPException, status


def bearer_token_error(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Invalid Token"
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWWW-Authenticate": "Bearer"},
    )
