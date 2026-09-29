## 0. Prerequisite — close the pending sign-in change

- [x] 0.1 Archive `add-google-signin-and-registration` with the archive workflow and verify the main `openspec/specs/auth/spec.md` and `openspec/specs/deployment/spec.md` now contain its requirements and no longer describe login by corporate email
- [x] 0.2 Replace the sentence that justifies the admission boundary by a corporate network perimeter in the archived `auth` requirement with the documented boundary this change introduces, and verify no spec text claims a perimeter the deployment does not provide
- [x] 0.3 Confirm this change's deltas apply cleanly on that base and verify `openspec validate harden-public-auth-and-deployment` reports no error about a requirement missing from a base spec

## 1. Sign-in and session hardening

- [x] 1.1 Introduce a signing secret for the registration ticket, distinct from the session secret, and fail fast when it is absent; verify a unit test asserts that a ticket signed with another key is rejected and that a missing secret is reported rather than defaulted
- [x] 1.2 Add the new variable to the example environment file together with the existing ones, and verify the file lists every required variable with placeholder values only and that no real secret is present
- [x] 1.3 Refuse a signing secret left at the example placeholder value; verify by starting the application with that value and observing a clear misconfiguration report instead of a running sign-in
- [x] 1.4 Issue the session and registration cookies with `Secure` and the `__Secure-` prefix whenever the application runs in production, decided from the served scheme rather than the configured string; verify a test asserts the attributes and a manual response inspection on the built application shows them
- [x] 1.5 Configure an explicit session lifetime of 12 hours and state the same value in the documentation; verify the documented value and the configured value agree
- [x] 1.6 Bind identity to the provider subject: refuse a sign-in whose stored record carries a different subject, and record the subject on a record that has none; verify tests cover the mismatch refusal, the first-sign-in binding, and the changed-address case that must not create a second profile
- [x] 1.7 Require the registration ticket to be presented together with an unregistered session whose confirmed address equals the ticket's; verify a test shows that a ticket alone, without that session, creates no record
- [x] 1.8 Make record creation atomic and replay-safe: attempt the insert with a conflict-safe statement, treat an existing address as already registered, and consume the ticket on success; verify tests cover a replayed ticket and two concurrent submissions producing exactly one record and no internal error

## 2. Data exposure

- [x] 2.1 Add a public projection for employee responses that carries only the displayed fields and never the provider subject identifier, while the server keeps the internal mapping for the sign-in decisions; verify a test asserts the subject identifier is absent and the displayed fields are still present
- [x] 2.2 Shape `GET /api/donations` by role: an administrator receives the collected amounts and the full journal, an employee receives only the identifiers of recipients who declined the gift; verify tests assert that an employee payload contains no amount and no journal entry with an administrator identity, an amount, or a comment
- [x] 2.3 Update the client to the reduced employee payload: expose the declined recipients from the data store, consume them in the participation dialog, and leave the administrator table on the full data; verify the employee flow still marks a recipient who declined the gift and that the existing component tests pass
- [x] 2.4 Enforce a documented maximum on the participation amount alongside the positive-integer rule, in the shared validation helper; verify tests assert that an amount above the maximum is refused with a validation error, that the largest accepted amount is stored correctly, and that the stored total cannot overflow
- [x] 2.5 Decode conversation thread identifiers defensively in both conversation routes; verify tests assert that a malformed identifier yields a documented client-error response, stores nothing, and leaves the isolation rule intact
- [x] 2.6 Enforce recipient eligibility on the participation path: refuse a submission naming the caller, a recipient whose birthday has already occurred in the current year, or a recipient who declined the gift, and refuse without changing any stored total; verify tests assert each refusal, that a declined recipient's collection stays zero after the attempt, and that an eligible recipient (birthday today or upcoming this year) is still accepted

## 3. Delivery, headers and documentation

- [x] 3.1 Bind the published application port to the loopback interface in the Compose configuration; verify an external request to that port is refused while a request forwarded by the proxy is served
- [x] 3.2 Send the static security headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`) from the application configuration; verify a response inspection shows them
- [x] 3.3 Add a Content-Security-Policy with a per-request nonce that prevents framing, and pass the nonce to the inline theme bootstrap script; verify on the built application that the page renders, the console shows no policy violation, and an embedding page cannot frame it
- [x] 3.4 Document in `README.md` the admission boundary, the session lifetime, and the deployment procedure: TLS endpoint on the host, the loopback binding, the exact provider redirect address, the consent configuration that admits a person who was not pre-registered, and the configuration parity check; verify each element is present and matches the configured values
- [x] 3.5 Update the reference tables in `dz_tables/` so they no longer contradict the specifications on amount, journal, and recipient-eligibility visibility, and refresh the file and line references that the edits move; verify no table states that an employee may read collected amounts or journal internals, and that the participation rules match the enforced eligibility
- [x] 3.6 Remove the linter suppression from the build configuration so the production build fails on a lint error; verify `npm run lint` is clean on the current tree, `npm run build` still succeeds, and the configuration no longer ignores lint findings during builds

## 4. Security event logging

- [x] 4.1 Add a shared logging helper that emits one structured entry per event, redacts any field whose name marks a secret, session, ticket, or credential, and neutralises line breaks and control characters in values taken from a request; verify tests assert that an entry contains no secret and that a request value containing a line break cannot produce a second entry
- [x] 4.2 Record the security events — an accepted sign-in, a refused sign-in, a completed registration, a refused authorization on a protected route, and an administrator's amount change — naming the event, the outcome, and the acting account where one exists; verify each event produces an entry, and that a page load and a state-changing action still succeed with logging enabled

## 5. Host deployment

- [ ] 5.1 Install the TLS endpoint on the host with a free dynamic-DNS name and point it at the loopback application port; verify the HTTPS address serves the application with a valid certificate
- [ ] 5.2 Retire the quick tunnel currently used for sign-in; verify the previous address no longer serves the application and the tunnel is not in the start-up configuration
- [ ] 5.3 Recreate the stack with the loopback binding and the documented environment file; verify the application port is refused from outside and the application is reachable through the HTTPS address
- [ ] 5.4 Configure the provider console as documented — the exact redirect address and the consent configuration — and verify that an account which was never pre-registered in the console completes sign-in end to end
- [ ] 5.5 Place strong, distinct signing secrets in the host environment file and confirm it is not tracked by the repository; verify the running application reports no misconfiguration and the file is absent from the repository's tracked files

## 6. Verification

- [ ] 6.1 Pass the full flow on the built application: an employee sees no collected amount and no journal internals anywhere, an administrator sees both, participation still marks a declined recipient, a participation for an ineligible recipient is refused, an unknown account registers as an employee, and the container log shows the recorded security events; verify each observation
- [x] 6.2 Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build && npm run start`; verify all four succeed
- [ ] 6.3 Compare the deployed configuration with the repository version using the documented check; verify the check reports no difference, and that a deliberately stale copy is reported
