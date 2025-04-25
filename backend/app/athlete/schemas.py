from app.schemas import CustomBaseModel


class AffiliateAthlete(CustomBaseModel):
    affiliate_name: str
    affiliate_id: int
    name: str
    competitor_id: int
