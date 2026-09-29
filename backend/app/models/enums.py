import enum


class Role(str, enum.Enum):
    donor = "donor"
    hospital_staff = "hospital_staff"
    admin = "admin"


class UserStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"


class BloodGroup(str, enum.Enum):
    a_pos = "A+"
    a_neg = "A-"
    b_pos = "B+"
    b_neg = "B-"
    ab_pos = "AB+"
    ab_neg = "AB-"
    o_pos = "O+"
    o_neg = "O-"


class Component(str, enum.Enum):
    whole_blood = "whole_blood"
    platelets = "platelets"
    plasma = "plasma"
    double_red_cells = "double_red_cells"


class Urgency(str, enum.Enum):
    critical = "critical"
    urgent = "urgent"
    planned = "planned"


class VerificationLevel(int, enum.Enum):
    phone_verified = 1
    profile_complete = 2
    id_verified = 3
    hospital_confirmed = 4


class HospitalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    suspended = "suspended"


class HospitalStaffRole(str, enum.Enum):
    staff = "staff"
    admin = "admin"


class RequestStatus(str, enum.Enum):
    open = "open"
    fulfilled = "fulfilled"
    cancelled = "cancelled"
    expired = "expired"


class DispatchChannel(str, enum.Enum):
    push = "push"
    sms = "sms"
    whatsapp = "whatsapp"
    voice = "voice"


class PledgeStatus(str, enum.Enum):
    notified = "notified"
    accepted = "accepted"
    en_route = "en_route"
    arrived = "arrived"
    donated = "donated"
    no_show = "no_show"
    declined = "declined"
    expired = "expired"


class ReportStatus(str, enum.Enum):
    open = "open"
    reviewing = "reviewing"
    resolved = "resolved"
    dismissed = "dismissed"
