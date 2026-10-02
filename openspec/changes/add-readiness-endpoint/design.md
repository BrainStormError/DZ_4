## Context

See `proposal.md` for motivation. The application reads and writes PostgreSQL only through the pool in `lib/db.ts` (`query`, `withTransaction`); the pool has `max: 5`. Existing Route Handlers live under `app/api/` and are wrapped with `withFailureLogging`, which records an unexpected failure and answers `500` — the wrong shape for a readiness refusal, which is a defined `503`. `middleware.ts` applies a per-request CSP nonce to every path except `_next/static`, `_next/image`, and `favicon.ico`, so a new API path will receive a CSP header; this is harmless for a probe.

## Goals / Non-Goals

**Goals:**
- Let an external service observe, without authentication, whether the running application can serve requests right now.
- Keep the probe cheap and bounded so a slow database cannot make the probe hang.

**Non-Goals:**
- No liveness endpoint, metrics endpoint, or status payload beyond ready/not-ready.
- No `healthcheck` wiring for the `app` service in `docker-compose.yml` and no changes to the reverse proxy or monitoring configuration.
- No changes to sign-in, the data model, existing routes, or dependencies.

## Decisions

### Decision: Readiness means a live database check

The endpoint runs `SELECT 1` through the existing pool and reports success only if it resolves. The only runtime dependency is PostgreSQL, so a check that does not touch the database would not describe readiness. Alternative considered: a liveness-only `200` with no database access; rejected because a running process with an unreachable database cannot serve requests, which is exactly the state an external observer needs to detect.

### Decision: Public endpoint at `GET /api/health`, no session

The route does not call `resolveCurrentUser` and answers identically with or without a session. An external service is not a signed-in user, so requiring a session would make the probe unusable. The path follows the existing `app/api/` namespace. Alternative considered: `/health` outside `/api`; rejected to keep route handlers in one namespace.

### Decision: Force dynamic evaluation

The Route Handler sets `export const dynamic = 'force-dynamic'`. Without it, an App Router `GET` handler that is not otherwise dynamic is statically optimized at build time, so the database check would run once during the build instead of per request — the answer would never reflect the live state. Alternative considered: reading `request.headers` to opt into dynamic implicitly; rejected as less explicit and easy to remove later.

### Decision: Explicit 503 response, not `withFailureLogging`

The handler catches a failed check and returns `errorResponse('-', 503)`-style JSON (`{"status":"unavailable"}`) with no error text. `withFailureLogging` is not used because it returns `500` and records an `error`; a readiness refusal is an expected, defined outcome. A failed check emits one `warn` entry through `logEvent('readiness_checked', 'refused')` so the refusal is observable without leaking internals.

### Decision: Bounded check via a short timeout

The database check is wrapped with a short timeout (about two seconds) so an unresponsive database yields `503` quickly rather than holding the request. Alternative considered: setting `statement_timeout` on the pool connection; rejected because it changes connection-wide behavior for all queries rather than just the probe.

### Decision: Connectivity helper in `lib/db.ts`

A small `pingDatabase()` helper (a single `SELECT 1` through `query`) sits beside the pool so the route does not reimplement connection access and stays easy to mock in tests.

## Risks / Trade-offs

- [An unauthenticated probe is a new public surface] → The response carries only ready/not-ready and no connection details; the endpoint performs one indexed-free trivial query.
- [Static optimization could silently freeze the answer] → `force-dynamic` plus a test that asserts the route re-evaluates rather than serving a build-time result.
- [A polling monitor could consume the 5-connection pool] → The probe issues one short query per request and releases it immediately; polling intervals keep concurrency low.
- [The probe hangs while the database hangs] → The short timeout bounds the request to a prompt `503`.

## Migration Plan

The change is additive and safe to deploy: a new route file, a helper, and a test. No environment variables, schema changes, or data migrations. Rollback is removing the route/helper; existing behavior is unaffected either way.

## Open Questions

None.
