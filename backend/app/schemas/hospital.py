import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import HospitalStatus
from app.schemas.common import GeoPoint


class HospitalOnboardIn(BaseModel):
    name: str
    license_no: str
    contact_name: str
    contact_phone: str
    contact_email: EmailStr
    point: GeoPoint


class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    license_no: str
    status: HospitalStatus
    verified_at: datetime | None
    created_at: datetime
