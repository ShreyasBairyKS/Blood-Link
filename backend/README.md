# Blood Link — Backend

FastAPI + Postgres/PostGIS backend. Phase 1 scope: auth (phone OTP), core data model, hospital onboarding + admin approval, donor profile/zones.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

docker compose up -d           # Postgres+PostGIS on 5432, Redis on 6379
copy .env.example .env

alembic revision --autogenerate -m "init schema"
alembic upgrade head

uvicorn app.main:app --reload
```

API docs at http://localhost:8000/docs once running.

## Trying the core flow

1. **Request an OTP** (dev provider logs the code to the console instead of sending SMS):
   ```
   POST /api/v1/auth/otp/request  {"phone": "+911234567890"}
   ```
   Check the `uvicorn` console output for the 6-digit code.

2. **Verify it** to get tokens:
   ```
   POST /api/v1/auth/otp/verify  {"phone": "+911234567890", "code": "123456"}
   ```
   Use the returned `access_token` as a `Bearer` token on subsequent requests.

3. **Donor profile**:
   ```
   PUT /api/v1/donors/me
   {"blood_group": "O+", "date_of_birth": "1995-01-01", "weight_kg": 68, "available": true}
   ```

4. **Hospital onboarding** (public, no auth):
   ```
   POST /api/v1/hospitals/onboard
   {"name": "City Blood Bank", "license_no": "KA-123", "contact_name": "...",
    "contact_phone": "+91...", "contact_email": "a@b.com",
    "point": {"latitude": 12.97, "longitude": 77.59}}
   ```

5. **Approve it as admin** — seed an admin user first (the OTP flow always creates `donor` role users):
   ```bash
   python scripts/create_admin.py +911111111111
   ```
   Then OTP-login as that phone number and call:
   ```
   POST /api/v1/admin/hospitals/{hospital_id}/approve
   ```

## Notes

- OTP delivery is behind `app/services/otp.py::OTPProvider` — swap `ConsoleOTPProvider` for an MSG91/Twilio-backed one (DLT-registered templates) before launch.
- `blood_requests`, `dispatches`, `pledges`, `donations`, `reports` tables exist in the schema but have no endpoints yet — that's the Phase 2 matching-engine work.
- Redis is provisioned in `docker-compose.yml` for the upcoming wave-dispatch scheduler; nothing reads/writes it yet.

## Tests

```bash
pytest
```
`tests/test_health.py` doesn't need a DB. Endpoint tests against a real Postgres will be added alongside the matching engine.
