from fastapi import HTTPException, status
from firebase_admin.exceptions import FirebaseError


def invalid_input_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Invalid Inputs"
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )


def firebase_error(e: FirebaseError) -> HTTPException:
    detail = getattr(e, "default_message", getattr(e, "code", str(e))) or "Firebase Error"
    status_code = getattr(e.http_response, "status_code", status.HTTP_400_BAD_REQUEST)
    return HTTPException(
        status_code=status_code,
        detail=detail,
    )


def already_assigned_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Athlete already assigned"
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )
