import jwt
import pytest

from app.core.security import create_token, decode_token, generate_otp_code, hash_otp_code


def test_generate_otp_code_default_length():
    code = generate_otp_code()
    assert len(code) == 6
    assert code.isdigit()


def test_generate_otp_code_custom_length():
    code = generate_otp_code(length=4)
    assert len(code) == 4
    assert code.isdigit()


def test_generate_otp_code_is_random():
    codes = {generate_otp_code() for _ in range(20)}
    assert len(codes) > 1


def test_hash_otp_code_deterministic():
    assert hash_otp_code("123456", "+911234567890") == hash_otp_code("123456", "+911234567890")


def test_hash_otp_code_scoped_to_phone():
    assert hash_otp_code("123456", "+911111111111") != hash_otp_code("123456", "+912222222222")


def test_hash_otp_code_scoped_to_code():
    assert hash_otp_code("111111", "+911234567890") != hash_otp_code("222222", "+911234567890")


def test_create_and_decode_access_token_round_trip():
    token = create_token("user-123", "access")
    payload = decode_token(token)

    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_create_token_includes_extra_claims():
    token = create_token("user-123", "access", {"role": "admin"})
    payload = decode_token(token)

    assert payload["role"] == "admin"


def test_refresh_token_has_longer_expiry_than_access_token():
    access_payload = decode_token(create_token("user-123", "access"))
    refresh_payload = decode_token(create_token("user-123", "refresh"))

    assert refresh_payload["exp"] > access_payload["exp"]


def test_decode_token_rejects_tampered_signature():
    token = create_token("user-123", "access")
    tampered = token[:-1] + ("A" if token[-1] != "A" else "B")

    with pytest.raises(jwt.PyJWTError):
        decode_token(tampered)


def test_decode_token_rejects_expired_token(monkeypatch):
    import app.core.security as security_module

    monkeypatch.setattr(security_module.settings, "access_token_expire_minutes", -1)
    token = create_token("user-123", "access")

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(token)
