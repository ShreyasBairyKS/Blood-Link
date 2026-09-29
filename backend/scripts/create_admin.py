"""One-off helper to seed an admin user for local development.

Usage:
    python scripts/create_admin.py +911234567890
"""

import asyncio
import sys

sys.path.append(".")

from sqlalchemy import select  # noqa: E402

from app.db.session import AsyncSessionLocal  # noqa: E402
from app.models.enums import Role, UserStatus  # noqa: E402
from app.models.user import User  # noqa: E402


async def main(phone: str) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.phone == phone))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(phone=phone, role=Role.admin, status=UserStatus.active)
            db.add(user)
        else:
            user.role = Role.admin
            user.status = UserStatus.active

        await db.commit()
        print(f"Admin user ready: {phone}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        raise SystemExit(1)

    asyncio.run(main(sys.argv[1]))
