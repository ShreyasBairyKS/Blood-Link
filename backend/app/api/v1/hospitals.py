from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.geo import to_geography
from app.db.session import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalOnboardIn, HospitalOut

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.post("/onboard", response_model=HospitalOut, status_code=status.HTTP_201_CREATED)
async def onboard_hospital(payload: HospitalOnboardIn, db: AsyncSession = Depends(get_db)) -> Hospital:
    hospital = Hospital(
        name=payload.name,
        license_no=payload.license_no,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        location=to_geography(payload.point.latitude, payload.point.longitude),
    )
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return hospital
