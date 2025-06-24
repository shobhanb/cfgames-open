from app.schemas import CustomBaseModel


class AppreciationScoreModel(CustomBaseModel):
    crossfit_id: int
    ordinal: int
    score: int
