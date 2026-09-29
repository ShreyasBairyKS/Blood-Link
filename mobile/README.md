# Blood Link — Donor App

Expo (SDK 57) + TypeScript + Expo Router. Donor-facing mobile app: phone-OTP sign in, donor profile, donor zones. Talks to the FastAPI backend in `../backend`.

Routes live in `src/app/` (Expo Router's `src/app` convention). Non-route code (API client, auth context, components) lives under `src/` outside `app/`.

## Setup

```bash
npm install
cp .env.example .env    # EXPO_PUBLIC_API_URL, defaults to http://localhost:8000
npx expo start
```

Press `w` for web, or scan the QR code with Expo Go for a device. The backend (`../backend`) needs to be running with a live Postgres for the OTP/profile flows to actually work — see `../backend/README.md`.

## What's here

- `(auth)/` — phone entry → OTP verify, stores tokens via `expo-secure-store` (native) / `localStorage` (web dev only, see `src/auth/secureStorage.ts`).
- `(app)/` — tab navigator behind the auth guard (`src/app/_layout.tsx` uses `Stack.Protected`): Home (placeholder — no backend endpoint yet) and Profile (donor profile form + zones, calling `/api/v1/donors/me` and `/api/v1/donors/me/zones`).
- `src/api/` — typed fetch client (`client.ts` handles the Bearer header and refresh-on-401), mirroring the backend's Pydantic schemas in `types.ts`.

## Known gaps (by design, matches backend scope)

- No push notification registration — the backend's `devices` table has no route yet.
- Zones list is session-only — the backend has `POST /donors/me/zones` but no `GET`, so previously-added zones aren't fetched back on reload.
- Date of birth is a plain `YYYY-MM-DD` text field — no native date picker dependency yet.

## Checks

```bash
npx tsc --noEmit
npx expo-doctor
```
