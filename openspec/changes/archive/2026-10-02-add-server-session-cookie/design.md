## Context

The motivation is in `proposal.md`; the requirements for observable behavior are in the deltas `specs/performance/spec.md` and `specs/auth/spec.md`.

Current state in the code:

- Providers live in the root layout: `app/layout.tsx:33-39` — `ThemeProvider` → `AuthProvider` → `DateProvider` → `DataProvider`. `AuthProvider` MUST remain above both route groups, because `useAuth()` is read by both the login page (`app/(auth)/login/page.tsx:14`) and the `(app)` shell.
- `ready` in `lib/auth-context.tsx:20-29` means exactly "`localStorage` has been read", not "data has been loaded". Two consumers read it: `components/layout/AuthGate.tsx:12` and `components/features/AdminTable.tsx:114`; two more tests mock it with the value `true` (`AdminTable.test.tsx:22`, `DonateDialog.test.tsx:35`).
- `checkCorpEmail` (`lib/corp-email.ts:12`) is a pure function without browser APIs; it depends only on `mockUsers` (`lib/mock-data.ts:14`), which is also server-safe (plain data plus `encodeURIComponent` in `avatarDataUri`). Verified by reading the files: nothing technically prevents moving the login logic to the server.
- All user routes live inside `(app)`: `/`, `/calendar`, `/faq`, `/admin`. There are practically no static routes that would be worth "saving" from dynamic rendering.
- The app's data is mocks without persistence (`lib/mock-data.ts`), there is no backend. Next.js 13.5.1, React 18, all pages are declared as `'use client'`.
- Past decisions to take into account: moving the theme to a cookie was rejected (`archive/2026-09-15-reduce-render-fanout-and-first-load`, decision 4), and the risk "protected content is briefly visible to an unauthorized user" was consciously accepted in `archive/2026-09-14-fix-review-round-6/design.md:69` with the caveat "real protection is out of scope".
- Project rule: performance conclusions are made only on `npm run build && npm run start`; dev mode is not used for measurements.

## Goals / Non-Goals

**Goals:**

1. The session is known to the server before the markup is sent, so the server HTML of the key page contains its content rather than a placeholder.
2. A single source of truth for the session; the notion of session "readiness" ceases to exist.
3. The decision about access to the protected section is made before the markup is sent.
4. Login behavior is preserved: a successful login, rejection by domain, and rejection by the directory work as before.

**Non-Goals:**

- Cookie signing, secrets, httpOnly, server actions, real authentication and authorization.
- Moving the theme to a cookie (it remains the rejected alternative from decision 4 of the previous change).
- Data persistence, backend, DB, RLS.
- Preserving the login between browser runs — on the contrary, the session ends when the browser is closed.
- Changing the appearance of pages, the rules for amounts, roles, and date preview.

## Decisions

### 1. The session cookie is the single source of truth

The name is `corp-gift-auth-email`, the value is the entered address; the attributes are `Path=/`, `SameSite=Lax`, without `Max-Age` and `Expires`, that is, a session cookie that disappears when the browser is closed. The key `corp-gift-auth-email` in `localStorage` is no longer read and is deleted on login and logout, so that no second, unread source of truth remains.

Why a cookie and not `localStorage`: the value comes to the server along with the request, so the markup can depend on the session without substituting content after hydration. This is the only way to satisfy the `performance` requirement without violating the `hydration` requirement.

Rejected alternative — **an inline script following the theme pattern** (`app/layout.tsx:19`, `lib/theme-context.tsx:23-28`). For the theme the technique works, because the value is cosmetic: the server markup and the first client render match, and the actual theme is reconciled by an effect without hiding anything. For the session this is not acceptable: the presence of the user name and the content of the protected section depend on it, so the first client render would diverge from the server render, React would discard the server subtree and switch it to client rendering — a direct violation of the `hydration` and `performance` requirements.

### 2. The root layout reads the cookie, the user arrives as a prop

`app/layout.tsx` is already a server component: `cookies()` from `next/headers` provides the value, `checkCorpEmail` turns it into a user, and the result is passed to `AuthProvider` as the initial state. The `ready` flag is removed from the context interface entirely, not merely left unused.

Alternatives:

- **Read the cookie in `(app)/layout.tsx` and keep the session provider at the group level.** Gives no gain: all meaningful routes are already inside `(app)`, this does not save static routes, but it splits the session state between groups and requires a second provider for the login page.
- **Middleware plus client state.** The session remains unknown to the server, that is, goal 1 is not achieved; middleware is useful only as a turnstile.
- **A separate `(auth)/layout.tsx` with its own check.** Redundant: the root layout sees the same cookie.

### 3. Route protection on the server, the client `AuthGate` is removed

`app/(app)/layout.tsx` (server) reads the cookie: no valid user — `redirect('/login')` from `next/navigation` before the markup is sent. The role check for the admin section is performed in the same place or in the server wrapper for `/admin`: a user with the `employee` role does not receive the admin table in the markup, but receives the "access denied" state. The client `AuthGate` becomes unnecessary and is removed along with the redirect effect.

This consciously closes the risk accepted in round 6: an unauthorized user can no longer see the protected markup, because it is simply not in the response.

The alternative is to **keep `AuthGate` and the client redirect**: simpler, but the requirement "the access decision before the markup is sent" is not met, and the original defect (content appears after hydration) remains at the section level.

### 4. The admin table renders without a client gate

`AdminTable.tsx:114` (`if (!ready) return ...`) is removed, the page title and description render always. A skeleton is not needed for the data either: `useDonations()` returns the starting values from the mock store synchronously, identically on the server and on the client, so there is nothing to wait for. The components remain `'use client'` — server-side rendering of client components in the App Router is standard, and their HTML ends up in the first response.

The "Access denied" branch inside the component ceases to be the only protection: it remains a visible state for the `employee` role, but the decision is made on the server (decision 3).

### 5. The login page

A logged-in user goes to the home page before the markup is sent: a cookie check instead of the effect at `app/(auth)/login/page.tsx:20-22`, which currently manages to show the form. The form remains client-side: `login()` still validates the address via `checkCorpEmail`, but instead of `localStorage` it writes a cookie via `document.cookie` — a server action is not needed, there is no backend in the project. `logout` deletes the cookie (`Max-Age=0`) and clears the state.

### 6. Dynamic rendering is an accepted cost

`cookies()` in the root layout turns all routes into dynamic rendering: static HTML delivery is lost, and the markup is assembled on every request. This is accepted consciously: the meaningful pages are already inside `(app)`, there is nothing to save, and there are no external data sources in the demo whose cache would justify clinging to static rendering. The increase in time to first byte is checked by measurement to make sure the budgets in `specs/performance/spec.md` are not violated.

### 7. Tests and mocks

The `ready` field is removed from the `useAuth` mocks in `AdminTable.test.tsx:22` and `DonateDialog.test.tsx:35`. Checks are added: a valid cookie gives a user on the server; the absence of a cookie gives a redirect to login; the `employee` role does not receive the admin markup; the cookie has no `Max-Age`; on login and logout the old `localStorage` key does not remain.

## Risks / Trade-offs

- [The cookie is not signed: the value can be forged manually] → accepted as a demo-level trade-off and recorded as a known limitation; real authentication and protection are out of scope, as was recorded in round 6.
- [All routes become dynamic, time to first byte grows] → measurement on `npm run build && npm run start` before and after; if the budgets are exceeded, the step is rolled back by reverting the commit.
- [A one-time logout for everyone who is already logged in] → an expected consequence of changing the storage, noted as expected behavior rather than a defect.
- [The login is not preserved after closing the browser] → a direct user requirement, captured by a scenario in the `auth` delta.
- [Two sources of truth if the old `localStorage` key remains] → the key is no longer read and is deleted on login and logout; the state is initialized only with the value from the server.
- [The server check depends on the mock directory] → `mockUsers` is available on the server (verified), and the replacement point when a backend appears is the single call to `checkCorpEmail`.
- [Hydration mismatch if the cookie changes between the request and the render] → the state is initialized with the value that came from the server and is not re-read by an effect; the theme remains the only value reconciled after hydration, and it is cosmetic.
- [The role check on the server may diverge from the client state if the role changes in the mock] → the directory is static, divergence is impossible without editing the code; if dynamic roles appear, the decision is revisited.

## Migration Plan

1. Commit 1: reading the cookie in the root layout, the provider's initial value, removal of `ready`, removal of the skeleton in `AdminTable`. Checks: `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build && npm run start` and LCP measurement on `/admin` and the home page.
2. Commit 2: server protection of `(app)`, removal of `AuthGate`, the server redirect on the login page, the role check for `/admin`. Repeat the checks and measurements.
3. Rollback — revert the corresponding commit. There are no data migrations and no persistence; the deployment does not change in composition.

## Open Questions

None.
