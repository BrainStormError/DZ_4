## Context

See `proposal.md` — Why. The requirements for observable behavior are in the deltas: `specs/data-persistence/spec.md`, `specs/deployment/spec.md`, and the deltas for `auth`, `wishes`, `donations`, and `support-chat`.

Current state in the code (verified by reading it):

- Data is client-only and in-memory. `lib/data-store.ts:12-16` seeds `useState` from `lib/mock-data.ts`; `lib/data-context.tsx` splits that store into three contexts. Nothing persists, so every reload restores the mocks.
- The directory is a compiled-in array. `lib/corp-email.ts:12` is a pure function over `mockUsers` (`lib/mock-data.ts:14`). It runs on both server and client: `app/layout.tsx:30-32` and `app/(app)/layout.tsx:10-11` already resolve the session cookie on the server (the previous `add-server-session-cookie` change is complete, though not yet archived); `lib/auth-context.tsx:31-40` re-validates on the client at login.
- Six client components import `mockUsers` directly: `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, `components/features/{WishBoard,DonateDialog,AdminTable,ChatThread}.tsx`.
- `lib/types.ts` models relations by email string (`Wish.authorEmail`, `DonationHistoryEntry.adminEmail`, `ChatThread.userEmail`, `ChatMessage.authorEmail`) and keeps ids like `u1`/`w1`/`c1`/`h1`.
- `designed states` for mutations already exist: `useAsyncAction` plus loading/error/success UI, deliberately written to be "ready to replace `mutationFn` with real `fetch` calls" (`openspec/specs/async-states/spec.md`).
- Stack: Next.js 13.5.1 App Router, React 18. Server layout and `/admin` are server components; the boards are client components. No backend, no DB, no env config today; `.env` is not needed (`README.md`).
- Existing tests mock the contexts, not the network: `AdminTable.test.tsx` and `DonateDialog.test.tsx`; `DonateDialog.test.tsx` asserts `addDonation('u1', 500)` and `addWish({...})`.

## Goals / Non-Goals

**Goals:**

1. One shared durable store behind all five data sets, with the client going through server endpoints only.
2. Preserve every existing UI behavior, message text, role rule, and public context shape, so feature components change only their data source.
3. Keep ids and field semantics compatible with the current UI and tests where possible (string ids such as `u1`, `w1`).
4. A container stack that fits a 1 GB host at runtime because the build happens off-host.
5. `npm run lint`, `npm run typecheck`, `npm test` stay green.

**Non-Goals:**

- An ORM, a migrations framework, CI, connection pooling beyond a single process pool.
- Changing the collection model from an aggregate to per-contributor records.
- Real authentication, cookie signing, RLS, httpOnly cookies.
- Moving the theme or FAQ content into the database.
- New automated database tests.

## Decisions

### 1. PostgreSQL via `pg` and Route Handlers, no ORM

The server talks to Postgres with the `pg` driver; the client talks to the server over `app/api/**/route.ts`. Rationale: the schema is small and fixed, an ORM adds a build/runtime cost on a 1 GB host and a migration framework that is explicitly out of scope. Route Handlers keep the existing client components as React components (the `async-states` spec already anticipates `fetch`).

Alternatives: (a) PostgREST/Supabase client — the repo already depends on `@supabase/supabase-js`, but a hosted store conflicts with the self-hosted 1 GB server goal; (b) Server Actions — viable, but Route Handlers are easier to test with `curl` during manual verification and keep the API surface explicit; (c) an ORM (Prisma/Drizzle) — rejected per Non-Goals.

### 2. Application-layer schema with stable string ids

Tables: `users`, `wishes`, `donations`, `donation_history`, `chat_messages`. Relations replace email strings with user foreign keys (`Wish.authorEmail → wishes.author_id`, `DonationHistoryEntry.adminEmail → donation_history.admin_id`, `ChatMessage.authorEmail → chat_messages.author_id`; the chat thread is `chat_messages.thread_user_id`, grouped, with no separate `threads` table). Ids stay `text` and keep the mock values (`u1`, `w1`, `c1`, `h1`); new rows get a generated unique id (`gen_random_uuid()` or `crypto.randomUUID()` server-side). Rationale: this keeps the seeded demo data identical to the mocks and avoids a client rewrite. The email is still the wire format the UI knows, so the repository maps ids back to emails when building the API payloads.

Collection totals remain a single row per recipient (`donations.user_id` primary key, `total_amount` integer), which satisfies the "aggregate" requirement and makes the existing UI unchanged.

Alternatives: (a) keep email columns and no FKs — simpler but loses referential integrity; (b) UUID primary keys everywhere — cleaner, but forces id changes through the UI and tests for no benefit.

### 3. Server session helper and API authorization

`lib/session.ts` exposes `resolveCurrentUser()`: read the `corp-gift-auth-email` cookie, look the address up in `users`, return the user or `null`. Server pages/layouts use it; Route Handlers use it to reject unauthenticated requests and to enforce `role === 'admin'` for administrative endpoints. The cookie remains unsigned — an accepted demo-level trade-off, unchanged from the previous change.

### 4. Directory delivered to client components through a provider

`lib/directory-context.tsx` fetches `GET /api/users` once and exposes the users plus loading/error state via `useDirectory()`. The six components that import `mockUsers` switch to it. Rationale: directory data is read-only and shared; one fetch avoids six independent calls and keeps the client code close to its current shape. The `async-states` spec already permits loading states, but the provider is mounted high enough (root layout) that most screens render with data already fetched, minimizing visible loading.

Alternatives: (a) pass users down as server props — would require converting the client boards to server components and pass serializable data through several layers, a larger refactor; (b) fetch per component — more requests and duplicated loading state.

### 5. `lib/data-store.ts` keeps its method names and signatures; only the body changes

`useDataStore` loads state from the API on mount and re-fetches after mutations, and each mutation (`addWish`, `updateWish`, `addDonation`, `setGiftSent`, `updateDonation`, `addChatMessage`, `markThreadRead`) becomes an async call to the corresponding endpoint. `lib/data-context.tsx` keeps the same three contexts and hooks. Rationale: this is the smallest change that preserves behavior, and it lets the existing `useAsyncAction` wrappers and tests keep working.

### 6. Login becomes a server-validated async call

`lib/auth-context.tsx` keeps `login`/`logout`, but `login` becomes async and calls `POST /api/auth/login` (domain rule stays in `lib/corp-email.ts`; the directory lookup moves to the repository). On success the client writes the same cookie via `lib/auth-cookie.ts` and navigates. Server layouts continue to use `resolveCurrentUser()`. Rationale: the directory must be the single source of truth on the server, while the cookie remains the session mechanism.

### 7. Docker: multi-stage build, run off-host, tuned for 1 GB

`Dockerfile` is multi-stage (`deps` → `build` → `runner`) with `next.config.js` set to `output: 'standalone'`; the runner is a Node Alpine image running `server.js`. `docker-compose.yml` defines `db` (`postgres:16-alpine`, tuning flags, `healthcheck`, `mem_limit: 384m`, named volume) and `app` (prebuilt image, `depends_on: db service_healthy`, `DATABASE_URL`, `mem_limit: 384m`, `restart: unless-stopped`). `db/init/*.sql` is mounted into `/docker-entrypoint-initdb.d`, so schema and seed apply only on an empty volume.

Rationale: `next build` needs more than 1 GB, so it must not run on the host; the verified budget is ~400–600 MB for the combined runtime. Alternatives: (a) build on the server with swap — slow and fragile; (b) a smaller runtime image than Node Alpine — no gain given the app's own memory footprint.

### 8. Tests

No new database tests. Existing component tests are updated to mock the new async data/API boundary rather than a synchronous store, keeping `npm test` green. Correctness of the DB layer is checked manually per the plan's validation list.

## Risks / Trade-offs

- [Schema has no migrations; `db/init` applies only on an empty volume] → documented as a known limitation; future changes need a manual `ALTER`. Acceptable for a demo.
- [First render now has loading states because data comes from the API] → `async-states` explicitly allows loading states and the provider is high in the tree; verify SSR markup and the LCP budgets in `specs/performance/spec.md` are not broken.
- [`pg.Pool` under dev/HMR can leak connections] → keep one pool on `globalThis`.
- [Per-request round trips could regress the dynamic-render budgets] → all routes are already dynamic after the session-cookie change; measure and confirm no budget violation.
- [Client components lose the synchronous, always-available mock data] → empty/loading states must exist; the six components already have `useAsyncAction` patterns to reuse.
- [Concurrent contributions to one recipient] → use an atomic `UPDATE ... SET total_amount = total_amount + $1` so amounts are not lost.
- [Secrets in `.env` for the demo stack] → acceptable for a demo, clearly documented as unsuitable for production.
- [Unsigned cookie remains forgeable] → unchanged, accepted demo-level trade-off.
- [Refunds per contributor are impossible with an aggregate] → intentional, out of scope.

## Migration Plan

1. Add the schema and seed (`db/init/001_schema.sql`, `002_seed.sql`); start a local Postgres and confirm the seed applies.
2. Add `lib/db.ts`, `lib/repository.ts`, `lib/session.ts`.
3. Add the Route Handlers from the proposal's API surface; verify each with `curl`.
4. Add `lib/directory-context.tsx`, mount it in `app/layout.tsx`, and replace `mockUsers` in the six components.
5. Move login to `POST /api/auth/login` and server pages to `resolveCurrentUser()`.
6. Move `lib/data-store.ts` / `data-context.tsx` to the API, keeping public names.
7. Update the existing tests; run `npm run lint`, `npm run typecheck`, `npm test`.
8. Add `output: 'standalone'` and the `pg`/`@types/pg` dependencies.
9. Add `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`; update `README.md`.
10. Manual verification, then final lint/typecheck/test.

Rollback: revert the commits. Data written to the volume is demo data; there is no production data migration. Removing the stack is `docker compose down`; removing `db_data` resets the demo.

## Open Questions

None.
