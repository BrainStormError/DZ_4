## Context

See proposal.md - Why. Current state:
- `app/layout.tsx` wraps app with `AuthProvider initialUser={await resolveCurrentUser()}`
- `lib/auth-context.tsx` defines `AuthProvider` using `useState(initialUser)` — never updates when prop changes after `router.refresh()`
- All client components use `useAuth()` from this context
- NextAuth is already configured with JWT strategy and Google provider

## Goals / Non-Goals

**Goals:**
- Client reflects authenticated user immediately after Google OAuth + registration flow
- Use NextAuth's built-in `SessionProvider` / `useSession()` for automatic sync with session cookie
- Minimal code changes — replace custom context with NextAuth primitives
- Preserve existing `signIn('google')`, `signOut()`, and demo sign-in behavior

**Non-Goals:**
- Change server-side auth logic (NextAuth callbacks, session cookie, registration flow)
- Add new dependencies
- Modify role/authorization logic

## Decisions

### 1. Replace `AuthProvider` with `SessionProvider`

**Choice:** Wrap the app with NextAuth's `SessionProvider` from `next-auth/react` instead of custom `AuthProvider`.

**Rationale:** `SessionProvider` automatically syncs with the session cookie on navigation and provides `useSession()` hook that always reflects current server session. This eliminates the manual sync bug entirely.

**Alternative considered:** Add `useEffect` to sync `initialUser` prop changes in custom `AuthProvider`. Rejected because it duplicates NextAuth's built-in logic and doesn't handle edge cases (session expiry, token refresh, concurrent tabs).

### 2. Adapter for `useAuth()` consumers

**Choice:** Create a thin `useAuth()` adapter that wraps `useSession()` and maps `data.user` to the existing `User` type, preserving `login`, `loginAsDemo`, `logout` functions.

**Rationale:** Minimizes diff across ~6 consumer components. The adapter can import `signIn`, `signOut` from `next-auth/react` directly.

**Alternative considered:** Update every consumer to use `useSession()` directly. Rejected — larger diff, more error-prone.

### 3. Remove `initialUser` from server render

**Choice:** `app/layout.tsx` no longer calls `resolveCurrentUser()` or passes `initialUser` to provider.

**Rationale:** `SessionProvider` reads session from cookie client-side. Server-side `initialUser` was only needed for the custom context's initial state. With `SessionProvider`, the first render may show loading state briefly — acceptable for this app.

**Alternative considered:** Keep server-side user for "instant" first render via `SessionProvider initialSession`. Rejected — adds complexity, NextAuth docs recommend client-only for JWT strategy.

### 4. Demo sign-in integration

**Choice:** Keep `signIn('demo', ...)` calls in adapter's `loginAsDemo`. No changes to demo credentials provider.

**Rationale:** Demo sign-in works via NextAuth credentials provider; `signIn('demo')` works identically with `SessionProvider`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Brief loading flash on first render (no server-side user) | Acceptable UX; can add skeleton if needed later |
| `useSession()` returns `{ data: null, status: 'loading' }` initially | Adapter returns `user: null` during loading — existing null checks in components handle this |
| Type mismatch between NextAuth session user and local `User` type | Adapter maps fields; local `User` type has `role`, `fullName`, etc. — map from session token |
| `signOut` callback URL behavior change | Test `/login` redirect after signOut; NextAuth default matches current behavior |

## Migration Plan

1. Update `app/layout.tsx`: import `SessionProvider` from `next-auth/react`, wrap children, remove `resolveCurrentUser()` call
2. Create new `lib/auth-context.tsx` as thin adapter exporting `useAuth()` that wraps `useSession()`
3. Update all `useAuth()` consumers (no code changes needed if adapter signature matches)
4. Test: Google sign-in → registration → home page shows avatar, donate works, chat works, logout works
5. Test: Demo sign-in (employee & admin)
6. Rollback: revert `app/layout.tsx` and `lib/auth-context.tsx` if issues

## Open Questions

- Should we add a loading skeleton in `Header` while `status === 'loading'`? (Can decide during implementation)
- Does `SessionProvider` need `refetchInterval` for this app? (Default 0 = only on navigation; likely fine)