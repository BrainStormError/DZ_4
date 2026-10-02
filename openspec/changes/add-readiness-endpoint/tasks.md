## 1. Database connectivity helper

- [x] 1.1 Add a `pingDatabase()` helper in `lib/db.ts` that runs a single `SELECT 1` through the existing `query` function, and verify `npm run typecheck` passes
- [x] 1.2 Add a unit test asserting `pingDatabase()` resolves when the pool query succeeds and rejects when it fails, and verify it passes with `npm test`

## 2. Readiness Route Handler

- [x] 2.1 Add `app/api/health/route.ts` exposing a public `GET` that calls `pingDatabase()` and returns `200` with `{"status":"ok"}` on success, and verify the route file exists and `npm run typecheck` passes
- [x] 2.2 Make the handler answer `503` with `{"status":"unavailable"}` and no error details when the database check fails, and verify with the route test in task 3.1
- [x] 2.3 Set `export const dynamic = 'force-dynamic'` on the route and add a test proving the handler re-runs its check per call rather than returning a cached result
- [x] 2.4 Bound the database check with a short timeout (~2s) so an unresponsive database yields `503` instead of hanging, and verify with a test using a never-resolving check
- [x] 2.5 Ensure the handler does not call `resolveCurrentUser` and answers the same without a session, and verify with a test that sends no session and still receives the readiness result
- [x] 2.6 Emit exactly one `warn` log entry naming the readiness check on a failed check, and verify the test asserts the entry level and operation

## 3. Automated coverage

- [x] 3.1 Add `app/api/health/route.test.ts` covering success `200`, failure `503` with no connection details in the body, no-session access, and the failed-check log entry, and verify `npm test` passes
- [x] 3.2 Confirm no existing test regresses and verify `npm test` passes end to end

## 4. Final verification

- [x] 4.1 Run `npm run lint`, `npm run typecheck`, and `npm test`, and verify all three succeed
- [x] 4.2 Build the application (`npm run build`) and confirm the build succeeds and does not execute the readiness check at build time
- [ ] 4.3 Start the stack and confirm `GET /api/health` returns `200` while the database is reachable, and `503` once the database is stopped
