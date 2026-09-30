## Why

Reviewing the graders' experience on the demo deployment currently requires a real Google account, because the sign-in screen offers only Google OAuth 2.0; the two seeded accounts (`anna.smirnova@company.com`, `alexander.petrov@company.com`) remain in the database as gift recipients but cannot be entered. A reviewer should be able to inspect both the employee and the administrator surfaces without registering anywhere. At the same time the project must keep a single switch that restores the strict Google-only sign-in used by the hardened deployment, so the demo convenience is not a permanent hole.

## What Changes

- **A demo email sign-in is restored above the Google control** on `/login`. The reviewer types one of the two documented test addresses and is signed in with the role stored for that record (`employee` for `anna.smirnova@company.com`, `admin` for `alexander.petrov@company.com`), without any Google account.
- **The two test addresses are shown under the email field and labelled as test data**, so the reviewer does not have to guess them.
- **Only the two allow-listed addresses are accepted.** Any other address is refused with the same generic error already used for unknown employees; no directory-wide email entry returns.
- **The demo sign-in is gated by a documented environment switch** (`DEMO_LOGIN`), enabled in the demo deployment. When the switch is off, the email field and the hint are not rendered and the server refuses the demo provider, leaving the previous Google-only behaviour intact.
- **Google sign-in is not removed or hidden by the switch**: with the demo enabled both controls are offered, email above Google.
- **The demo session is issued as the existing signed, `HttpOnly` session**; the old unsigned client cookie (`corp-gift-auth-email`) is not restored, and the role comes from the stored record rather than from the request.
- **The admission boundary documentation and the reference tables are updated**: the seeded accounts are documented as enterable in demo mode, and `DEMO_LOGIN` is described among the deployment variables. **BREAKING** (auth): the current requirement that identity may only be established through Google is relaxed to permit the explicit, documented demo sign-in.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `auth`: the sign-in requirement gains a documented, switchable demo sign-in for the two documented test addresses, above the Google control; the rule that a manually entered address is never proof of identity is narrowed to "except the documented test addresses in demo mode", and the demo session still takes its role from the stored record.
- `deployment`: a new documented environment switch (`DEMO_LOGIN`) controls whether the demo sign-in is offered, so the strict Google-only configuration remains available through configuration alone.

## Impact

- Sign-in: `lib/auth-options.ts` (a second provider plus the allow-list gate in the `signIn` callback), `lib/auth-context.tsx` (`loginAsDemo`), `lib/demo-accounts.ts` (new shared allow-list and display list).
- Login screen: `app/(auth)/login/LoginForm.tsx`, `app/(auth)/login/page.tsx` (server reads `DEMO_LOGIN` and passes it to the form).
- Configuration and documentation: `.env.example`, `docker-compose.yml`, `README.md`, `dz_tables/02-autentifikaciya.md`, `dz_tables/03-matrica-dostupa.md`, `dz_tables/README.md`.
- Unchanged: registration (`/register`), the session cookie mechanism, and the Google provider path.
- Risks: the demo sign-in deliberately admits anyone who knows a test address with the role stored for it, including the administrator; this is bounded to the two addresses and can be disabled with one variable.
