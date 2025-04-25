from __future__ import annotations

import logging
import sys

from fastapi import HTTPException, status

log = logging.getLogger("uvicorn.error")


def handle_exception(exc_type, exc_value, exc_traceback) -> None:  # noqa: ANN001
    """Handle uncaught exception."""
    if issubclass(exc_type, KeyboardInterrupt):
        sys.excepthook(exc_type, exc_value, exc_traceback)
        return
    log.critical("Uncaught Exception", exc_info=(exc_type, exc_value, exc_traceback))


def unauthorised_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Unauthorized"
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
    )


def not_found_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "No rep!"
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=detail,
    )
