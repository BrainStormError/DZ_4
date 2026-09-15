## Why

The project currently uses synchronous mock mutations directly in components without any async state handling (loading/error/success), has no test infrastructure, and contains documentation discrepancies (README mentions non-existent `hooks/` folder, InitialSpec.md states Next.js 14+ while actual version is 13.5). This change adds proper async state management using TanStack Query pattern (works with both mocks and real API), establishes testing infrastructure with Vitest, creates a development report, and fixes documentation discrepancies.

## What Changes

- **Async State Management**: Introduce `useAsyncAction` hook (TanStack Query compatible pattern) wrapping all data mutations in `WishBoard`, `DonateDialog`, `ChatThread`, `AdminTable`, `BirthdayCard`. Components get `isLoading`, `error`, `isSuccess` states with Skeletons, Alerts, and Sonner toasts.
- **Testing Infrastructure**: Add Vitest + @testing-library/react + jsdom. Configure `vitest.config.ts`, `vitest.setup.ts`. Write ≥3 tests: DonateDialog happy path, DonateDialog validation error, AdminTable role-based access.
- **Development Report**: Create `development_report.md` in Russian documenting process, AI techniques, prompt examples, problems/solutions, effective techniques, conclusions.
- **Documentation Fixes**: 
  - Remove `hooks/` line from README.md (folder doesn't exist)
  - Update InitialSpec.md Next.js version from "14+" to "13.5 (App Router)"
- **No Breaking Changes**: All changes are additive or documentation-only.

## Capabilities

### New Capabilities
- `testing`: Unit/integration test infrastructure with Vitest and React Testing Library
- `async-states`: Unified async state handling pattern for data mutations (loading, error, success)

### Modified Capabilities
- `wishes`: Add requirement for loading/error/success states when creating/editing wishes
- `donations`: Add requirement for loading/error/success states when sending donations
- `support-chat`: Add requirement for loading/error/success states when sending messages
- `admin`: Add requirement for loading/error/success states when updating donations/gift status

## Impact

**Code Changes:**
- `lib/hooks/useAsyncAction.ts` (new) - unified async action hook
- `lib/hooks/index.ts` (new) - hooks barrel export
- `components/features/WishBoard.tsx` - wrap addWish/updateWish
- `components/features/DonateDialog.tsx` - wrap addDonation/addWish
- `components/features/ChatThread.tsx` - wrap addChatMessage
- `components/features/AdminTable.tsx` - wrap updateDonation/setGiftSent
- `components/features/BirthdayCard.tsx` - handle donate loading state
- `vitest.config.ts`, `vitest.setup.ts` (new) - test config
- `*.test.tsx` files (new) - test files
- `development_report.md` (new) - development report
- `README.md` - remove hooks/ line
- `InitialSpec.md` - fix Next.js version
- `package.json` - add test dependencies and scripts