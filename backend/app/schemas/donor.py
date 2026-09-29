import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import BloodGroup
from app.schemas.common import GeoPoint


class DonorProfileIn(BaseModel):
    blood_group: BloodGroup
    date_of_birth: date
    weight_kg: float
    available: bool = True


class DonorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    blood_group: BloodGroup
    date_of_birth: date
    weight_kg: float
    last_donation_at: datetime | None
    available: bool
    verification_level: int
    reliability_score: float


class DonorZoneIn(BaseModel):
    label: str
    point: GeoPoint
    radius_km: float = 5.0


class DonorZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    label: str
    radius_km: float
