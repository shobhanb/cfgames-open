from app.schemas import CustomBaseModel


class TeamsModel(CustomBaseModel):
    year: int
    affiliate_id: int
    team_name: str
    instagram: str
    logo_url: str
