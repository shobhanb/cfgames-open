from app.schemas import CustomBaseModel


class AppreciationStatusModel(CustomBaseModel):
    affiliate_id: int
    year: int
    ordinal: int
