## Why

The application is no longer used inside a private network: it is published on the public internet through a stable HTTPS address, and its sign-in is reachable by any browser. That invalidates the assumption the sign-in design rests on ("the corporate network is the perimeter"). A review of the running deployment found defects that follow from the invalidated assumption and from the deployment itself: the application port is published on every interface, the session and registration cookies take their transport attributes from a configuration string rather than from the address actually served, the employee directory hands out an internal identity identifier, employees receive collection amounts and journal internals that the specifications say they must not see, a malformed request produces an internal error instead of a defined response, an extreme amount can overflow the stored total, and the deployed configuration silently drifted from the repository, which already caused a failed deployment. These must be closed before the work is reviewed.

**Prerequisite**: this change assumes `add-google-signin-and-registration` is archived first, so its `auth` and `deployment` deltas are the base these deltas extend.

## What Changes

- **The application is reachable only through the TLS endpoint.** The published port is bound to the loopback interface; no plain-HTTP origin of the application remains reachable from outside. **BREAKING** (operations): a direct `http://host:3000` request stops working.
- **A stable public HTTPS address with documented provider configuration.** The address does not change between restarts, TLS terminates in front of the application, and the procedure names the exact redirect address plus the consent configuration that lets an unknown tester sign in.
- **The admission boundary becomes explicit and documented**, stated in terms of what the deployment actually provides rather than a network perimeter it does not. The behaviour itself is unchanged: any verified Google account may sign in and register.
- **Cookies carry the transport attributes of the served scheme.** Whenever the application is served over HTTPS, the session and registration cookies are `Secure` and use the `__Secure-` prefix, decided from the scheme in use rather than from the configured string.
- **The session has a bounded, documented lifetime** instead of an accidental library default, and the documentation matches the configured value.
- **Identity is bound to the provider subject**: a stored subject that disagrees with the account that signed in refuses the sign-in, and a record without a subject is bound on its first sign-in.
- **The registration ticket gains its own signing secret, is bound to the sign-in that produced it, and is single-use**; concurrent submissions no longer end in an internal error. **BREAKING** (auth): existing registration tickets are invalid.
- **Directory responses are trimmed to the fields the interface displays**, dropping the provider subject identifier.
- **Employee responses stop carrying collection amounts and journal internals** (administrator identity, amounts, comments). The employee interface keeps only the minimum it needs, so the existing rule "collected amounts are hidden from employees" holds for the data layer, not only for the rendering. **BREAKING** (API): the employee payload of `GET /api/donations` changes shape.
- **The participation amount is bounded** with a documented maximum; an out-of-range value is refused with a validation error and cannot overflow the stored total.
- **A malformed conversation identifier produces a defined client-error response** instead of an unhandled internal error.
- **Security response headers** are sent: HSTS, `nosniff`, referrer policy, and a Content-Security-Policy that prevents framing while still allowing the application's inline theme bootstrap.
- **State-changing requests are origin-checked**, as defence in depth alongside the existing `SameSite` cookie policy.
- **Recipient eligibility is enforced by the server**, not only offered by the interface: a participation that names the caller, a recipient whose birthday has already occurred in the current year, or a recipient who declined the gift is refused, so a declined recipient's collection cannot be raised above zero.
- **Security-relevant events are recorded** as structured entries — an accepted or refused sign-in, a completed registration, a refused authorization on a protected endpoint, and an administrator's amount change — with no signing secret, session value, registration ticket, or credential, and without letting a request value produce an additional entry.
- **The production build enforces the linter** instead of ignoring its findings during builds.
- **The deployed configuration is verified against the repository**, and a placeholder secret is refused instead of used.
- **The reference tables and README are updated** to the resulting behaviour, including the conflict between the amounts rule and the current reference table.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `auth`: cookie transport attributes and session lifetime, provider-subject binding, registration-ticket integrity and single use, explicit documented admission boundary, trimmed directory responses, origin check on mutating requests, recorded security events.
- `deployment`: application exposure limited to the TLS endpoint, stable HTTPS address and provider configuration, security response headers, deployed configuration parity with the repository, placeholder secrets refused, the production build enforcing the linter.
- `donations`: the amounts rule extended to the data layer, journal internals withheld from employees, bounded participation amount, recipient eligibility enforced on the server.
- `support-chat`: malformed thread identifiers answered with a defined error response.
- `testing`: tests for the security behaviours introduced here, including the refusal of an ineligible recipient and the recorded security events.

## Impact

- Sign-in and session: `lib/auth-options.ts`, `lib/session.ts`, `lib/registration-ticket.ts`, `app/api/auth/register/route.ts`, `.env.example`.
- Data endpoints: `app/api/users/route.ts`, `app/api/donations/route.ts`, `app/api/chats/[userEmail]/messages/route.ts`, `app/api/chats/[userEmail]/read/route.ts`, `lib/repository.ts` (response projections), `lib/api.ts` (shared origin check, amount bound, and recipient eligibility).
- Logging: a new shared logging module and its call sites — the auth callbacks, the registration route, every protected route's authorization refusal, and the administrative amount-change route.
- Client: `lib/data-store.ts`, `lib/types.ts`, `components/features/DonateDialog.tsx` (the reduced employee payload).
- Delivery: `docker-compose.yml`, `next.config.js` (the linter no longer suppressed during builds), a new `middleware.ts` for the Content-Security-Policy nonce; host-side TLS terminator and DNS; provider console settings (documented, not code).
- Documentation: `README.md`, `dz_tables/01-reestr-api.md`, `dz_tables/02-autentifikaciya.md`, `dz_tables/03-matrica-dostupa.md`, `dz_tables/04-proverka-prav.md`, `dz_tables/05-formaty-otvetov.md`.
- Risks: the employee payload change and the one-time invalidation of existing sessions and tickets.
