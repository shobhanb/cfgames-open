from uuid import UUID

from app.schemas import CustomBaseModel


class PreferredAthleteModel(CustomBaseModel):
    id: UUID
    crossfit_id: int
    name: str


class PreferredAthleteCreate(CustomBaseModel):
    crossfit_id: int
    name: str


class PreferredAthleteUpdate(CustomBaseModel):
    crossfit_id: int | None = None
    name: str | None = None


class PreferredAthletesInitResponse(CustomBaseModel):
    processed: int
    inserted: int
    updated: int
