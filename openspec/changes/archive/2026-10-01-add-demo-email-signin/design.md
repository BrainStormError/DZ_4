## Context

See `proposal.md` — Why. The sign-in stack today is NextAuth with a single Google provider and a server-signed, `HttpOnly` JWT session (`lib/auth-options.ts`). The `jwt` callback already turns an email into the stored `userId` (`lib/auth-options.ts:116-129`), and `resolveCurrentUser()` reads the stored record on every request (`lib/session.ts:6-14`), so the stored role is authoritative. The `signIn` callback currently refuses everything that is not the Google provider (`lib/auth-options.ts:64-68`). The sign-in screen is a server component that redirects signed-in and unregistered sessions, then renders `LoginForm` (`app/(auth)/login/page.tsx`).

## Goals / Non-Goals

**Goals:**
- Let a reviewer enter the two documented test addresses without a Google account, above the Google control, and land on the employee or administrator surface according to the stored role.
- Keep a single documented switch that returns the deployment to strict Google-only.
- Reuse the existing signed session and the existing stored-role resolution; introduce no new session mechanism and no schema change.

**Non-Goals:**
- No password, no arbitrary directory email login, and no restoration of the old unsigned `corp-gift-auth-email` cookie.
- No change to the Google provider, the registration flow, or the role rules.
- No database schema change; the two records already exist in the seed.

## Decisions

**1. A second NextAuth provider of type Credentials, named `demo`.**
`signIn('demo', { email })` runs the same JWT session pipeline, so the session is produced by the same server code and the same cookie. Alternative considered: a custom route that signs a token with `next-auth/jwt` and sets the cookie. Rejected — it duplicates secret handling, cookie attributes, and session callbacks for no gain.

**2. A single allow-list module (`lib/demo-accounts.ts`) is the only source of the test addresses.**
It exports the two addresses with a human label and is consumed by both the server gate and the sign-in screen hint, so the shown addresses and the accepted addresses cannot drift. The role is never sent from the client: the client submits an address only, and the role is read from the stored record.

**3. The switch is a server-only environment setting (`DEMO_LOGIN`), not a `NEXT_PUBLIC_` value.**
It is enabled when the value is `1`, read in the server login page for rendering and in the `signIn` callback for enforcement. Alternative considered: a public build-time variable controlling only the UI. Rejected — hiding a control is not enforcement, and the server must refuse the demo provider when the setting is off. The switch does not touch the Google provider.

**4. The demo path is a separate branch in the `signIn` callback; the Google branch is untouched.**
For provider `demo`: refuse when the setting is off, refuse when the address is not in the allow-list, otherwise accept and let the existing `jwt` callback resolve the stored `userId`. Google keeps its confirmation and provider-subject checks via `resolveSignInUser`. The demo branch does not call `resolveSignInUser` and does not bind a provider subject, because there is none. Alternative considered: routing the demo address through `resolveSignInUser` — rejected, it would attempt to bind a Google subject to a demo sign-in.

**5. The sign-in screen renders the demo block above the Google control when enabled, and only the Google control when disabled.**
Server-rendered from the page prop, so no flash and no client-only hide. The test-data hint names both addresses and labels them as test data; selecting one fills the field. Errors reuse a defined message, distinct from the Google error labels.

## Risks / Trade-offs

- [Anyone who knows a test address gets that role, including the administrator] → accepted for this educational deployment; bounded to exactly two addresses, roles fixed in the seed, and removable with one variable (`DEMO_LOGIN` off).
- [Refactoring `signIn` could weaken the Google checks] → the Google branch is left as-is; the demo logic is an added branch, covered by tests for the on/off and allow-list cases.
- [The shown addresses and the accepted set drift apart] → both come from one module.
- [A stored employee's address is refused by the demo form because it is not on the list] → intended and specified; the Google path remains for real accounts.

## Migration Plan

No schema or data migration. Set `DEMO_LOGIN=1` in the application environment (`docker-compose.yml`) and document it in `.env.example`; on an existing deployment the change is configuration plus the new image. Rollback: set `DEMO_LOGIN=0` to return to Google-only, or revert the change; no stored data is affected.
