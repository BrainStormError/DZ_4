## Why

The first load and the responsiveness of the application waste resources. `next/font` preloads five font families on every load, although only one theme is ever active (`app/layout.tsx:10-46`). The single data context provides a new object on every render (`lib/data-store.ts:124-139`, `lib/data-context.tsx:10`), so any mutation — a wish, a contribution, a message — re-renders `Header`, `WishBoard`, `ChatThread`, `AdminTable`, and `DonateDialog` along with their subtrees. The correspondence tab on the FAQ page goes through `router.replace()` (`app/(app)/faq/page.tsx:64-73`), that is, every tab click is a soft navigation with a repeated request for the RSC segment and an empty Suspense fallback. The root providers `auth` and `theme` create a new `value` on every render (`lib/auth-context.tsx:47`, `lib/theme-context.tsx:36`).

The target Core Web Vitals budgets are already fixed in `openspec/specs/performance/spec.md`, but the listed places do not meet them. We first fix the requirements for these scenarios, then eliminate the causes.

## What Changes

- **The correspondence tab on FAQ stops being navigation.** The active tab is kept in component state; a tab click calls `setTab` and a shallow update of the address via `window.history.replaceState` without involving the router. The initial value is read from `?tab=messages`, and external transitions (`Header.tsx:111`, browser buttons) are synchronized with the state, so a direct link and a transition from an already open page continue to work.
- **`DataContext` is split by data domains.** Three contexts — `Wishes` (`wishes`, `addWish`, `updateWish`), `Donations` (`donations`, `history`, `addDonation`, `setGiftSent`, `updateDonation`), `Chats` (`chats`, `addChatMessage`, `getChatThread`, `getAllThreads`, `markThreadRead`) — and three hooks `useWishes()`, `useDonations()`, `useChats()`. Each `value` is memoized by the identities of the store's fields. **BREAKING** for the internal API: the aggregating `useData()` is removed, otherwise it would again subscribe everything to everything and the split would have no effect. The name `DataProvider` and the type `DataStore` are preserved.
- **The root providers `auth` and `theme` memoize `value`** by fields, as is already done in `lib/date-context.tsx:35-44`, so that a provider re-render does not infect its subscribers.
- **Font preload is limited to the active theme.** `preload: false` is set for the families of non-default themes; `subsets` remain, since all of them are actually used by their theme. The option of moving the theme into a cookie for server-side family selection is a fork in `design.md` and is not implemented by default.
- **Heavy features are connected lazily (as the last step, only if the first load is still slow).** `DonateDialog` (413 lines) goes into a separate chunk that is loaded on the first opening of the dialog, and not when the home page mounts. We do not touch `AdminTable`: the `/admin` route is already code-split per page, and lazy loading there would add an extra request.
- **Measurement — only `npm run build && npm run start`.** Dev mode with React 18 StrictMode doubles commits and compiles the route on the first navigation, so we do not take the dev picture for a performance problem. Each item is verified against one scenario in the Profiler; the result for the FAQ tab is additionally confirmed by the absence of `?_rsc=` requests in Network.
- **Out of scope:** `React.memo` on `Header`/`WishBoard`/`HomePage`, animations and mounting of Radix components, legitimate state resets by `usePathname` in `WishBoard:49`, `DonateDialog:56`, `AdminTable:88`, `useAsyncAction` (there are no artificial delays in `lib/`), moving the theme into a cookie, upgrading Next.js.

## Capabilities

### New Capabilities

None. The change alters the behavior of already described capabilities rather than introducing new ones.

### Modified Capabilities

- `performance`: requirements are added about the isolation of re-renders between data domains, about loading fonts only for the active theme, and about the lazy loading of heavy features outside the critical path; the requirement about fonts is refined so that the preload of inactive families counts as a violation.
- `support-chat`: the requirement "Transition to the correspondence tab from the header" is refined — switching the tab and navigating from the header must not cause a server request for the route, while the active tab must correspond to the address for a direct link and for a transition from an already open page.

## Impact

**Code:**

- `app/(app)/faq/page.tsx` — tab state instead of `router.replace`, synchronization with `useSearchParams`
- `lib/data-context.tsx` — three contexts and three hooks instead of `DataContext`/`useData`
- `lib/data-store.ts` — essentially unchanged; `DataStore` remains an exported type
- `components/layout/Header.tsx`, `components/features/ChatThread.tsx` — transition to `useChats()`
- `components/features/WishBoard.tsx` — transition to `useWishes()`
- `components/features/DonateDialog.tsx` — `useDonations()` + `useWishes()`
- `components/features/AdminTable.tsx` — transition to `useDonations()`
- `lib/auth-context.tsx`, `lib/theme-context.tsx` — `useMemo` on `value`
- `app/layout.tsx` — `preload: false` for the four non-default font families
- `app/(app)/page.tsx` — lazy `DonateDialog` with a gate on the first open (conditional, step 5)

**Tests:**

- `components/features/DonateDialog.test.tsx` — the `@/lib/data-context` mock is obliged to provide `useWishes` and `useDonations` instead of `useData`
- `components/features/AdminTable.test.tsx` — does not mock `data-context`, works through `DataProvider`; requires no edits and is used as a check that the provider name is preserved

**Dependencies and configuration:** there are no new dependencies, `package.json` does not change, and data persistence and public URLs remain the same.
