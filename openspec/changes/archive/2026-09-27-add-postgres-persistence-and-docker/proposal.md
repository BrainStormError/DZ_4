## Why

Today every screen reads hardcoded mocks from `lib/mock-data.ts` through the client-only `useDataStore`, so wishes, collection amounts, the change log, and chat messages are lost on every page reload and are never shared between users; the user directory used by login is also a compiled-in array. The app needs a real shared store so that what one person enters is still there for the next person, while keeping every existing UI behavior and spec intact. At the same time the demo must run on a 1 GB server, which cannot host a Next.js production build, so the image is built off-server and only the runtime stack is deployed.

## What Changes

- **A PostgreSQL database becomes the source of truth** for the corporate directory, wishes, collection amounts, the amount-change log, and chat messages. Reads and writes go through server Route Handlers (`app/api/**/route.ts`); the `pg` driver is used directly, without an ORM.
- **Data becomes durable and shared.** A wish, a contribution, an administrative amount change, or a chat message is visible after a page reload and to other users, instead of resetting to mocks. **BREAKING** (behavior): the demo is no longer client-only.
- **Login and session resolution read the persisted directory.** The server still validates the `corp-gift-auth-email` cookie and role, but the employee record now comes from the database rather than `mockUsers`; the domain rule and the error messages are unchanged. **BREAKING** (environment): the app now requires a reachable PostgreSQL and `DATABASE_URL`.
- **Client components take the directory from a shared provider** (`GET /api/users`) instead of importing `mockUsers`; the data contexts keep their existing public names and shapes, so feature components change only their data source, not their behavior.
- **A container stack** (`Dockerfile` + `docker-compose.yml`) runs `app` and `db` together on a 1 GB server with tuned PostgreSQL settings and container memory limits; the application image is built outside the server.
- **Schema and seed data** are applied from `db/init/*.sql` on an empty volume, seeding the same users, wishes, donations, history, and threads that the mocks contain today.
- Existing tests are updated so `npm test` stays green; no new automated database tests are added (manual verification).

## Capabilities

### New Capabilities

- `data-persistence`: a shared, durable store for the directory, wishes, collection amounts, the change log, and chat messages, exposed to the app through server API endpoints with server-side validation and role checks.
- `deployment`: packaging and running the application together with PostgreSQL in a resource-limited container stack on a small server, including schema/seed initialization and environment configuration.

### Modified Capabilities

- `auth`: login and session resolution validate the corporate address against the persisted directory; the rule and messages are unchanged.
- `wishes`: created and edited wishes are stored durably and shared between users.
- `donations`: participation amounts, administrator amount changes, gift status, and the change log are stored durably and shared.
- `support-chat`: conversation messages and their read state are stored durably and shared between the employee thread and the administrator.

## Impact

- New: `lib/db.ts` (singleton `pg.Pool`), `lib/repository.ts`, `lib/session.ts`, `lib/directory-context.tsx`, `app/api/**/route.ts`, `db/init/001_schema.sql`, `db/init/002_seed.sql`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`.
- Changed: `lib/data-store.ts` and `lib/data-context.tsx` (load and mutate through the API), `lib/auth-context.tsx` (async login through `POST /api/auth/login`), `lib/corp-email.ts` (domain rule only), `app/layout.tsx`, `app/(app)/layout.tsx`, `app/(app)/admin/page.tsx`, `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, `app/(auth)/login/LoginForm.tsx`, `components/features/{WishBoard,DonateDialog,AdminTable,ChatThread}.tsx`, `components/features/{AdminTable,DonateDialog}.test.tsx`, `next.config.js` (`output: 'standalone'`), `package.json` (`pg`, `@types/pg`), `README.md`.
- Unchanged behavior kept on purpose: collection totals stay an aggregate per recipient (no per-contributor records), the cookie stays unsigned demo-level, ORM and migration frameworks stay out of scope, and FAQ/theme storage stays in code/localStorage.
- Out of scope: real authentication/cookie signing, RLS, a migrations framework, CI, and modelling collections as individual contributions.
