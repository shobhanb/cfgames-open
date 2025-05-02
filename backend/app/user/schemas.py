from app.schemas import CustomBaseModel


class AddUserSchema(CustomBaseModel):
    cf_gym: str
    cf_name: str
    athlete_id: int
