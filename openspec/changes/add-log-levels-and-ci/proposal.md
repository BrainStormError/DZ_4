## Why

Two gaps remain after the security hardening. First, the structured logger writes every entry flat and unleveled on a single stream, so an operator cannot separate ordinary events from warnings or failures, and an unexpected repository or database failure on a request is not recorded at all — it disappears into the framework's default error response. Second, the test suite exists and passes locally, but nothing runs it automatically: there is no continuous integration, every deployment is performed by hand, and a regression or a broken merge can therefore reach the host unnoticed.

## What Changes

- **Every log entry carries a level** (`info`, `warn`, or `error`) in addition to the existing event, outcome, and timestamp, so entries can be filtered and routed.
- **The level is derived from the recorded outcome**: an accepted sign-in, a created registration, and a successful amount change are `info`; a refused sign-in, a refused authorization, and an already-registered attempt are `warn`.
- **Warnings and errors go to the standard-error stream** while informational entries stay on the standard-output stream, so the two can be handled differently by the host's log collection.
- **Unexpected failures are recorded at the real failure points**: a repository or database failure on a request route produces an `error` entry naming the failed operation before the failure response is returned, so the failure is observable rather than only inferable.
- **The JSON entry contract is fixed and documented**: one object per line with the level, the event, the outcome, and the timestamp, plus the redacted, neutralised context fields already in use.
- **Existing protections are unchanged**: logging remains best-effort and never fails a request, secret-named fields stay redacted, and a request value still cannot forge or reshape an entry.
- **A GitHub Actions workflow runs the checks automatically** on every push and pull request: dependency install, lint, type check, and the test suite, so a failing change is visible before it is merged.
- **Merging to the main branch deploys to the host automatically** once the checks pass: the image is built in the runner (not on the small host), delivered to the VPS over SSH, and the stack is restarted; the host's environment file is never overwritten, and the previous image is retained so a deployment can be rolled back.

## Capabilities

### New Capabilities
- `logging`: leveled, structured log entries — how a level is assigned and routed, the fixed JSON entry structure, and the recording of unexpected failures at their real failure points.

### Modified Capabilities
- `deployment`: the delivery of a merged change to the host is automated — checks gate it, the image is built off the host and delivered over SSH, the host configuration is preserved, and a previous version remains available for rollback.
- `testing`: automated coverage of the leveled entries and the failure recording, and the presence of the pipeline that runs the checks on every change.

## Impact

- Logging: `lib/log.ts` and `lib/log.test.ts`; the call sites whose failures now emit an `error` entry — the protected request routes under `app/api/` (wishes, donations, chats, users, registration) and the shared helpers they use.
- Delivery: a new GitHub Actions workflow that installs, lints, type-checks, tests, builds, and deploys; repository secrets for the host address, user, and SSH key (configured outside the repository, never committed).
- Host: the SSH user, deploy directory, and SSH access for the runner; the existing `docker-compose.yml` and `db/` continue to be the source of truth, while `.env` stays on the host.
- Documentation: `README.md` gains the deployment procedure that now runs in the pipeline.
- Risks: the deploy job must not touch the host environment file or the database volume, and must not run schema migrations.
