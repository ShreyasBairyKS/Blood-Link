import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.db.session import get_db
from app.models.audit import AuditLog
from app.models.enums import HospitalStatus, Role
from app.models.hospital import Hospital
from app.models.user import User
from app.schemas.hospital import HospitalOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/hospitals", response_model=list[HospitalOut])
async def list_hospitals(
    status_filter: HospitalStatus | None = None,
    _: User = Depends(require_role(Role.admin)),
    db: AsyncSession = Depends(get_db),
) -> list[Hospital]:
    query = select(Hospital)
    if status_filter is not None:
        query = query.where(Hospital.status == status_filter)
    result = await db.execute(query.order_by(Hospital.created_at.desc()))
    return list(result.scalars().all())


async def _set_hospital_status(
    hospital_id: uuid.UUID,
    new_status: HospitalStatus,
    admin: User,
    db: AsyncSession,
) -> Hospital:
    hospital = await db.get(Hospital, hospital_id)
    if hospital is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")

    hospital.status = new_status
    if new_status == HospitalStatus.approved:
        hospital.verified_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            actor_id=admin.id,
            action=f"hospital.{new_status.value}",
            entity_type="hospital",
            entity_id=hospital.id,
        )
    )
    await db.commit()
    await db.refresh(hospital)
    return hospital


@router.post("/hospitals/{hospital_id}/approve", response_model=HospitalOut)
async def approve_hospital(
    hospital_id: uuid.UUID,
    admin: User = Depends(require_role(Role.admin)),
    db: AsyncSession = Depends(get_db),
) -> Hospital:
    return await _set_hospital_status(hospital_id, HospitalStatus.approved, admin, db)


@router.post("/hospitals/{hospital_id}/reject", response_model=HospitalOut)
async def reject_hospital(
    hospital_id: uuid.UUID,
    admin: User = Depends(require_role(Role.admin)),
    db: AsyncSession = Depends(get_db),
) -> Hospital:
    return await _set_hospital_status(hospital_id, HospitalStatus.rejected, admin, db)
