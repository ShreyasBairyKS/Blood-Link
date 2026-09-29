# Blood Link — Hospital Console

Next.js 16 (App Router) + TypeScript + Tailwind. Public hospital onboarding form, plus an OTP-gated admin queue for approving/rejecting hospitals. Talks to the FastAPI backend in `../backend`.

## Setup

```bash
npm install
cp .env.example .env    # NEXT_PUBLIC_API_URL, defaults to http://localhost:8000
npm run dev
```

Open http://localhost:3000. The backend (`../backend`) needs to be running with a live Postgres for onboarding/login to actually work — see `../backend/README.md`.

## What's here

- `/` — public hospital registration form → `POST /api/v1/hospitals/onboard`. "Use current location" reads the browser's Geolocation API for the facility's lat/lng.
- `/admin` — phone/OTP login (same backend flow as the mobile app) → `GET /api/v1/admin/hospitals`, tabbed by status, with Approve/Reject actions. A non-admin account gets a clear "no admin access" state instead of a raw 403.
- `src/api/` — typed fetch client mirroring `backend/app/schemas/hospital.py` and `auth.py`, with Bearer-header injection and refresh-on-401 (same pattern as `mobile/src/api/client.ts`).
- `src/auth/` — client-side only auth: `tokenStore.ts` (localStorage + pub/sub) and `AuthContext.tsx` (uses `useSyncExternalStore` so server/client hydration always matches, and the store's actual state is picked up right after).

## Known gaps (by design, matches backend scope)

- No request-raising, live board, or WebSocket — those endpoints don't exist on the backend yet (Phase 2/3).
- No hospital-staff self-serve login — the backend has a `hospital_staff` table but no invite/signup route, so there's no staff-facing dashboard yet, only the public onboarding form and the admin queue.

## Checks

```bash
npm run build   # type-checks + production build
npm run lint
```
