## Why

An external service (uptime monitor, reverse proxy, orchestrator) has no way to ask the running application whether it is ready to serve. Today only the `db` container has a healthcheck, so a running app container can still be unable to answer requests because PostgreSQL is unreachable, and nothing outside the host can detect it.

## What Changes

- Add a public `GET /api/health` readiness endpoint that checks the application's ability to reach PostgreSQL and answers `200` when ready and `503` when not.
- The endpoint requires no sign-in and always reflects the current database state rather than a response captured at build time.
- Add automated test coverage for the endpoint's ready and not-ready responses.

## Capabilities

### New Capabilities
<!-- None: this change modifies an existing capability. -->

### Modified Capabilities
- `deployment`: add a requirement that the application exposes an unauthenticated readiness endpoint whose answer reflects live database availability.

## Impact

- New Route Handler and a small database connectivity helper; no changes to existing API routes, pages, database schema, or dependencies.
- Deployment topology is unchanged: this change adds observability, not behavior changes to sign-in, data, or presentation.
