## 1. Allow-list and switch

- [x] 1.1 Add `lib/demo-accounts.ts` exporting the two documented test addresses (`anna.smirnova@company.com` as employee, `alexander.petrov@company.com` as administrator) with a display label each, plus an `isDemoAccount(email)` check and the display list; verify a unit test accepts both documented addresses, is case/whitespace-insensitive, and refuses any other address
- [x] 1.2 Add a server-side helper that reports whether the demo sign-in is enabled, reading `DEMO_LOGIN` and treating the value `1` as enabled; verify a unit test covers `1`, unset, and another value

## 2. Server sign-in path

- [x] 2.1 Add a `demo` Credentials provider to `lib/auth-options.ts` that accepts an email and returns the stored record as the user; verify an accepted address produces a `user` with the stored email
- [x] 2.2 Add a separate `demo` branch to the `signIn` callback: refuse when the setting is off, refuse when the address is not on the allow-list, otherwise accept; leave the Google branch unchanged; verify a test covers enabled+allow-listed (accepted), enabled+other (refused), and disabled+allow-listed (refused), and that a Google sign-in still passes its confirmation and subject checks
- [x] 2.3 Confirm the existing `jwt` callback resolves the demo user to the stored `userId` and the session carries that id; verify with defined `DEMO_LOGIN=1`: `resolveCurrentUser()` after a demo sign-in returns the stored record and its role for both test addresses

## 3. Sign-in screen

- [x] 3.1 Extend `lib/auth-context.tsx` with `loginAsDemo(email)` calling `signIn('demo', { callbackUrl: '/' })`; verify the existing `login()` (Google) is unchanged and typecheck passes
- [x] 3.2 Update `app/(auth)/login/LoginForm.tsx` to render, when the demo sign-in is enabled, an email field and a submit control above the Google control, a hidden-by-default test-data hint listing both documented addresses and labelled as test data, and a defined error for a refused address; verify with the demo enabled the field is above Google and the hint names both addresses
- [x] 3.3 Update `app/(auth)/login/page.tsx` to read the setting on the server and pass it to `LoginForm`; verify with the setting off the rendered page contains no email field and no test-data hint, and only the Google control, and that the disabled state is decided before markup is sent

## 4. Configuration and documentation

- [x] 4.1 Document `DEMO_LOGIN` in `.env.example` with its meaning and default; verify the variable is described as the switch for the demo sign-in
- [x] 4.2 Pass `DEMO_LOGIN` to the application in `docker-compose.yml` and enable it in the demo stack; verify `docker compose config` shows the variable on the application service
- [x] 4.3 Update `README.md` and `dz_tables/02-autentifikaciya.md`, `dz_tables/03-matrica-dostupa.md`, `dz_tables/README.md` so the two test addresses are documented as enterable in demo mode and `DEMO_LOGIN` is listed among the variables; verify the statements about "cannot sign in" no longer contradict the shipped behavior

## 5. Verification

- [ ] 5.1 With the demo sign-in enabled, sign in as the employee and as the administrator test address; verify the employee sees the employee surface and no administrative data, and the administrator reaches the administrative section
- [ ] 5.2 With the demo sign-in enabled, submit an address outside the documented set and a real stored employee address; verify both are refused with the defined error and no session is created
- [ ] 5.3 With the demo sign-in enabled, verify Google sign-in still starts and completes on the same screen
- [ ] 5.4 With the demo sign-in disabled, verify the screen offers only Google and a demo sign-in attempt is refused by the server
- [x] 5.5 Run `npm run lint`, `npm run typecheck`, and the test suite; verify all pass
