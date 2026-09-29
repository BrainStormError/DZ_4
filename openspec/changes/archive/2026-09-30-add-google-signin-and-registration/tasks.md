## 1. Configuration and prerequisites

- [x] 1.1 Add `next-auth@^4` and its Google provider to `package.json` and install; verify `npm install` succeeds, `npm run typecheck` passes, and the installed major version supports Next 13.5 (v5 is rejected)
- [x] 1.2 Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` to `.env.example` and to `docker-compose.yml` without real secrets; verify the example file lists all four variables and the compose file passes them to the `app` service
- [x] 1.3 Document the two operational prerequisites in `README.md`: outbound HTTPS access to the Google endpoints and a callback address that users actually reach (`NEXTAUTH_URL`), plus the `Secure`-cookie note when TLS is terminated in front of the application; verify the README section exists and names both

## 2. Session and sign-in

- [x] 2.1 Add the NextAuth route handler with the Google provider and the JWT session strategy, the session cookie being `HttpOnly`, `SameSite=Lax`, and a session cookie without `Max-Age`; verify on `npm run build && npm run start` with a real client that signing in sets a cookie which `document.cookie` cannot see
- [x] 2.2 Refuse sign-in when Google returns no confirmed email address; verify the attempt ends without a session and without an unhandled error
- [x] 2.3 Rework `resolveCurrentUser()` (`lib/session.ts`) to read the session and load the stored user row by id, keeping the stored record authoritative for existence and role; verify a seeded row signs in with its stored role, and deleting that row ends the session on the next request
- [x] 2.4 Treat a confirmed address that is absent from the store as unregistered, so no page and no API serves it; verify a protected route redirects to `/login` and `/api/users` answers `401`
- [x] 2.5 Replace the sign-in screen (`app/(auth)/login/LoginForm.tsx`) with a single "Sign in with Google" control and remove the demo-account hint and the corporate-domain copy; verify the page contains no address field and the browser console shows no authentication error on load
- [x] 2.6 Keep the server redirect for an already signed-in user on `/login`; verify a session holder is redirected to `/` before markup is sent
- [x] 2.7 Add server-side sign-out that clears the session; verify the cookie is gone after signing out and `/admin` redirects to `/login`
- [x] 2.8 Remove the old client-written cookie mechanism (`lib/auth-cookie.ts`, `document.cookie` writes) and the legacy `localStorage` cleanup references; verify no remaining write path for the session cookie and that the old cookie value does not authenticate

## 3. Registration of a new employee

- [x] 3.1 Add a nullable, unique-when-present `google_sub` column to `db/init/001_schema.sql`, expose it in `lib/types.ts`, and map it in `lib/repository.ts`; verify a fresh volume applies the schema, and record the manual `ALTER TABLE` statement for an existing volume in `README.md`
- [x] 3.2 Add a repository call that inserts a user with the confirmed email and the `employee` role only, with no parameter that can request another role; verify the insert stores `employee` and that no caller passes a role
- [x] 3.3 Issue a signed, short-lived registration ticket from the provider callback when the address is unknown, carrying the confirmed address and the profile facts from the provider; verify the ticket is signed, expires, and is rejected when modified
- [x] 3.4 Build the registration form with the full name prefilled from the provider and editable, and with the birth date and the department required; verify an empty full name, birth date, or department blocks submission, and that the address field is read-only
- [x] 3.5 Add the server route that validates the submitted profile and creates the user, then establishes the session; verify that an unknown address creates no record until the form is complete, that a complete form creates an `employee`, and that access is granted only afterwards
- [x] 3.6 Verify that no path can register an administrator; verify the admin capability appears only for a record whose stored role is `admin` after a manual statement, and that removing the role removes the capability

## 4. Removal of the corporate-email path

- [x] 4.1 Delete `lib/corp-email.ts`, `app/api/auth/login/route.ts`, and `app/api/auth/verify-email/route.ts` and remove every import of them; verify `npm run lint` and `npm run typecheck` pass and a repository-wide search finds no `checkCorpEmail` or `CORP_EMAIL_DOMAIN`
- [x] 4.2 Remove the email step from `DonateDialog` (`components/features/DonateDialog.tsx:102-121,212-253`): the step, the address field, the inline error, and the comparison against the authorized user; verify the dialog proceeds recipient → amount → message → confirmation and contains no address input
- [x] 4.3 Update the participation copy and the recipient label per the `donations` delta: no promise of congratulating without funds, the "Leave a wish" pointer stays, and the recipient list shows name, department, and email; verify the rendered dialog matches those texts

## 5. Follow-ups from `FOLLOW-UPS.md`

- [x] 5.1 Move `DirectoryProvider` and `DataProvider` from `app/layout.tsx:40-41` into `app/(app)/layout.tsx`, keeping `AuthProvider` in the root and `DateProvider` unchanged; verify `/login` issues no request to `/api/users`, `/api/wishes`, `/api/donations`, or `/api/chats`, and the console shows no `401`
- [x] 5.2 Fix the amount-change dialog in `components/features/AdminTable.tsx`: separate the open state from the edited-employee snapshot and clear the snapshot only after the closing transition, rendering the description only when a snapshot exists; verify after a successful save the dialog closes and never shows a missing name or a substituted amount while closing
- [x] 5.3 Correct the message count in `openspec/changes/archive/2026-09-27-add-postgres-persistence-and-docker/tasks.md` for task 1.2 (`12/6/12/2/4` → `12/6/12/2/3`); verify the file states `3` and matches `db/init/002_seed.sql`

## 6. Tests and documentation

- [x] 6.1 Update `lib/test-utils.tsx` and the session mocks used by `components/features/AdminTable.test.tsx` and `components/features/DonateDialog.test.tsx` to the new session shape; verify `npm test` runs with no provider or type errors
- [x] 6.2 Replace the two corporate-email tests with the `DonateDialog` requirements from the `testing` delta: the positive scenario without an address step, and a check that no address field exists; verify no test references a corporate address or the removed step
- [x] 6.3 Add tests for the registration gate: an incomplete profile creates no record and grants no access, and a complete profile creates an `employee` with the confirmed address; verify both tests pass
- [x] 6.4 Add tests for session integrity: a modified or unsigned session value is rejected, and the old client-written cookie does not authenticate; verify both tests pass
- [x] 6.5 Update `README.md`, `.env.example`, and the reference tables `dz_tables/01-reestr-api.md`, `02-autentifikaciya.md`, `04-proverka-prav.md`, `05-formaty-otvetov.md` to the new sign-in route, the session attributes, and the removed routes; verify no document still describes sign-in by corporate email or lists the deleted endpoints

## 7. End-to-end verification

- [x] 7.1 Run `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build && npm run start`; verify all pass and the key pages render server-side with content
- [ ] 7.2 Manually run the full flow on the built application: a known account signs in with its stored role; an unknown account registers and becomes an `employee`; an unconfirmed email is refused; an `employee` still cannot see collection amounts while an `admin` still can
