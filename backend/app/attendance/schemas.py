from app.schemas import CustomBaseModel


class AttendanceModel(CustomBaseModel):
    year: int
    affiliate_id: int
    name: str
    crossfit_id: int
    ordinal: int
