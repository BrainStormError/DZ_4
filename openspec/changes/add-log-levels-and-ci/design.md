## Context

See `proposal.md` for motivation. The current state that shapes this design:

- `lib/log.ts` already exports `logEvent(event, outcome, fields)` and emits one JSON object per event via `console.log`, with redaction of secret-named fields and neutralisation of line breaks and control characters. It never throws. It has no level and routes everything to standard output.
- Eleven call sites already pass an `outcome` string (`accepted`, `refused`, `created`, `already_registered`, `success`). `lib/auth-options.test.ts` and `lib/log.test.ts` assert the current signature and `console.log` usage.
- Request routes do not wrap repository or database calls, so an unexpected failure reaches the framework's default error handling without an application entry.
- The suite is Vitest with jsdom; every test mocks the repository or the database, so `npm test` needs no database service (16 files / 68 tests, ~29 s locally). `package.json` already exposes `lint`, `typecheck`, `test`, and `build`.
- Deployment already assumes an image built off the host: `docker-compose.yml` references `image: corp-gifts-app:latest` with no `build:` section, `next.config.js` sets `output: 'standalone'`, and the `deployment` spec requires the host to run a prebuilt image. The host terminates TLS and binds the app to `127.0.0.1:3000`.
- No `.github/workflows` exists; the remote is a GitHub repository on `main`.

## Goals / Non-Goals

**Goals:**

- Add a level to every entry and route by severity without changing the existing call signature.
- Record unexpected failures as `error` entries at their source.
- Run lint, type check, and tests automatically on every push and pull request.
- Deploy to the VPS automatically on a green merge to `main`, preserving host state.

**Non-Goals:**

- Log aggregation, retention, rotation, sampling, or a `LOG_LEVEL` threshold.
- Metrics, tracing, or request-correlation identifiers.
- Zero-downtime deployment; a short restart of the application is acceptable.
- Automatic schema migrations or any change to the database volume.
- Changing which security events exist — that list is owned by the pending `auth` requirement "Security events are recorded".

## Decisions

### Extend the existing helper rather than add a logging library

Keep `lib/log.ts` as the single entry point. A structured logger such as `pino` or `winston` would add a dependency, duplicate the redaction/neutralisation already tested here, and gain nothing at this scale. **Alternative:** adopt a library — rejected as over-engineering for a hand-rolled contract this small.

### Derive the level from the recorded outcome

`logEvent(event, outcome, fields)` keeps its signature; the helper maps `outcome` to a level through a fixed table:

| outcome | level |
|---|---|
| `accepted`, `created`, `success` | `info` |
| `refused`, `already_registered` | `warn` |
| anything else / `failed` | `error` |

This keeps all eleven call sites and the four test files that assert the signature untouched, and makes the level a property of the outcome rather than an argument a caller can forget or contradict. **Alternatives:** an explicit `level` argument, or a fourth options argument — rejected because they change every call site and the tests that assert them for no behavioral gain here.

### Fixed JSON entry contract

An entry is `{ level, event, outcome, at, ...context }`, one object per line, `level` a lowercase string from the table, `at` an ISO timestamp, context fields redacted and neutralised as today. Field names stay stable so the host's log collection can parse them.

### Route by severity through the console streams

An `info` entry uses `console.log` (standard output); a `warn` or `error` entry uses `console.warn` / `console.error` (standard error). This is the only change that touches the existing `lib/log.test.ts`, which currently spies `console.log`; level-specific tests spy the matching stream. **Alternative:** keep one stream — rejected because it defeats the point of levels for the host's log handling.

### Record failures where they happen

Introduce a small helper (in `lib/log.ts`, e.g. `logFailure(event, fields)`) that emits an `error` entry and never throws, and wrap repository/database calls in the request routes so a caught failure logs an `error` entry naming the operation before the route returns its defined failure response. The helper centralises the operation name so the same failure text is not repeated per route; the route keeps deciding its own response. **Alternative:** a single global error boundary — rejected because it cannot name the failed operation and would not distinguish expected from unexpected failures.

### One workflow with gated jobs

A single GitHub Actions workflow:

1. `checks` on `push` and `pull_request`: `actions/setup-node` pinned to Node 20 (matching the `Dockerfile`), npm cache, `npm ci`, then `lint`, `typecheck`, `test`. No database service (tests mock data access).
2. `build` on `push` to `main`, `needs: checks`: build the image.
3. `deploy` on `push` to `main`, `needs: build`: deliver and restart.

A `concurrency` group cancels superseded runs on the same ref. **Alternative:** separate workflows — rejected as more files for a single pipeline.

### Deliver the image over SSH (save/load)

The runner builds `corp-gifts-app:<sha>` tagged `latest`, retags the host's current image `corp-gifts-app:previous`, streams the new image with `docker save | gzip | ssh ... | docker load`, syncs `docker-compose.yml` and `db/` (never `.env`), and runs `docker compose up -d`. Secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` live in repository secrets. **Alternative:** push to a container registry and pull on the host — rejected per the earlier decision; it adds a registry and a stored credential for a single-host deployment.

## Risks / Trade-offs

- [The deploy job overwrites host secrets or the data volume] -> Sync only `docker-compose.yml` and `db/`; exclude `.env`; use `docker compose up -d` which preserves `db_data`; no migration step.
- [A newly required environment variable is missing on the host, so the app fails to start after deploy] -> The parity check required by the `deployment` spec runs before `up -d`; the deploy step fails clearly instead of leaving a half-started stack.
- [Image transfer over SSH is large and slow] -> Acceptable for a single host with infrequent merges; the registry alternative is documented as the upgrade path if this becomes painful.
- [Retagging `previous` races with a running container] -> Retag before loading the new image; keep the tag idempotent so a repeated deploy does not lose the rollback target.
- [Wrapping every route adds boilerplate] -> A shared helper keeps each wrap to a few lines; only routes that call the repository/database are wrapped.
- [Level tests are coupled to console streams] -> Spy the stream that matches the level, not `console.log` unconditionally.

## Migration Plan

- Rollout: land the logging changes and the workflow together; verify locally with `npm run lint`, `npm run typecheck`, `npm test`; merge to `main` and confirm the pipeline runs and the first automated deployment succeeds; verify the stack and the entries on the host.
- Rollback: revert the merge to restore the previous code; or run the retained `corp-gifts-app:previous` on the host with `docker compose up -d` without rebuilding.

## Open Questions

- The absolute deploy directory on the host and confirmation that Docker, Docker Compose, and the deploy user's SSH access are provisioned — needed before the first automated deploy, not before implementation.
- Whether the GitHub repository enables required status checks on `main` (branch protection) — a repository setting, so the pipeline is correct either way.
