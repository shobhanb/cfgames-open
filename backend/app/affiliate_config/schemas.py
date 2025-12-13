from app.schemas import CustomBaseModel


class AffiliateConfigBase(CustomBaseModel):
    masters_age_cutoff: int = 55
    open_age_cutoff: int = 35
    participation_score: int = 1
    top3_score: int = 3
    judge_score: int = 2
    attendance_score: int = 2
    default_appreciation_score: int = 10
    default_side_score: int = 25


class AffiliateConfigModel(AffiliateConfigBase):
    affiliate_id: int
    year: int


class AffiliateConfigCreate(AffiliateConfigBase):
    affiliate_id: int
    year: int


class AffiliateConfigUpdate(CustomBaseModel):
    masters_age_cutoff: int | None = None
    open_age_cutoff: int | None = None
    participation_score: int | None = None
    top3_score: int | None = None
    judge_score: int | None = None
    attendance_score: int | None = None
    default_appreciation_score: int | None = None
    default_side_score: int | None = None
