## 1. Async State Infrastructure

- [x] 1.1 Create `lib/hooks/useAsyncAction.ts` with the `useAsyncAction<TArgs, TResult>` hook returning `{ mutate, mutateAsync, data, error, isLoading, isSuccess, isError, reset }` — verification: the file exists, TypeScript compiles without errors (`npm run typecheck`)
- [x] 1.2 Create `lib/hooks/index.ts` with the export `export * from './useAsyncAction'` — verification: the import works in components
- [x] 1.3 Add `Loader2` from `lucide-react` to the components for loading states (already in deps) — verification: the icon is available

## 2. Component Integration — WishBoard

- [x] 2.1 Update `WishBoard.tsx`: wrap `addWish` in `useAsyncAction`, add `disabled={isLoading}` and `Loader2` to the "Send" button, a success toast via `sonner`, an `Alert` on error with a "Retry" button — verification: visually the button shows a spinner on submit, a toast/alert appears
- [x] 2.2 Update `WishBoard.tsx`: wrap `updateWish` (editing by the admin) in `useAsyncAction` with similar states in the modal — verification: the edit modal shows loading/success/error

## 3. Component Integration — DonateDialog

- [x] 3.1 Update `DonateDialog.tsx`: wrap `addDonation` in `useAsyncAction` at the confirmation step (handleConfirm), add `disabled={isLoading}` + `Loader2` to the "Congratulate"/"Send funds" button — verification: the confirmation button shows a spinner
- [x] 3.2 Update `DonateDialog.tsx`: on success of `addDonation` (and optionally `addWish`) — show a toast via `sonner`, move to the `success` step — verification: the toast appears, the success step is displayed
- [x] 3.3 Update `DonateDialog.tsx`: on error at any step — show an `Alert` with the error text and a "Retry" button (calls `mutate` again) — verification: the Alert is displayed, resubmission works

## 4. Component Integration — ChatThread

- [x] 4.1 Update `ChatThread.tsx`: wrap `addChatMessage` in `useAsyncAction`, add `disabled={isLoading}` + `Loader2` to the "Send" button (Send icon) — verification: the message send button shows a spinner
- [x] 4.2 Update `ChatThread.tsx`: on success — the message immediately appears in the strip (already works through context), on error — an inline `Alert` with "Retry" — verification: the error is displayed, resubmission works

## 5. Component Integration — AdminTable

- [x] 5.1 Update `AdminTable.tsx`: wrap `updateDonation` (saving in the amount-change modal) in `useAsyncAction`, `disabled={isLoading}` + `Loader2` on the "Save" button — verification: the button in the modal shows a spinner
- [x] 5.2 Update `AdminTable.tsx`: wrap `setGiftSent` (toggling the "Sent/Not sent" status) in `useAsyncAction`, the status button shows a spinner, on success — the "Status updated" toast, on error — a toast with the error — verification: status toggling has visual feedback
- [x] 5.3 Update `AdminTable.tsx`: on success of `updateDonation` — close the modal, refresh the table and the log — verification: the modal closes, the data is updated

## 6. Component Integration — BirthdayCard

- [x] 6.1 Update `BirthdayCard.tsx`: the `onDonate` prop triggers the opening of `DonateDialog` (already present), add a local `isDonating` state for the "Congratulate" button on the card — verification: the button on the card shows a spinner while the dialog opens

## 7. Testing Infrastructure

- [x] 7.1 Add dev dependencies to `package.json`: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `happy-dom` — verification: `npm install` passes
- [x] 7.2 Create `vitest.config.ts` with `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, aliases `@/*` → `./*`, `include: ['**/*.{test,spec}.{ts,tsx}']` — verification: `npx vitest run --list` finds the tests
- [x] 7.3 Create `vitest.setup.ts` with `import '@testing-library/jest-dom'`, a global `renderWithProviders` wrapper (ThemeProvider, AuthProvider, DataProvider) and `sonner` mocks — verification: the tests render components without context errors
- [x] 7.4 Add npm scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"` — verification: `npm run test` launches Vitest

## 8. Unit & Integration Tests

- [x] 8.1 Create `lib/hooks/useAsyncAction.test.ts`: hook tests — loading/success/error/reset — verification: `npm run test` passes the hook tests
- [x] 8.2 Create `components/features/DonateDialog.test.tsx`: **Test 1 (happy path)** — render with providers, enter a corporate email → amount → message → confirmation → verify that `addDonation` is called with the correct arguments and the `success` step appears — verification: the test passes
- [x] 8.3 Create `components/features/DonateDialog.test.tsx`: **Test 2 (validation error)** — enter `user@gmail.com` → verify the inline error, block the transition to the `amount` step, `addDonation` is not called — verification: the test passes
- [x] 8.4 Create `components/features/AdminTable.test.tsx`: **Test 3 (role access)** — render as `employee` → the amounts table is hidden/a placeholder is shown; render as `admin` → the table is visible, the "Edit" button works only when a reason and a comment are selected — verification: the test passes

## 9. Development Report

- [x] 9.1 Create `development_report.md` in the project root in Russian following the structure: 1) Process description, 2) AI techniques, 3) Prompt examples and results (table), 4) Problems and solutions (table), 5) Effective techniques, 6) Conclusions and recommendations — verification: the file exists and contains all sections

## 10. Documentation Fixes

- [x] 10.1 Fix `README.md`: remove line 96 `├── hooks/` (the folder does not exist) — verification: `grep -n hooks README.md` does not find the line
- [x] 10.2 Fix `InitialSpec.md`: on line 25 replace `Next.js 14+` with `Next.js 13.5 (App Router)` — verification: `grep -n "Next.js" InitialSpec.md` shows the current version

## 11. Final Verification

- [x] 11.1 Run `npm run lint` — verification: 0 errors
- [x] 11.2 Run `npm run typecheck` — verification: 0 errors
- [x] 11.3 Run `npm run build` — verification: a successful build
- [x] 11.4 Run `npm run test` — verification: all tests pass (minimum 4 tests: the hook + 3 integration tests)
- [x] 11.5 Archive the change: `openspec archive add-testing-and-async-states` — verification: the change is in the archive, `openspec list` shows no active changes
