from app.schemas import CustomBaseModel


class AffiliateConfigBase(CustomBaseModel):
    participation_score: int = 1
    top3_score: int = 3
    judge_score: int = 2
    attendance_score: int = 2
    default_appreciation_score: int = 10
    default_side_score: int = 25
    use_scheduling: bool = True
    use_appreciation: bool = True


class AffiliateConfigModel(AffiliateConfigBase):
    affiliate_id: int
    year: int


class AffiliateConfigCreate(AffiliateConfigBase):
    affiliate_id: int
    year: int


class AffiliateConfigUpdate(CustomBaseModel):
    participation_score: int | None = None
    top3_score: int | None = None
    judge_score: int | None = None
    attendance_score: int | None = None
    default_appreciation_score: int | None = None
    default_side_score: int | None = None
    use_scheduling: bool | None = None
    use_appreciation: bool | None = None
