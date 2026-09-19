## Why

In the LCP measurements of the key page `/admin`, the largest element turns out to be the secondary caption "Managing collection amounts", because all the page content waits for client-side hydration and reading of `localStorage`: `components/features/AdminTable.tsx:114` returns an empty skeleton until `ready`, and `ready` is set only by an effect in `lib/auth-context.tsx:22-29`. This directly contradicts the existing `performance` requirement "Server content on first render": the server markup of the route consists of two empty `div`s. The only cause of the barrier is the session being unknown to the server, so the session is moved to a cookie: the server learns the user before the HTML is sent, and the page content stops depending on hydration.

## What Changes

- **The login session moves from `localStorage` to a cookie.** The cookie is a session cookie: without `Max-Age`/`Expires`, so closing the browser drops the login; `Path=/`, `SameSite=Lax`. **BREAKING** (behavior): everyone who is already logged in is logged out once, and the login is no longer preserved between browser runs.
- **The root server layout reads the cookie** and validates the address with the existing `checkCorpEmail` rule; the found user is passed to `AuthProvider` as the initial state value, so the session is known already on the server.
- **The `ready` flag and the page-level skeleton are removed.** The title and description of the admin page render always, and the role is checked on the server rather than after hydration.
- **The `(app)` group route is protected on the server:** without a valid cookie the server responds with a redirect to `/login` before sending the HTML, so the protected markup is no longer shown to an unauthorized user.
- **The login page sends a logged-in user to the home page via a server redirect** instead of the client effect that currently manages to show the form.
- **The cookie is not signed**, so its value can be forged manually; this is a conscious demo-level trade-off — real authentication and protection remain out of scope, as was recorded earlier.
- The theme remains in `localStorage`: moving the theme to a cookie is still out of scope (the rejected alternative of decision 4 in `archive/2026-09-15-reduce-render-fanout-and-first-load`).

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `performance`: the requirement "Server content on first render" is strengthened — the server markup of the key page contains meaningful content, and session restoration cannot leave the page without content due to waiting for hydration.
- `auth`: the requirements "Login by corporate email" and "Role-based access control" are refined — the session is stored in a session cookie and access to the admin section is checked before the markup is sent.

## Impact

- Session and shell: `lib/auth-context.tsx` (source of truth, `ready`, writing and deleting the cookie), `app/layout.tsx` (reading the cookie, the provider's initial value), `components/layout/AuthGate.tsx` (the client redirect becomes unnecessary), `app/(app)/layout.tsx` (server protection of the group), `app/(auth)/login/page.tsx` (writing the cookie and redirecting a logged-in user).
- Pages: `app/(app)/admin/page.tsx`, `components/features/AdminTable.tsx` (removal of the `ready` gate, the role check).
- Tests: `components/features/AdminTable.test.tsx:22` and `components/features/DonateDialog.test.tsx:35` mock `ready: true`; checks for cookie reading and the server redirect are needed.
- Performance: all user routes live inside `(app)`, so reading the cookie makes all meaningful pages dynamic — static HTML delivery is lost, time to first byte grows slightly, but the first render contains content.
- Storage: the key `corp-gift-auth-email` in `localStorage` is no longer read; the theme, date, and data remain in the current mechanisms.
