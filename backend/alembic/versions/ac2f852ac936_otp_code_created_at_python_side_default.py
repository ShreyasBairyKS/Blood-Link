"""otp code created_at python side default

Revision ID: ac2f852ac936
Revises: 833c0b444bb7
Create Date: 2026-09-29 17:31:43.661893

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = 'ac2f852ac936'
down_revision: Union[str, None] = '833c0b444bb7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # created_at is now populated by the ORM (datetime.now(timezone.utc) at insert time)
    # instead of Postgres's now(), which returns transaction-start time and could collide
    # across rows inserted in nearby transactions.
    op.alter_column("otp_codes", "created_at", server_default=None)


def downgrade() -> None:
    op.alter_column("otp_codes", "created_at", server_default=sa.text("now()"))
