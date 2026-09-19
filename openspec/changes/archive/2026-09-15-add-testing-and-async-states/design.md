## Context

Current state:
- All data mutations (`addWish`, `updateWish`, `addDonation`, `addChatMessage`, `updateDonation`, `setGiftSent`) are called synchronously directly from components via the `useData()` context
- There is no unified pattern for handling loading/error/success states
- There is no test infrastructure
- The documentation contains inaccuracies: the README mentions a non-existent `hooks/` folder, InitialSpec.md states Next.js 14+ instead of the actual 13.5
- The mocks in `lib/data-store.ts` are synchronous, but the architecture should prepare the transition to a real API

Constraints:
- Next.js 13.5 (App Router), React 18, TypeScript 5
- shadcn/ui + Radix UI, Tailwind CSS 3
- sonner is already in the dependencies for toasts
- lucide-react for icons (Loader2 for spinners)
- Data is not persistent (reset on reload) — this is a known limitation, we are not changing it

## Goals / Non-Goals

**Goals:**
1. Introduce the `useAsyncAction` hook (TanStack Query pattern) for uniform handling of async states in all business components
2. Set up Vitest + @testing-library/react + jsdom with the `renderWithProviders` utility
3. Write ≥3 tests: DonateDialog happy path, DonateDialog validation error, AdminTable role access
4. Create `development_report.md` in Russian
5. Fix the README (remove `hooks/`) and InitialSpec.md (Next.js 13.5)
6. All changes are backward compatible with the current mocks

**Non-Goals:**
- Connecting a real backend / NextAuth / Stripe / DB
- Migrating mocks to server actions
- E2E tests (Playwright) — a separate task
- Data persistence (localStorage/IndexedDB)
- Refactoring `data-store.ts` into asynchronous functions (they remain synchronous, wrapped in a Promise)

## Decisions

### 1. Async State Pattern: the `useAsyncAction` hook (not TanStack Query directly)

**Why not TanStack Query right now:**
- Would add ~15KB gzipped to the bundle for functionality that is only needed for mutations
- The mocks are synchronous — QueryClient / caching is redundant
- The `useAsyncAction` pattern provides the same API (`mutate`, `isLoading`, `error`, `isSuccess`) and will allow switching to `useMutation` from TanStack Query with a single line in the future

**Implementation:**
```typescript
// lib/hooks/useAsyncAction.ts
export function useAsyncAction<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options?: { onSuccess?: (data: TResult) => void; onError?: (error: Error) => void }
) {
  const [state, setState] = useState<{ data?: TResult; error?: Error; isLoading: boolean; isSuccess: boolean }>({
    data: undefined, error: undefined, isLoading: false, isSuccess: false
  });

  const mutate = useCallback(async (args: TArgs) => {
    setState(s => ({ ...s, isLoading: true, error: undefined, isSuccess: false }));
    try {
      const data = await mutationFn(args);
      setState({ data, error: undefined, isLoading: false, isSuccess: true });
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      setState(s => ({ ...s, error: error as Error, isLoading: false, isSuccess: false }));
      options?.onError?.(error as Error);
      throw error;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => setState({ data: undefined, error: undefined, isLoading: false, isSuccess: false }), []);

  return { mutate, mutateAsync: mutate, ...state, reset };
}
```

**Usage in components:**
```typescript
const addWishAction = useAsyncAction(
  (args) => Promise.resolve(data.addWish(args)),
  { onSuccess: () => toast.success('Пожелание добавлено'), onError: (e) => toast.error(e.message) }
);
// в JSX: disabled={addWishAction.isLoading}, {addWishAction.isLoading && <Loader2 />}, {addWishAction.error && <Alert>...}
```

### 2. Testing: Vitest + React Testing Library

**Why Vitest:**
- Native integration with Vite (Next.js uses Turbopack, but Vitest works independently)
- Fast, API compatible with Jest, ESM support out of the box
- Already used in the Next.js project ecosystem

**Configuration:**
- `vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, aliases `@/*` → `./*`
- `vitest.setup.ts`: `import '@testing-library/jest-dom'`, global `renderWithProviders`
- `package.json`: `test`, `test:watch` scripts, deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `happy-dom` (optional)

**Test files (co-located):**
- `components/features/DonateDialog.test.tsx` — 2 tests (happy path, validation error)
- `components/features/AdminTable.test.tsx` — 1 test (role access)
- Additionally: `lib/hooks/useAsyncAction.test.ts` — a unit test for the hook

### 3. Documentation Fixes

**README.md:** Remove line 96 `├── hooks/` (the folder does not exist, hooks are inline in `lib/*-context.tsx`)

**InitialSpec.md:** Replace line 25 `Next.js 14+` with `Next.js 13.5 (App Router)` — we document the fact, the upgrade is a separate task

### 4. Development Report

Create `development_report.md` in the project root in Russian following the structure from the discussion.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `useAsyncAction` does not cover request caching/deduplication | Not needed for mocks; when switching to the API, we will replace it with `useMutation` from TanStack Query |
| Tests may be brittle due to context mocks | `renderWithProviders` isolates each test, `useData` mocks via `vi.mock` |
| Sonner toasts may not render in jsdom | Mock `sonner` in setup or use `vi.mock('sonner')` |
| Upgrading Next.js 13.5 → 14 will break the build | Out of scope; we documented the current version |
| `useAsyncAction` does not cancel in-flight requests on unmount | Add `AbortController` in the future with the real API; not critical for mocks |

## Migration Plan

1. Create `lib/hooks/useAsyncAction.ts` + `lib/hooks/index.ts`
2. Update components one by one: `WishBoard` → `DonateDialog` → `ChatThread` → `AdminTable` → `BirthdayCard`
3. Add the test infrastructure (`vitest.config.ts`, `vitest.setup.ts`, deps)
4. Write the tests
5. Create `development_report.md`
6. Fix README.md and InitialSpec.md
7. Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`
8. Archive the change via `openspec archive`

## Open Questions

- Should `skip_specs: true` be added to `.openspec.yaml` for documentation-only fixes? (No — they do not change behavior, but specs have already been created for async-states/testing)
- Use `happy-dom` instead of `jsdom` for speed? (We will keep `jsdom` — more compatible with RTL)
