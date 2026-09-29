import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin
from app.models.enums import BloodGroup, Component, DispatchChannel, PledgeStatus, RequestStatus, Urgency


class BloodRequest(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "blood_requests"

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False
    )
    blood_group: Mapped[BloodGroup] = mapped_column(Enum(BloodGroup, name="blood_group"), nullable=False)
    component: Mapped[Component] = mapped_column(Enum(Component, name="component"), nullable=False)
    units: Mapped[int] = mapped_column(Integer, nullable=False)
    urgency: Mapped[Urgency] = mapped_column(Enum(Urgency, name="urgency"), nullable=False)
    needed_by: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status"), default=RequestStatus.open, nullable=False
    )

    dispatches: Mapped[list["Dispatch"]] = relationship(back_populates="request", cascade="all, delete-orphan")
    pledges: Mapped[list["Pledge"]] = relationship(back_populates="request", cascade="all, delete-orphan")


class Dispatch(UUIDPKMixin, Base):
    __tablename__ = "dispatches"

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False
    )
    donor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wave: Mapped[int] = mapped_column(Integer, nullable=False)
    channel: Mapped[DispatchChannel] = mapped_column(Enum(DispatchChannel, name="dispatch_channel"), nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    request: Mapped["BloodRequest"] = relationship(back_populates="dispatches")


class Pledge(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "pledges"
    __table_args__ = (UniqueConstraint("request_id", "donor_id", name="uq_pledges_request_donor"),)

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False
    )
    donor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[PledgeStatus] = mapped_column(
        Enum(PledgeStatus, name="pledge_status"), default=PledgeStatus.notified, nullable=False
    )
    eta: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    checkin_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    request: Mapped["BloodRequest"] = relationship(back_populates="pledges")
    donation: Mapped["Donation | None"] = relationship(back_populates="pledge", uselist=False)


class Donation(UUIDPKMixin, Base):
    __tablename__ = "donations"

    pledge_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pledges.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    confirmed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    units: Mapped[int] = mapped_column(Integer, nullable=False)
    donated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()")

    pledge: Mapped["Pledge"] = relationship(back_populates="donation")
