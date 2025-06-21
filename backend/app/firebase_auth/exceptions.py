from fastapi import HTTPException, status


def invalid_input_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Invalid Inputs"
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )


def firebase_error(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Firebae Error"
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=detail,
    )


def already_assigned_exception(detail: str | None = None) -> HTTPException:
    if not detail:
        detail = "Athlete already assigned"
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )
