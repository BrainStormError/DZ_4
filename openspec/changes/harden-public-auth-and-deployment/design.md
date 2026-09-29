## Context

See `proposal.md` — Why. Constraints that shape the approach:

- Sign-in is NextAuth v4 with the JWT strategy on Next 13.5 (App Router); the session is a signed `HttpOnly` cookie and the stored record stays authoritative for existence and role (`lib/auth-options.ts`, `lib/session.ts`).
- The deployment is a single small host: the image is built elsewhere and shipped, then run by Compose together with PostgreSQL. Nothing terminates TLS today, and no component is exposed except the application port.
- The pending change `add-google-signin-and-registration` is not archived yet, so its `auth` and `deployment` deltas are not in the main specs. This change treats those deltas as its base and must be archived after it.
- The main `donations` spec and the FAQ requirement in `support-chat` both require that collected amounts are hidden from employees, while `dz_tables/03-matrica-dostupa.md` states that employees may read amounts and the journal, and the implementation returns both to every authenticated user. The conflict is real and must be resolved, not carried forward.
- The employee interface needs very little of that data: only `AdminTable` renders amounts and the full journal, and `AdminTable` is rendered for administrators only. `DonateDialog` uses the journal solely to learn which recipients declined the gift (`components/features/DonateDialog.tsx:66`).

## Goals / Non-Goals

**Goals:**

1. Make the deployed surface honest: one HTTPS endpoint, nothing else reachable.
2. Make cookie and session behaviour follow the scheme actually served, with a lifetime that is a decision rather than a library default.
3. Close the data-exposure gaps in the responses the application returns.
4. Turn the admission boundary from an unstated assumption into documented, bounded behaviour.
5. Leave a deployment procedure that cannot silently drift and cannot start with a placeholder secret.

**Non-Goals:**

- Restricting who may sign in (no domain, tenant, invitation, or proxy rule) — the tester is unknown and arrives through a bare link.
- Rate limiting, pagination, per-contributor records, instant session revocation.
- Adding an audit entry for the gift-sent flag: the journal model stores a previous and a new amount with a refund reason, so the flag does not fit it. This stays a stated limitation rather than a new requirement. The security-event log of decision 16 records the events it lists and does not add this row either.
- Changing the collection-visibility rule in the opposite direction (making amounts public to employees).

## Decisions

### 1. The admission boundary is documented, not enforced

The behaviour stays as it is: any provider-confirmed account may sign in and register, and registration always yields `employee`. What changes is that the boundary becomes an explicit, documented statement of what the deployment protects against, together with the measures a production deployment would need.

Rejected alternatives:
- **Corporate domain or tenant restriction** — the project has no verified corporate domain; the restriction would lock out the tester, who is unknown in advance.
- **Invitation list or invitation table** — nothing to invite from: the reviewer is not known when the stack is deployed.
- **Authenticating proxy in front of the application** — it would add a second, non-Google login to a piece of work whose subject is the Google sign-in, and the outer credential would have to be distributed in the submission anyway.
- **A shared registration code in the link** — the same secrecy-by-URL weakness the tunnel had, and the link must stay bare.

The specification text that justifies the boundary by a corporate network perimeter is replaced: the boundary is described by what is actually true (public address, demo data, documented limits).

### 2. TLS terminates on the host; the application port is bound to loopback

A reverse proxy on the host terminates TLS and forwards to `127.0.0.1:3000`; the Compose `ports` entry becomes `127.0.0.1:3000:3000`. The public name is a free dynamic-DNS name, so TLS is obtainable without buying a domain, and the address is stable across restarts.

Rejected alternatives:
- **The quick tunnel currently in use** — it issues a new address on every restart, and both the configured application address and the provider's registered redirect address must match it exactly; every restart would require re-registering the redirect and restarting the stack.
- **A named tunnel** — it needs a domain zone in a provider account, which is not free.
- **TLS inside the application** — the standalone Next server does not terminate TLS, and hand-rolling certificate renewal is a larger moving part than one proxy.
- **Keeping the published port as well** — it would leave a plain-HTTP origin reachable and defeat the point.

### 3. Cookie transport attributes follow the served scheme; `Secure` is not optional in production

`useSecureCookies` stops depending on the spelling of the configured address. The session and registration cookies are issued `Secure` with the `__Secure-` prefix whenever the application runs in production, and the configuration must therefore hold the HTTPS address.

Rationale for forcing it rather than reading `x-forwarded-proto`: the header is attacker-controlled in general, and the application has exactly one deployment mode worth protecting. Local development keeps working because current browsers treat `http://localhost` as a secure context and accept `Secure` cookies there.

### 4. The session lifetime is an explicit decision

The session lifetime is configured explicitly (12 hours) instead of inheriting the library default, and the documentation states that value. The previous claim that the cookie is a browser-session cookie was wrong: the library writes `Max-Age`, so the only honest options were to state the real lifetime or to fight the library with a custom cookie handler.

Rejected alternatives: leaving the 30-day default (never chosen, only inherited); a true browser-session cookie (requires a custom cookie writer, not worth the moving part); a very short lifetime (a graded demo may be opened hours after signing in).

### 5. The registration ticket gets its own secret and its own binding

Three defects are closed together because they live in the same flow:
- the ticket is signed with a secret distinct from the session secret, so one compromised purpose does not hand over the other;
- the ticket is accepted only together with an active unregistered session whose confirmed address equals the ticket's, so a stolen cookie alone is not enough to create a record;
- creation becomes atomic: the insert is attempted with a conflict-safe statement, and an already existing address is treated as already registered rather than as an internal error, so two simultaneous submissions cannot both create a row or produce a 500.

### 6. Identity binding: verify the subject when present, record it when absent

A record with a stored subject must match the account that signed in, otherwise the sign-in fails. A record without one is still resolved by address and gets the subject recorded on that sign-in. This closes the case where a reassigned or renamed provider address silently claims an existing row, while keeping the seeded rows usable.

### 7. Directory responses get a public projection

The repository keeps its internal mapping (the server needs the subject for the auth decisions above). The endpoints return a distinct projection that carries only display fields — name, address, department, birth date, avatar, role — and never the subject identifier.

### 8. Employee responses are shaped by role

`GET /api/donations` keeps one route and answers by role:
- an administrator receives the collected amounts and the full journal;
- an employee receives only the identifiers of recipients who declined the gift.

The client changes accordingly: the data store exposes `declinedUserIds` for `DonateDialog`, and the amounts and journal remain consumed by `AdminTable`, which is only rendered for administrators. This resolves the conflict in favour of the existing rule and keeps the reference table to be corrected rather than the specification.

Rejected alternatives: hiding the data only in the interface (the current state — the rule is a data rule, not a rendering rule); a separate endpoint per role (more surface for the same result); dropping the employee's access to the declined flag (it drives the recipient list).

### 9. The participation amount is bounded

A documented maximum is enforced together with the existing "positive integer" rule, in the shared validation helper, so an out-of-range value is refused with a validation error before it reaches the store and the stored integer cannot overflow.

### 10. Origin checking as a second layer

A shared helper refuses a state-changing request when it carries an `Origin` whose host is not the application's public host, or when the browser marks it as cross-site, while still allowing requests that carry no origin information. The `SameSite=Lax` cookie policy remains the first layer.

### 11. Security headers: static headers from the configuration, the policy with a per-request nonce

`next.config.js` gains the static headers (HSTS, `nosniff`, referrer policy). The Content-Security-Policy needs a per-request nonce because the application ships an inline theme bootstrap (`app/layout.tsx:32`) and Next injects its own inline scripts; the nonce is produced in a new `middleware.ts` and handed to the inline script.

Rejected alternative: a hash-based policy entirely inside `next.config.js` — the hashes of the framework's inline scripts are not stable across builds, so the policy would break on the next build.

### 12. Malformed identifiers are decoded defensively

Thread identifiers are decoded through a helper that returns a client-error response instead of propagating a decoding failure, preserving the documented error contract.

### 13. Documentation and reference tables follow the behaviour

`README.md` gains the admission boundary, the session lifetime, and the deployment procedure with the TLS endpoint, the loopback binding, the provider console settings, and the parity check between the deployed configuration and the repository. The `dz_tables` set is updated, including `03-matrica-dostupa.md`, whose amounts rule is corrected to match the specification, and `04-proverka-prav.md`, whose file and line references shift with the edits.

### 14. Recipient eligibility moves to the server

The participation route reuses the eligibility rule the interface already applies through `getCongratulatableUsers` (`lib/birthdays.ts:56`): the recipient's birthday is today or has not yet occurred in the current year, the recipient is not the caller, and the recipient has not declined the gift. A submission that fails any of these is refused with a validation response before the store is touched, so a declined recipient's collection cannot be raised above zero.

The rule is deliberately NOT applied to the wish a participation may create. A monetary congratulation may be sent in advance, and the wish it creates is hidden by the birthday display rule until the recipient's day (`wishes` spec, "Showing congratulations by birthday"); applying the wish-day rule here would break "send in advance". This is why the server rule mirrors the money-eligibility rule and not the wish-creation rule.

Rejected alternative: enforcing eligibility only in the interface (the current state). The data rule is a server rule; the interface filter is a convenience.

### 15. The build stops ignoring the linter

`next.config.js` sets `eslint.ignoreDuringBuilds: true`, so a lint failure cannot fail a release. The suppression is removed and the linter becomes part of the build. The verification pass already runs the linter separately; this decision makes the same check impossible to skip in a build. Rejected alternative: keeping the suppression and relying on a separate lint step, which a build pipeline can omit.

### 16. Security events are recorded through one small logger

A single helper emits one structured entry per event to standard output, where the container's log driver already collects it. Recorded events: an accepted sign-in, a refused sign-in, a completed registration, a refused authorization on a protected route, and an administrator's amount change. Every entry names the event, the outcome, and the acting account when one exists.

Two properties are part of the contract, not incidental: fields whose name marks a secret, a session, a ticket, or a credential are redacted, and a value taken from a request has line breaks and control characters neutralised before it is written, so the value cannot forge or reshape an entry.

Rejected alternatives: logging to a database table (a new schema object and a migration for a demo whose only consumer is a person reading container logs); logging only at sign-in (would leave authorization refusals and administrative changes invisible, which is the gap this closes).

The gift-sent flag remains outside this log by the Non-Goal above.

## Risks / Trade-offs

- [The Content-Security-Policy can break the theme bootstrap or the framework's own scripts] → wire the nonce into the inline script, then verify a page load and the browser console on the built application; keep the policy's script directive as narrow as the nonce allows.
- [Shaping the employee response changes an API payload] → the only consumer is the application's own client; update the store and the dialog in the same change and cover it with a test.
- [Existing sessions and registration tickets stop working once] → expected consequence of changing the secret usage, the lifetime, and the cookie prefix; affected people sign in again, and nothing is stored that depends on the old session.
- [A `Secure` cookie cannot be set over plain HTTP on a host other than localhost] → the deployed stack is HTTPS-only, and local development uses localhost, which browsers treat as a secure context.
- [The host now depends on a proxy and a dynamic-DNS name] → document the procedure and add the parity check; keep the previous tunnel command as a documented fallback for the day the proxy is unavailable.
- [Restricting the port can break the currently used tunnel] → the tunnel is retired in the same step, and the TLS endpoint replaces it.
- [A blanket bound could reject a legitimate large demo amount] → the maximum is documented and far above any realistic demo value.
- [The admission boundary remains open by design] → the boundary is stated where a reader will meet it, and the deployment carries demo data only; if real people are ever admitted, the boundary must be revisited before that happens.
- [Recipient eligibility is checked against the server's local calendar date while the interface uses the visitor's date] → a request near midnight can name a recipient the interface offered but the server refuses; the refusal changes nothing, and the amounts and journal rules are unaffected, so the trade-off is accepted.
- [A logging helper adds a new failure and noise surface] → keep it synchronous and non-throwing, one entry per event, redact by field name, and verify that a page load and a state-changing action still succeed with logging enabled.

## Migration Plan

1. **Commit 1 — sign-in and session.** Secrets and their validation, cookie attributes, session lifetime, module for the provider-subject binding, the registration-ticket secret and its binding, atomic creation, the origin helper. Checks: the suite, the type checker, the linter, and a build.
2. **Commit 2 — data exposure.** The public directory projection, the role-shaped donation response, the bounded amount, defensive identifier decoding, and the client changes that consume the reduced payload. Checks: the suite, and a manual pass through the participation flow as an employee and as an administrator.
3. **Commit 3 — delivery and documentation.** The loopback binding, the security headers and the nonce middleware, `README.md`, the `dz_tables` set, and the parity check. Checks: a build, a response-header inspection, and a page load with the policy applied.
4. **Host steps.** Install the proxy with the dynamic-DNS name, retire the tunnel, recreate the stack with the loopback binding, register the redirect address and set the consent configuration in the provider console, then verify sign-in end to end with an account that was not pre-registered.
5. **Rollback.** Revert the corresponding commit; the schema is unchanged, so no data migration is needed. If the proxy fails on the host, the documented tunnel command restores access while the proxy is repaired.

## Open Questions

- The exact session lifetime (12 hours is chosen) — a configuration value, changeable without touching any other decision.
- The exact maximum participation amount (1,000,000 is chosen) — also a configuration value.
- Whether the deployment will ever admit real people; if so, the documented boundary must be replaced by a real admission rule.
