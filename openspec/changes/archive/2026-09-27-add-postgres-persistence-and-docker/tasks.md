## 1. Schema and seed data

- [x] 1.1 Create `db/init/001_schema.sql` with the tables `users`, `wishes`, `donations`, `donation_history`, `chat_messages`, the enums `user_role` and `refund_reason`, the foreign keys, the constraints, and the indexes `wishes_target_created_idx` and `chat_thread_created_idx`; keep ids as `text` and totals as `integer` — verification: start a local PostgreSQL 16 container, mount `db/init`, and confirm `\dt` lists all five tables and `\d wishes` shows the foreign keys and index
- [x] 1.2 Create `db/init/002_seed.sql` from `lib/mock-data.ts` with the 12 users, 6 wishes, 12 donation rows, 2 history entries, and 2 chat threads mapped to the new foreign keys, and make re-application idempotent — verification: apply the seed twice on the same database and confirm no duplicate rows and the same counts (12/6/12/2/3)
- [x] 1.3 Verify the seeded directory supports login for `anna.smirnova@company.com` and the admin `alexander.petrov@company.com` — verification: a `SELECT` against `users` returns both rows with the expected roles

## 2. Database access layer

- [x] 2.1 Add `pg` and `@types/pg` to `package.json` and install — verification: `npm install` succeeds and `node -e "require('pg')"` resolves
- [x] 2.2 Create `lib/db.ts` with a single `pg.Pool` cached on `globalThis` and read `DATABASE_URL` — verification: `npm run typecheck` passes, and importing the module twice in a dev run reuses one pool (no connection leak in `pg_stat_activity`)
- [x] 2.3 Create `lib/repository.ts` with the server queries for users, wishes, donations, donation history, and chats, using an atomic `total_amount = total_amount + $1` update for contributions and a transaction for the combined amount-plus-wish submission — verification: `npm run typecheck` passes and the queries return the seeded rows against the local database
- [x] 2.4 Create `lib/session.ts` with `resolveCurrentUser()` reading the `corp-gift-auth-email` cookie and looking the address up in `users`, returning `null` when absent — verification: a small local script resolves the seeded admin from a cookie value and `null` for an unknown address

## 3. API route handlers

- [x] 3.1 Add `POST /api/auth/login` and `POST /api/auth/verify-email`, keeping the domain rule in `lib/corp-email.ts` and the same error messages as today — verification: `curl` with a valid address returns success, a non-corporate address and `unknown.user@company.com` return the existing messages
- [x] 3.2 Add `GET /api/users` returning the directory — verification: `curl /api/users` returns the 12 seeded users with no email of an unrelated user
- [x] 3.3 Add `GET /api/wishes`, `POST /api/wishes`, and `PATCH /api/wishes/[id]`, with the administrator-only restriction on editing — verification: `curl` creates and edits a wish, and a request without an admin session is rejected and changes nothing
- [x] 3.4 Add `GET /api/donations`, `POST /api/donations`, `PATCH /api/donations/[id]`, and `PATCH /api/donations/[id]/gift-status`, with the admin-only restriction on amount changes and gift status and with reasons/comments required for a log entry — verification: `curl` adds an amount, changes it with a reason, and the log gains one entry; a non-admin request is rejected
- [x] 3.5 Add `GET /api/chats`, `POST /api/chats/[userEmail]/messages`, and `POST /api/chats/[userEmail]/read`, returning all threads only to an admin and only the current employee's thread to an employee — verification: `curl` as an employee returns only that employee's thread; as an admin it returns all threads; opening a thread clears its unread marker
- [x] 3.6 Mark every handler `export const dynamic = 'force-dynamic'` and reject unauthenticated reads and writes with `resolveCurrentUser()` — verification: `curl` without a cookie receives a rejected response and no protected payload

## 4. Directory provider and client wiring

- [x] 4.1 Create `lib/directory-context.tsx` fetching `GET /api/users` and exposing users plus loading and error state through `useDirectory()`, and mount it in `app/layout.tsx` above the data providers — verification: `npm run typecheck` passes and a page renders with the fetched directory
- [x] 4.2 Replace the `mockUsers` import in `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, `components/features/WishBoard.tsx`, `components/features/DonateDialog.tsx`, `components/features/AdminTable.tsx`, and `components/features/ChatThread.tsx` with `useDirectory()` — verification: no `mockUsers` import remains outside `lib/mock-data.ts`, and `npm run typecheck` passes
- [x] 4.3 Handle the directory loading and error states in the affected components without breaking the existing empty states — verification: with the API temporarily returning an error, the components show an error/empty state instead of crashing

## 5. Session and login through the server

- [x] 5.1 Make `login` in `lib/auth-context.tsx` async and call `POST /api/auth/login`, keeping `logout` and the cookie helpers in `lib/auth-cookie.ts` unchanged — verification: `npm run typecheck` passes and the login form still blocks a non-corporate and an unknown address with the existing messages
- [x] 5.2 Switch `app/layout.tsx`, `app/(app)/layout.tsx`, and `app/(app)/admin/page.tsx` from `checkCorpEmail` to `resolveCurrentUser()` — verification: with a valid cookie the server markup contains the user's name; without a cookie `/admin` still redirects to `/login`; an `employee` still gets the access-denied state
- [x] 5.3 Reduce `lib/corp-email.ts` to the pure domain rule, with the directory lookup living in the repository/session layer — verification: `npm run typecheck` passes and no module outside `lib/` imports the old directory lookup

## 6. Data store through the API

- [x] 6.1 Rework `lib/data-store.ts` to load wishes, donations, history, and chats from the API on mount and to perform each mutation through the matching endpoint, keeping the method names and signatures — verification: `npm run typecheck` passes and the public shape of `useDataStore` is unchanged
- [x] 6.2 Keep `lib/data-context.tsx`'s three contexts and hooks unchanged, adjusting only how the store values are provided — verification: `useWishes`, `useDonations`, and `useChats` still throw the same "must be used within DataProvider" error outside the provider
- [x] 6.3 Route the admin and chat mutations through the existing `useAsyncAction` wrappers so the loading/error/success states in `async-states` keep working — verification: saving an amount and sending a message still show the loading state and the existing toast/error states

## 7. Tests and code checks

- [x] 7.1 Update `components/features/DonateDialog.test.tsx` and `components/features/AdminTable.test.tsx` so they mock the new async API boundary instead of a synchronous store, keeping the existing assertions about the donation flow and role gating — verification: `npm test` passes with all existing scenarios
- [x] 7.2 Run `npm run lint` and `npm run typecheck` and fix any issues — verification: both commands exit successfully

## 8. Docker and packaging

- [x] 8.1 Add `output: 'standalone'` to `next.config.js` and confirm the production build emits `.next/standalone` — verification: `npm run build` succeeds and `.next/standalone/server.js` exists
- [x] 8.2 Create the multi-stage `Dockerfile` (`deps` → `build` → `runner`, Node Alpine, `CMD ["node","server.js"]`, `EXPOSE 3000`) and `.dockerignore` (`node_modules`, `.next`, `.git`, `openspec`) — verification: the image builds off-host and starts against a reachable database
- [x] 8.3 Create `docker-compose.yml` with the `db` service (`postgres:16-alpine`, tuned low-memory `command` flags, `healthcheck`, `db_data` volume, `mem_limit: 384m`, init scripts mounted) and the `app` service (prebuilt image, `depends_on` healthy db, `DATABASE_URL`, port 3000, `mem_limit: 384m`, `restart: unless-stopped`) — verification: `docker compose up -d` starts both services, the app waits for a healthy database, and the pages load
- [x] 8.4 Create `.env.example` listing `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `DATABASE_URL`, with no real secrets, and keep `.env` uncommitted — verification: `git status` does not show a real `.env`, and the example file lists every variable the stack reads

## 9. Documentation

- [x] 9.1 Update `README.md`: the project is no longer mock-only, describe PostgreSQL, `DATABASE_URL`, the container stack, the off-server build, and the schema-change limitation — verification: the README no longer claims data resets on reload and documents how to run the stack

## 10. End-to-end verification

- [x] 10.1 Run the app against a local database and verify login for `anna.smirnova@company.com` and the admin `alexander.petrov@company.com` — verification: both logins succeed with the expected roles
- [x] 10.2 Verify persistence: create a wish, add a contribution, and send a message, then reload — verification: all three are still present after the reload
- [x] 10.3 Verify the participation dialog: adding an amount increases the total and creates a wish only when the text is non-empty — verification: the total grows and the board gains a wish only for the non-empty case
- [x] 10.4 Verify the admin panel: an amount change with a mandatory reason and comment writes one log entry, and a gift-declined refund zeroes the amount and blocks further changes — verification: the log and the amount match these rules after a reload
- [x] 10.5 Verify the chat: an employee sees only their own thread, an admin sees all threads and can reply, and opening a thread clears its unread counter — verification: the thread lists and counters behave accordingly
- [x] 10.6 Run the full stack on the 1 GB server: build the image off-host, `docker compose up -d`, and check resource use and the key pages — verification: `docker stats` totals below the documented budget (~700 MB) and `curl` returns the key pages
- [x] 10.7 Run the final `npm run lint`, `npm run typecheck`, and `npm test` — verification: all three pass
