## 1. Leveled logging core

- [x] 1.1 Add a level to `lib/log.ts` derived from the recorded outcome (`accepted`/`created`/`success` → `info`, `refused`/`already_registered` → `warn`, otherwise `error`) and include it as the first field of the entry; verify a test asserts each outcome maps to the expected level and that the entry still parses as a single JSON line
- [x] 1.2 Route `info` entries to the standard-output stream and `warn`/`error` entries to the standard-error stream; verify tests spy the matching stream per level and the existing redaction and neutralisation tests still pass

## 2. Failure recording

- [x] 2.1 Add a best-effort `logFailure` helper that emits an `error` entry naming the failed operation without throwing and without exposing a secret; verify a unit test asserts the entry's level, that it names the operation, and that it never throws
- [x] 2.2 Wrap the repository and database calls in the request routes (wishes, donations, chats, users, registration) so an unexpected failure logs an `error` entry before the route returns its defined failure response; verify a route test asserts the entry is emitted and the client still receives the defined response

## 3. Continuous integration

- [x] 3.1 Add a GitHub Actions workflow with a `checks` job on `push` and `pull_request` that pins Node 20 with npm cache, installs dependencies, and runs lint, type check, and tests; verify the job runs green on a push and fails when the suite fails
- [x] 3.2 Add a `concurrency` group that cancels superseded runs on the same ref; verify a second push cancels the first run

## 4. Automated deployment

- [x] 4.1 Add a `build` job that runs on a push to `main` after `checks` and builds the application image tagged with the commit and `latest`; verify the job produces the image and is skipped when `checks` fails
- [x] 4.2 Add a `deploy` job that retags the host's current image as the rollback reference, streams the new image over SSH, syncs `docker-compose.yml` and `db/` while excluding `.env`, and runs `docker compose up -d`; verify a green merge to `main` updates the running stack and the host environment file is unchanged
- [x] 4.3 Document the pipeline in `README.md` — the required repository secrets, the host prerequisites, and the rollback step; verify every secret the workflow reads is listed and the rollback instruction uses the retained image

## 5. Verification

- [x] 5.1 Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; verify all four succeed
- [x] 5.2 Confirm end to end that a green merge to `main` deploys while a failing check blocks deployment, the host environment file and database volume are untouched, and the previous image remains available for rollback; verify each observation on the host
