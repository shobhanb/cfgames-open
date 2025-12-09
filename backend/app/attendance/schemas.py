from app.schemas import CustomBaseModel


class AttendanceModel(CustomBaseModel):
    year: int
    affiliate_id: int
    name: str
    crossfit_id: int
    ordinal: int | None = None


class AttendanceUpdateModel(CustomBaseModel):
    year: int
    crossfit_id: int
    ordinal: int
    attendance: bool
