import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import create_token, decode_token, generate_otp_code, hash_otp_code
from app.db.session import get_db
from app.models.enums import UserStatus
from app.models.user import OTPCode, User
from app.schemas.auth import AccessToken, OTPRequestIn, OTPVerifyIn, RefreshIn, TokenPair
from app.services.otp import get_otp_provider

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/otp/request", status_code=status.HTTP_204_NO_CONTENT)
async def request_otp(payload: OTPRequestIn, db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(phone=payload.phone)
        db.add(user)
        await db.flush()

    # Invalidate any still-active OTPs for this phone so at most one is ever valid at a time —
    # otherwise "most recent" is ambiguous when two rows land in the same DB timestamp tick.
    await db.execute(
        update(OTPCode)
        .where(OTPCode.phone == payload.phone, OTPCode.consumed_at.is_(None))
        .values(consumed_at=datetime.now(timezone.utc))
    )

    code = generate_otp_code()
    otp = OTPCode(
        phone=payload.phone,
        code_hash=hash_otp_code(code, payload.phone),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes),
    )
    db.add(otp)
    await db.commit()

    provider = get_otp_provider(settings.otp_provider)
    await provider.send(payload.phone, code)


@router.post("/otp/verify", response_model=TokenPair)
async def verify_otp(payload: OTPVerifyIn, db: AsyncSession = Depends(get_db)) -> TokenPair:
    result = await db.execute(
        select(OTPCode)
        .where(OTPCode.phone == payload.phone, OTPCode.consumed_at.is_(None))
        .order_by(OTPCode.created_at.desc())
        .limit(1)
    )
    otp = result.scalar_one_or_none()

    if otp is None or otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired or not found")

    if otp.code_hash != hash_otp_code(payload.code, payload.phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code")

    otp.consumed_at = datetime.now(timezone.utc)

    result = await db.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.status == UserStatus.pending:
        user.status = UserStatus.active

    await db.commit()

    return TokenPair(
        access_token=create_token(str(user.id), "access", {"role": user.role.value}),
        refresh_token=create_token(str(user.id), "refresh"),
    )


@router.post("/refresh", response_model=AccessToken)
async def refresh_token(payload: RefreshIn, db: AsyncSession = Depends(get_db)) -> AccessToken:
    try:
        claims = decode_token(payload.refresh_token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if claims.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user = await db.get(User, uuid.UUID(claims["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return AccessToken(access_token=create_token(str(user.id), "access", {"role": user.role.value}))
