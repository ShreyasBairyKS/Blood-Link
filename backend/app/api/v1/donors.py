from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.core.geo import to_geography
from app.db.session import get_db
from app.models.donor import DonorProfile, DonorZone
from app.models.enums import Role
from app.models.user import User
from app.schemas.donor import DonorProfileIn, DonorProfileOut, DonorZoneIn, DonorZoneOut

router = APIRouter(prefix="/donors", tags=["donors"])


@router.get("/me", response_model=DonorProfileOut | None)
async def get_my_profile(
    user: User = Depends(require_role(Role.donor)),
    db: AsyncSession = Depends(get_db),
) -> DonorProfile | None:
    result = await db.execute(select(DonorProfile).where(DonorProfile.user_id == user.id))
    return result.scalar_one_or_none()


@router.put("/me", response_model=DonorProfileOut)
async def upsert_my_profile(
    payload: DonorProfileIn,
    user: User = Depends(require_role(Role.donor)),
    db: AsyncSession = Depends(get_db),
) -> DonorProfile:
    result = await db.execute(select(DonorProfile).where(DonorProfile.user_id == user.id))
    profile = result.scalar_one_or_none()

    if profile is None:
        profile = DonorProfile(user_id=user.id, **payload.model_dump())
        db.add(profile)
    else:
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/me/zones", response_model=DonorZoneOut, status_code=status.HTTP_201_CREATED)
async def add_zone(
    payload: DonorZoneIn,
    user: User = Depends(require_role(Role.donor)),
    db: AsyncSession = Depends(get_db),
) -> DonorZone:
    zone = DonorZone(
        user_id=user.id,
        label=payload.label,
        location=to_geography(payload.point.latitude, payload.point.longitude),
        radius_km=payload.radius_km,
    )
    db.add(zone)
    await db.commit()
    await db.refresh(zone)
    return zone
