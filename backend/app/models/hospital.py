import uuid
from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import HospitalStaffRole, HospitalStatus


class Hospital(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "hospitals"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    license_no: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    location = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)
    status: Mapped[HospitalStatus] = mapped_column(
        Enum(HospitalStatus, name="hospital_status"), default=HospitalStatus.pending, nullable=False
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    staff: Mapped[list["HospitalStaff"]] = relationship(back_populates="hospital", cascade="all, delete-orphan")


class HospitalStaff(UUIDPKMixin, Base):
    __tablename__ = "hospital_staff"

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[HospitalStaffRole] = mapped_column(
        Enum(HospitalStaffRole, name="hospital_staff_role"), default=HospitalStaffRole.staff, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")

    hospital: Mapped["Hospital"] = relationship(back_populates="staff")
    user: Mapped["User"] = relationship(back_populates="hospital_staff_memberships")
