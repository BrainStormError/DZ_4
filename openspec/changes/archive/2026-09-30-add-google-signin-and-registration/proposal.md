## Why

The application will be deployed inside a corporate network and reachable only from it, but people enter with their ordinary Google accounts, not with a `@company.com` address typed into a form. Today's login rejects any address that does not end in `@company.com` and is absent from the directory (`lib/corp-email.ts:12-17`, `app/api/auth/login/route.ts:14-26`), so the intended users cannot sign in at all. On top of that the session cookie is written by client-side JavaScript (`lib/auth-cookie.ts:3-6`) and is neither signed nor `HttpOnly`, which means anyone inside the network can type a colleague's or the administrator's address into the browser console and be treated as that user. A real sign-in provider removes the guesswork about who the person is only if the session that follows cannot be forged.

Two smaller defects are fixed in the same change, as they touch the same surfaces: the login page fires four protected requests that answer `401` (`FOLLOW-UPS.md` item 3), and the amount-change dialog renders a lost employee name while it closes (item 4).

## What Changes

- **Sign-in moves to Google OAuth 2.0 as the only entry point.** A "Sign in with Google" control replaces the corporate email form; the Google account's email is the identity key.
- **Any Google account is accepted.** The corporate-network boundary is the perimeter; the corporate-domain rule and the directory-as-allowlist check are removed. Demo accounts seeded as `@company.com` stay in the database as gift recipients and birthday people but can no longer sign in.
- **An unknown, verified Google email starts a registration.** The person first fills a form — full name (prefilled from the Google profile, editable), birth date, and department — and only then is a user record created with the `employee` role. Until the form is submitted the person is not authorized and no user row exists.
- **The administrator role is assigned manually in the database.** Registration never produces an `admin`.
- **The session becomes a server-issued, signed, `HttpOnly` cookie.** The session cookie written by `document.cookie` is removed, together with the option of forging a session by editing it. **BREAKING** (behavior): everyone currently "logged in" through the old unsigned cookie is logged out once.
- **The corporate-email confirmation step is removed from the participation dialog** (`components/features/DonateDialog.tsx:102-121, 212-253`): the sender is the authorized user, so re-typing an address proves nothing and blocks nothing. **BREAKING** (behavior): the participation scenario no longer has an email step and no longer rejects non-corporate addresses.
- **The dead corporate-email code is deleted**: `lib/corp-email.ts`, `POST /api/auth/login`, and `POST /api/auth/verify-email`.
- **The new Google identifier is stored** for each user record, so a Google email change does not create a duplicate profile. This requires a schema change, which is applied manually on an existing data volume.
- **New environment variables are documented**: the Google client id and secret, the session secret, and the public application URL.
- **Protected data is not requested before a session exists** (`FOLLOW-UPS.md` item 3), removing four `401` responses from the browser console on `/login`.
- **The amount-change dialog closes cleanly** (`FOLLOW-UPS.md` item 4): the success path already clears the edit target, but the dialog description keeps rendering from it while the dialog animates out, producing "— current amount: 0 ₽" and a missing name.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `auth`: sign-in via Google OAuth 2.0 replaces "Login via corporate email"; the corporate-domain rule and "Single rule for validating a corporate address" are removed; a requirement for self-registration with a mandatory profile is added; the session requirement is strengthened to a signed, `HttpOnly`, server-issued cookie.
- `donations`: "Confirmation of corporate email before participation" and "Sender identity matches the account" are replaced by the authorized account being the sender; the email step, its error scenarios, and the copy tied to that step are removed.
- `testing`: the two DonateDialog tests bound to the corporate email ("positive scenario starts with the email step", "non-corporate email is blocked") are replaced by tests for Google sign-in and for registration of an unknown account.
- `deployment`: "Environment-based configuration" is extended with the Google credentials and session secret, and the example environment file MUST list them; the manual schema-change procedure covers the new user column.
- `performance`: a requirement is added that protected data is not requested before a session exists; the login page MUST NOT issue requests that answer `401`.
- `admin-panel`: the amount-change requirement gains a scenario that the dialog must not display missing employee data while it closes.

## Impact

- Sign-in and session: `lib/auth-context.tsx`, `lib/auth-cookie.ts`, `lib/session.ts`, `app/layout.tsx`, `app/(auth)/login/LoginForm.tsx`, `app/(auth)/login/page.tsx`; a new NextAuth route handler under `app/api/auth/`.
- Removed: `lib/corp-email.ts`, `app/api/auth/login/route.ts`, `app/api/auth/verify-email/route.ts`.
- Registration: a new server route pair (start/completion) and a new client form; a short-lived signed registration ticket between the Google callback and the submitted form.
- Data: `users` gains the Google subject column; `lib/types.ts`, `lib/repository.ts` (a create-user call), `db/init/001_schema.sql`. On an existing volume the column is added manually, following the documented procedure.
- Participation: `components/features/DonateDialog.tsx` (the email step and its copy), `components/features/DonateDialog.test.tsx`.
- Follow-ups: `app/layout.tsx` and the two data providers (no fetch without a session), `components/features/AdminTable.tsx` (dialog closing), and one digit in `openspec/changes/archive/2026-09-27-add-postgres-persistence-and-docker/tasks.md` (item 2).
- Dependencies: `next-auth` and its Google provider are added to `package.json`.
- Docs: `README.md`, `.env.example`, `dz_tables/01-reestr-api.md`, `dz_tables/02-autentifikaciya.md`, `dz_tables/04-proverka-prav.md`, `dz_tables/05-formaty-otvetov.md`, and the `auth`-related FAQ copy.
- Out of scope: assigning administrators through the UI, per-employee contribution records, rate limiting, and any change to the rules about who may see collection amounts.
