## Context

Motivation is in `proposal.md`; observable requirements are in the deltas `specs/auth/spec.md`, `specs/donations/spec.md`, `specs/testing/spec.md`, `specs/deployment/spec.md`, `specs/performance/spec.md`, and `specs/admin-panel/spec.md`.

Current state and constraints that shape the approach:

- Next.js 13.5.1 (App Router), React 18, TypeScript, no ORM. Data access is a hand-written repository over `pg` (`lib/repository.ts`, `lib/db.ts`); the client never touches the database.
- The session is a client-written cookie holding a bare address (`lib/auth-cookie.ts:3-6`), read on the server by `resolveCurrentUser()` (`lib/session.ts:6-18`), which looks the address up in the `users` table. The cookie is not signed and not `HttpOnly`; this was an accepted demo trade-off (`archive/2026-09-27-...`, `dz_tables/04-proverka-prav.md`, limitation 1).
- Sign-in is a form plus `checkCorpEmail` (`lib/corp-email.ts:12-17`) and a directory lookup (`app/api/auth/login/route.ts:14-26`). `POST /api/auth/verify-email` duplicates the handler and has no caller.
- `DirectoryProvider` and `DataProvider` are mounted in the root layout (`app/layout.tsx:40-41`) and fetch immediately, which produces four `401` responses on `/login` (`FOLLOW-UPS.md` item 3). `AuthProvider` must stay above both route groups because both read `useAuth()`.
- The `users` table is both the identity table and the domain directory: `full_name`, `birth_date`, `department`, `avatar_url` are `NOT NULL` (`db/init/001_schema.sql:14-23`), and `wishes`, `donations`, `donation_history`, and `chat_messages` reference it by id. `birth_date` feeds the calendar and the recipient list.
- `db/init/*.sql` is applied only on an empty data volume; on an existing volume schema changes are applied manually (documented in `README.md` and covered by the `deployment` requirement "Database initialization and persistence").
- Deployment: a single small host, image built elsewhere and shipped; the stack currently needs no outbound network access. A real provider introduces egress to Google and a callback address that users actually reach.
- Tests: Vitest + Testing Library via `renderWithProviders` (`lib/test-utils.tsx`); `DonateDialog.test.tsx:107,133,137` and the `testing` spec are bound to the corporate-email step.
- Project rule carried over from the previous change: performance conclusions are made only on `npm run build && npm run start`.

## Goals / Non-Goals

**Goals:**

1. One sign-in path that proves who the person is, using the real Google provider, with no password and no manually typed address.
2. A session the client cannot read or forge, while the stored record stays the source of truth for existence and role.
3. A new person becomes a user only after a complete profile, so the directory never contains half-created rows.
4. The corporate-email concept disappears completely: code, dialog step, copy, and specs.
5. The two `FOLLOW-UPS.md` defects are fixed without expanding scope elsewhere.

**Non-Goals:**

- Managing users or roles in the UI; administrators remain assigned by hand.
- Any new role, permission, or change to the amount-visibility rules.
- Rate limiting, audit of sign-ins, password recovery, or multi-provider sign-in.
- Keeping the seeded `@company.com` demo rows able to sign in — they stay as data only.
- Moving the theme to a cookie, or any other change to the existing theme and date mechanisms.

## Decisions

### 1. Google sign-in is implemented with NextAuth v4, not hand-rolled

The provider exchange, the one-time state parameter, the callback handling, the CSRF protection of the sign-in route, and the signed session cookie are all security-critical and all provided by NextAuth v4 (`next-auth@^4`), which supports the App Router through a route handler. Next 13.5 rules out Auth.js v5, which targets newer Next versions. The JWT session strategy is used, so no adapter and no session table are introduced and Postgres keeps only the domain tables.

Rejected alternatives:

- **Hand-rolled OAuth with `google-auth-library`** (two routes plus a self-signed cookie): a smaller dependency surface and full control, but the project would own token validation, state handling, and cookie signing. For a real integration this is the wrong place to save a dependency.
- **Supabase Auth**: `@supabase/supabase-js` is already in `package.json` but unused; adopting it would move identity into an external service and contradict the standalone container stack the `deployment` capability describes.
- **Keeping the corporate-email form as a fallback**: it would keep two identities and two session models alive in one application.

### 2. The session is a signed, `HttpOnly` session cookie; the table remains the source of truth

The cookie is issued by the server on sign-in, signed with `NEXTAUTH_SECRET`, marked `HttpOnly` and `SameSite=Lax`, and remains a session cookie (no `Max-Age`), preserving the behavior established earlier: closing the browser ends the login. The token carries only the user id; role and existence are read from the stored record on every server render.

This is why the `auth` requirement "Directory resolved from the persistent store" survives unchanged in spirit: deleting a row still ends the session, because `resolveCurrentUser()` loads the row instead of trusting the token's claims. The alternative — putting the role into the token only — would keep serving an administrator whose record was demoted or deleted until the cookie expired.

### 3. The provider callback feeds three decisions

- **No confirmed email** (for example, an account without a verified address): the sign-in is refused. This is an edge case, not the primary gate.
- **Confirmed email present in the store**: the token records the user id and the person enters the application with the stored role.
- **Confirmed email absent from the store**: the token is marked unregistered and no pages are served.

The address is the identity key. No domain is inspected, because the corporate network is the perimeter and the requirement explicitly allows any Google account.

### 4. A new user is created only after the registration form is submitted

When the callback finds an unknown address, it sets a short-lived, signed registration ticket (a separate cookie with a small TTL) that carries the confirmed address and the profile facts Google already provided. The application renders the registration form; a server route validates the submitted full name, birth date, and department and only then inserts the row with the `employee` role. The form shows the confirmed address as read-only, so the person cannot register someone else's address, and the ticket expires if the form is abandoned.

Rejected alternative — **create the row immediately and gate the pages on "profile incomplete"**: it would require making `full_name`, `birth_date`, and `department` nullable, leaving rows that break the calendar, the recipient list, and every query that assumes a complete employee. Keeping the row absent until the form is complete preserves the existing data model and makes "no access without a profile" literally true.

### 5. The user record gains a Google subject column

`users` gains a nullable `google_sub` column, unique when present. The email remains the unique identity key; the subject is stored so that a change on the Google side does not silently produce a second profile for the same person. The column is nullable so the seeded demo rows and any hand-created row stay valid, and the existing schema files are extended for fresh volumes while the change notes the manual statement needed on an existing volume.

Alternative: key the profile on the email alone and accept duplicates after a rename. Rejected: a rename is invisible to the user and would split their wishes, chats, and messages.

### 6. Registration cannot produce an administrator

The insert path always writes the `employee` role; there is no parameter to request another role. Administrators are promoted by a manual statement against the store. An environment variable holding administrator addresses was rejected: it would reintroduce a second, code-side list of admitted people that this change exists to remove, and it would drift from the store.

### 7. The corporate-email path is deleted, not disabled

`lib/corp-email.ts`, `POST /api/auth/login`, and `POST /api/auth/verify-email` are removed. `DonateDialog` loses the `email` step, its address field, its inline error, and the comparison against the authorized user; the sender is taken from the session, and the stored author is the session user, which the `donations` delta now requires directly. Removing the code keeps the specs from describing a rule no application path applies.

### 8. The login page has one control

`/login` renders a single "Sign in with Google" control. The server layout continues to redirect an already-signed-in user to the home page before sending markup, so no flash of the sign-in screen is introduced. The demo-account hint and the corporate-domain copy are removed; the seeded demo accounts can no longer sign in and are not advertised.

### 9. Follow-up 3: the data providers move into the protected group

`DirectoryProvider` and `DataProvider` are used only by routes inside `app/(app)/`. They are mounted in `app/(app)/layout.tsx` instead of the root layout, so `/login` never mounts them and never issues a request. `AuthProvider` stays in the root, because both groups read `useAuth()`; `DateProvider` stays where it is, because it performs no request.

Rejected alternative — **keep the providers in the root and gate their initial fetch on the session**: it works, but it leaves a conditional "should I load?" rule in two providers and still ships the providers to the sign-in route, which is exactly what the requirement says must not happen.

### 10. Follow-up 4: the dialog keeps its target until the closing transition ends

The success path currently clears the edit target (`AdminTable.tsx:105-108`) while the description renders from the same state (`AdminTable.tsx:433`), so the closing dialog shows an empty name and the fallback amount. The dialog's open state and the edited-employee snapshot are separated: the snapshot is cleared when the dialog has finished closing, and the description renders only when a snapshot exists. The alternative — guarding the description with a conditional and keeping the current clearing — removes the wrong text but leaves the name visibly vanishing before the dialog disappears.

### 11. Configuration and documentation

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are added to `.env.example`, `docker-compose.yml`, and `README.md`. `NEXTAUTH_URL` must be the address users actually reach; over plain HTTP inside the network the session cookie cannot be marked `Secure`, and if TLS is terminated in front of the application that flag is enabled together with it.

### 12. Tests

The two corporate-email tests are replaced: `DonateDialog` keeps a positive scenario that starts at the recipient step and adds a check that no address field exists; new tests cover the registration gate (incomplete profile creates nothing, complete profile creates an `employee`) and the rejection of a forged or legacy session cookie. `renderWithProviders` gains the session shape the components now read, and the existing positive `AdminTable` coverage is extended with the closing-transition case.

## Risks / Trade-offs

- [The host needs outbound access to Google and a reachable callback address, which the current stack does not need] → recorded as a deployment requirement; the network team must provide egress and a stable address (`NEXTAUTH_URL`). If that is unavailable, sign-in cannot work and the change is not deployable — this is an infrastructure prerequisite, not a code defect.
- [Everyone is logged out once and the demo accounts stop working] → expected consequence of replacing the session and the login rule; the demo rows remain as data, and the hint advertising them is removed.
- [A signed token cannot be revoked instantly] → the session resolver reads the stored record on every server render, so deleting or demoting a user still ends or narrows access; only the inert cookie survives until it is cleared.
- [next-auth adds a route that answers unauthenticated API calls in its own format] → the application's own routes keep using `resolveCurrentUser()` and keep the documented `401` contract, so API behavior is unchanged; only the NextAuth route speaks its own format.
- [The registration ticket could be lost between the callback and the form] → the ticket is signed and short-lived, and the person can restart sign-in, which costs one click and creates nothing.
- [A new column on an existing volume is not applied automatically] → the column is nullable, the existing rows remain valid, and the manual statement is recorded together with the documented procedure.
- [Any Google account inside the network may register] → accepted by the requirement; the containment is the network, not the address domain. Registration still always yields `employee`, so a new account cannot see collection amounts.
- [The seeded demo users have no `google_sub`] → the column is nullable and the email remains the identity key, so seeded rows behave exactly as before and simply cannot be signed in to.

## Migration Plan

1. **Commit 1 — session and sign-in.** Add `next-auth`, the route handler, the provider configuration, the `resolveCurrentUser()` rework, the sign-in screen, and sign-out. Checks: `npm run lint`, `npm run typecheck`, `npm test`; then `npm run build && npm run start` with a real Google client and a manual check that a seeded row signs in with its stored role and a delete of the row ends the session.
2. **Commit 2 — registration.** Add the `google_sub` column to the schema file, the registration ticket, the form, and the create-user route. Checks: on a fresh volume the schema applies; on an existing volume the manual statement is executed and the demo rows still read; an unknown address creates nothing until the form is complete.
3. **Commit 3 — clean-up and follow-ups.** Remove the corporate-email code, rework the participation dialog, move the data providers into `(app)`, fix the dialog closing, update tests, `.env.example`, `docker-compose.yml`, `README.md`, and the reference tables in `dz_tables/`, and correct the digit in `FOLLOW-UPS.md` item 2 inside the archived tasks file. Checks: the full suite, the console on `/login` is free of `401` responses, and the amount-change dialog closes without partial text.
4. **Rollback** is a revert of the corresponding commit. Commit 1 is the only one that changes how a session is established; reverting it restores the old sign-in. Commit 2's column is additive and nullable, so it can stay in place after a revert.

## Open Questions

- Whether the target network terminates TLS in front of the application, which decides the `Secure` flag and the exact `NEXTAUTH_URL`. This affects configuration only, not the approach or the task breakdown, and is answered at deployment time.
