## Why

After Google OAuth sign-in and registration completion, the server correctly re-renders the page with the authenticated user (via `resolveCurrentUser()` in `app/layout.tsx`), but the client-side `AuthProvider` context only uses `initialUser` as initial state and never syncs when the prop changes after `router.refresh()`. This causes `useAuth()` to return `user: null` even though the session cookie is valid, breaking: (1) the "Send gift" confirm button in `DonateDialog`, (2) the user avatar/logout dropdown in `Header`, and (3) the entire `ChatThread` component which renders `null` when no user.

## What Changes

- Replace custom `AuthProvider` with NextAuth's `SessionProvider` and use `useSession()` hook for client-side session access
- Remove `initialUser` prop passing from server to `AuthProvider` (no longer needed)
- Update all `useAuth()` calls to use NextAuth's session directly or via a thin adapter
- Ensure `signOut()` callback URL works correctly with `SessionProvider`

## Capabilities

### New Capabilities

- (none - this is a pure implementation fix)

### Modified Capabilities

- (none - the existing `auth` spec already requires proper session handling via server-issued cookies. The bug is in the React client sync, not the spec requirements.)

## Impact

**Affected files:**
- `app/layout.tsx` - Replace `AuthProvider` with `SessionProvider`
- `lib/auth-context.tsx` - Replace with adapter using `useSession()` or remove entirely
- `components/layout/Header.tsx` - Update `useAuth()` usage
- `components/features/DonateDialog.tsx` - Update `useAuth()` usage
- `components/features/ChatThread.tsx` - Update `useAuth()` usage
- `components/features/WishBoard.tsx` - Update `useAuth()` usage (if it uses auth)
- `app/(auth)/login/LoginForm.tsx` - Update sign-in calls to use NextAuth directly

**Dependencies:**
- NextAuth's `SessionProvider` from `next-auth/react` (already a dependency)
- No new packages required