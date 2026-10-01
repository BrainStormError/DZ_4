## 1. Update App Layout — Replace AuthProvider with SessionProvider

- [x] 1.1 Modify `app/layout.tsx`: import `SessionProvider` from `next-auth/react`, wrap `{children}` with `<SessionProvider>`, remove `resolveCurrentUser()` call and `initialUser` prop pass. **Verify:** TypeScript compiles, no runtime errors on page load.
- [x] 1.2 Remove `AuthProvider` import from `app/layout.tsx`. **Verify:** No unused import warnings.

## 2. Create Auth Adapter — Thin Wrapper Around useSession()

- [x] 2.1 Rewrite `lib/auth-context.tsx` to export `useAuth()` that calls `useSession()` from `next-auth/react`, maps `session.user` to local `User` type (including `role`, `fullName`, `email`, `avatarUrl`), and provides `login`, `loginAsDemo`, `logout` using `signIn`/`signOut` from `next-auth/react`. **Verify:** File compiles, exports `useAuth` with same signature as before.
- [x] 2.2 Ensure `User` type mapping includes all fields used by consumers (`id`, `fullName`, `email`, `role`, `avatarUrl`). **Verify:** TypeScript shows no errors in consumer components.

## 3. Verify Consumer Components Work Without Changes

- [x] 3.1 Check `components/layout/Header.tsx` — uses `user`, `logout` from `useAuth()`. **Verify:** No TypeScript errors.
- [x] 3.2 Check `components/features/DonateDialog.tsx` — uses `user` from `useAuth()`. **Verify:** No TypeScript errors.
- [x] 3.3 Check `components/features/ChatThread.tsx` — uses `user` from `useAuth()`. **Verify:** No TypeScript errors.
- [x] 3.4 Check `components/features/WishBoard.tsx` — uses `user` from `useAuth()`. **Verify:** No TypeScript errors.
- [x] 3.5 Check `app/(auth)/login/LoginForm.tsx` — calls `login()`/`loginAsDemo()` from `useAuth()`. **Verify:** No TypeScript errors.

## 4. Integration Testing — Manual Verification Flow

- [x] 4.1 Start dev server (`npm run dev`). **Verify:** Server starts without errors.
- [ ] 4.2 Test Google OAuth sign-in: click "Войти через Google", complete OAuth flow, land on registration page, fill form, submit. **Verify:** Redirected to `/`, user avatar + name visible in header top-right, dropdown shows "Выйти".
- [ ] 4.3 Test "Поздравить / отправить средства" button: click, select recipient, enter amount, confirm. **Verify:** Toast shows success, dialog closes.
- [ ] 4.4 Test chat: navigate to FAQ page, click "Написать админу" tab. **Verify:** Input field visible at bottom, can type and send message.
- [ ] 4.5 Test logout: click avatar dropdown → "Выйти". **Verify:** Redirected to `/login`, session cleared.
- [ ] 4.6 Test demo sign-in (if enabled): go to `/login`, click demo employee button. **Verify:** Signed in as employee, avatar visible.
- [ ] 4.7 Test demo admin sign-in: click demo admin button. **Verify:** Signed in as admin, admin panel accessible.

## 5. Edge Cases & Polish

- [ ] 5.1 Handle loading state in `Header`: show skeleton/placeholder while `status === 'loading'`. **Verify:** No flash of missing avatar on hard refresh.
- [ ] 5.2 Ensure `signOut({ callbackUrl: '/login' })` in adapter works correctly. **Verify:** Logout redirects to `/login` page.
- [x] 5.3 Run existing tests: `npm test`. **Verify:** All tests pass (update any tests that mock old AuthProvider).
- [x] 5.4 Run lint/typecheck: `npm run lint` and `npm run typecheck`. **Verify:** No new errors.