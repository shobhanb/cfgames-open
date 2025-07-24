from app.schemas import CustomBaseModel


class AthletePrefsOutputModel(CustomBaseModel):
    name: str
    crossfit_id: int
    preference_nbr: int
    preference: str


class AthletePrefsModel(CustomBaseModel):
    preference_nbr: int
    preference: str
