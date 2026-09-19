## Context

Motivation is in `proposal.md`; the requirements for observable behavior are in the deltas `specs/performance/spec.md` and `specs/support-chat/spec.md`.

Current state of the code:

- `lib/data-store.ts:124-139` — `useDataStore()` returns an object literal on every render. Individual fields inside the store are stable between renders, because they are `useState` values and `useCallback` (`addWish`, `addDonation`, `addChatMessage`, `markThreadRead` depend on nothing; `setGiftSent`, `getAllThreads`, `getChatThread` depend on `history`/`chats`). This is exactly the anchor point for memoization.
- `lib/data-context.tsx:10` — the value is provided without memoization, `useData()` returns the entire store. All consumers are six places: `Header.tsx:30`, `faq/page.tsx:54`, `ChatThread.tsx:21`, `WishBoard.tsx:42`, `DonateDialog.tsx:48`, `AdminTable.tsx:79`.
- `app/(app)/faq/page.tsx:59` derives the tab from `useSearchParams`, `:64-73` calls `router.replace` on every click.
- `app/layout.tsx:10-46` — five `next/font/google` families without the `preload` option; `globals.css:34-105` distributes them across three themes (`warm` → `nunito`, `festival` → `bricolage`+`manrope`, `premium` → `fraunces`+`inter`). The theme is applied by an inline script (`app/layout.tsx:48`) from `localStorage`, that is, it is unknown on the server.
- `lib/date-context.tsx:35-44` — an already existing example of `value` memoization.
- Next.js 13.5 (App Router), React 18; both pages affected by lazy loading are declared as `'use client'` (`app/(app)/page.tsx:1`, `app/(app)/admin/page.tsx:1`).

Constraints: `npm run build && npm run start` is the only source of performance conclusions; dev mode (StrictMode, route compilation on the first navigation) is not used for estimates.

## Goals / Non-Goals

**Goals:**

1. Remove the server request and the empty fallback from a click on the FAQ tab, while preserving the deep-link and header-navigation behavior.
2. Make it so that a change in one data domain does not re-render subscribers of other domains.
3. Remove the preload of fonts for inactive themes.
4. Load the heavy participation dialog outside the critical path — only if steps 1-3 have not brought the first load back within budget.
5. Provide a reproducible way to confirm each step with measurements.

**Non-Goals:**

- `React.memo` on `Header`/`WishBoard`/`HomePage`: this masks the cause rather than eliminating it, and conflicts with the data-isolation requirement.
- Moving the theme into a cookie (described as a rejected alternative in decision 4).
- Splitting `AdminTable`: the `/admin` route is already a separate chunk.
- Animations, mounting of Radix components, legitimate resets by `usePathname` (`WishBoard:49`, `DonateDialog:56`, `AdminTable:88`), `useAsyncAction`.
- Upgrading Next.js, a real backend, data persistence.

## Decisions

### 1. FAQ tab: state as the source of truth for rendering, the address — for deep-linking

```tsx
const urlTab = searchParams.get('tab') === 'messages' ? 'chat' : 'faq';
const [tab, setTab] = useState(urlTab);
useEffect(() => { setTab(urlTab); }, [urlTab]);

const handleTabChange = (value: string) => {
  setTab(value);
  const params = new URLSearchParams(window.location.search);
  if (value === 'chat') params.set('tab', 'messages'); else params.delete('tab');
  const query = params.toString();
  window.history.replaceState(
    null, '',
    query ? `${window.location.pathname}?${query}` : window.location.pathname
  );
};
```

Why this way:

- Initialization with state + effect synchronization, and not just initialization. The transition `/faq` → `/faq?tab=messages` is a change of `searchParams` within a single route, and the page is not remounted and the state is preserved. Without the effect, the scenario "Transition from an already open section page" from `specs/support-chat/spec.md` would stop working. The effect is idempotent: if `useSearchParams` updates following `replaceState`, `setTab` will receive the same value and React will collapse the extra render.
- The URL is assembled from `window.location` at the moment of the click, and not from `searchParams`. Reason: if the native `replaceState` does not update the router state (see the open question), `searchParams.toString()` will turn out to be stale and will start dropping or duplicating parameters. `window.location` reflects what is actually written in the address bar.
- `usePathname` is no longer needed in the component, `Suspense` (`faq/page.tsx:144`) remains: it is required by `next build` for `useSearchParams` and is not the source of the fallback on a click after abandoning `router.replace`.

Alternatives:

- **`useState` only, without the effect** — simpler, but violates the existing support-chat scenario. Rejected.
- **Keep deriving the tab from `searchParams` and replace only `router.replace` with the native `history.replaceState`** — a minimal edit and possibly sufficient, but it depends entirely on whether the Next 13.5 router notifies `useSearchParams` subscribers on a native call. If not, the tab will not switch at all. Rejected as not meaningfully verifiable without a spike; the chosen option works regardless of the outcome.
- **A separate route segment `/faq/messages`** — honest navigation, but that is already a server transition, that is, the exact opposite of the goal.

### 2. `DataContext`: three domains, memoization of values

```
DataProvider (the name is preserved)
  value: useMemo([wishes, addWish, updateWish])          -> WishesContext   -> useWishes()
  value: useMemo([donations, history, addDonation,
                  setGiftSent, updateDonation])           -> DonationsContext-> useDonations()
  value: useMemo([chats, addChatMessage, getChatThread,
                  getAllThreads, markThreadRead])         -> ChatsContext    -> useChats()
```

Distribution across consumers: `Header`, `faq/page`, `ChatThread` → `useChats()`; `WishBoard` → `useWishes()`; `DonateDialog` → `useDonations()` and `useWishes()`; `AdminTable` → `useDonations()`.

Why this way:

- The win comes from the identity of `value`, not from stopping the provider's render. After the split, `DataProvider` still re-renders on every mutation, because the whole store lives in a single hook. But `children` is a stable element coming from `app/layout.tsx`, so React does not descend into the subtree and touches only the consumers of the changed context. This is worth remembering when verifying by measurement: "the provider re-rendered" in the Profiler is expected and is not a failure.
- Three domains, and not per-component granularity: `DonateDialog` genuinely needs access to both wishes and contributions. Further splitting would require selectors and would not give a win at this data volume.
- `useData()` is removed. If the aggregate is kept, any new consumer will again subscribe to everything, and the isolation requirement will stop holding. The name `DataProvider` and the type `DataStore` (`lib/data-store.ts:141`) are preserved: `app/layout.tsx:8` and `lib/test-utils.tsx:5` depend on them.
- Memoization is by the store's fields, and not by the store object itself, so stable `useCallback` functions do not invalidate values unnecessarily. The only domain where a function is recreated together with the data is `setGiftSent` (it depends on `history`); this is intentional, since it reads `history` when called.

Alternatives:

- **A single context + `useSyncExternalStore` with selectors** — gives the same isolation without three providers, but requires a manual store and subscription, while the external API of the components does not change. The code is more complex, and there is no benefit at the mock data volume.
- **Keep `useData()` as a thin wrapper** — does not affect isolation, but preserves a lure for new subscribers. Rejected.
- **Move the state into feature providers next to the consumers** — architecturally stronger, but `DonateDialog` and `WishBoard` live in different branches of the tree, while the data is shared; this is already a rework, and not an optimization.

### 3. Memoization of values in the root providers

`lib/auth-context.tsx:47` and `lib/theme-context.tsx:36` are wrapped in `useMemo` by fields, following the pattern of `lib/date-context.tsx:35-44`. Here the choice has no alternatives: the value consists of a `useState` value and a stable `useCallback`, and any other solution is a repetition of the same code.

### 4. Fonts: `preload: false` for inactive themes

The default theme `warm` uses `nunito` (`globals.css:34-35`, `lib/theme.ts`), so `nunito` keeps `preload: true`, while `bricolage`, `manrope`, `fraunces`, `inter` get `preload: false`. `subsets` are not trimmed: without `cyrillic`, Russian text in the `festival` and `premium` themes will lose the main glyph set, and `bricolage`/`fraunces` in the project are already declared with `latin` only.

Why this works: `preload` controls only the `<link rel="preload" as="font">` reference, which forces the browser to download the file regardless of use. Without preload, the `@font-face` resource is requested lazily — at the moment when text actually applies this family, that is, when switching to the corresponding theme.

An alternative is to **move the theme into a cookie**: the server learns the theme when serving the HTML, sets `data-theme` on `<html>` itself (instead of the inline script `app/layout.tsx:48`), and preloads exactly the needed family. This removes the font swap for users with a saved non-default theme, but expands the change to `theme-context.tsx`, the inline script, and cookie writing, and also creates a risk of theme desynchronization before and after hydration. Rejected by default; the price of rejection is a brief font swap with a non-default theme, which is acceptable under the existing requirement "A font swap does not shift the layout".

### 5. Lazy `DonateDialog` with a gate on the first open

```tsx
const DonateDialog = dynamic(
  () => import('@/components/features/DonateDialog').then(m => m.DonateDialog),
  { ssr: false, loading: () => <div className="h-0" /> }
);
// ...
const [donateMounted, setDonateMounted] = useState(false);
const handleDonate = (u?: User) => {
  setDonateMounted(true);
  setDonateTarget(u ?? null);
  setDonateOpen(true);
};
// ...
{donateMounted && <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} targetUser={donateTarget} />}
```

Why a gate, and not just `dynamic`: `next/dynamic` loads the chunk when the component mounts, and not on `open`. Without the gate, the chunk is still requested during the home page render, just outside the critical path — that is useful, but it is not "load on demand". The gate turns this into a load on the first click.

Why the mount is not removed: if `open && <DonateDialog/>` were rendered, closing the dialog would lead to unmounting and the loss of the closing animation, which is prohibited by the Non-Goals. The `donateMounted` flag is turned on once and is not reset.

`ssr: false` is acceptable, because `app/(app)/page.tsx:1` is a client component; in Next 13 Server Components such a combination is prohibited. The `h-0` placeholder is not visible while the dialog is closed and does not affect CLS.

`AdminTable` is not touched: `/admin` is a separate route, its code is already loaded only on navigation, and additional lazy loading inside the page would add a second request after the section chunk.

### 6. Order and measurement

Steps 1-4 are independent of each other, step 5 is conditional. Each step: measurement before, edit, `npm run lint`, `npm run typecheck`, `npm test`, then `npm run build && npm run start` and measurement after for one scenario ("tab click", "add a wish", "first load of the home page"). In the Profiler, look at Self time and "why did this render"; for step 1 there is a separate binary marker — the absence of `?_rsc=` requests in Network on a tab click.

## Risks / Trade-offs

- **The native `replaceState` in Next 13.5 may not update `useSearchParams`** → in this case the effect synchronization simply does not fire, the state is already correct, and the tab and the address match. The header and `Back` scenarios work through normal navigation, where `useSearchParams` is updated. This is verified by a spike before implementation; the edit does not depend on the outcome.
- **Splitting the context may not remove the `DataProvider` re-render** → expected behavior, see decision 2. Include only the subscribers in the measurement, and not the provider.
- **`DonateDialog` remains subscribed to two domains** → when sending a contribution with a wish, these are two updates in different microtasks (`await` between them) and two render waves. Not a regression, but visible in the Profiler; a reduction is possible only by abandoning the single confirmation step, which changes the UX.
- **`preload: false` gives a font swap for a saved non-default theme** → a deliberate trade-off; the requirement of a non-shifting layout is preserved thanks to `display: 'swap'`.
- **The lazy dialog adds a delay on the first click** → a placeholder without a layout shift; if the measurement shows the delay is noticeable on INP, the step is rolled back together with the gate, and the neighboring steps are unaffected.
- **Removing `useData()` breaks the mock in the test** → `components/features/DonateDialog.test.tsx:52-69` is obliged to receive `useWishes` and `useDonations`; `AdminTable.test.tsx` has no data context mocks and serves as a check that `DataProvider` is preserved.

## Migration Plan

1. Step 1 (FAQ tab) as a separate commit: edit + running the checks + measuring "tab click" and Network.
2. Step 2 (context splitting) as a separate commit: `lib/data-context.tsx`, migration of the six consumers, editing the test mock, running `npm test`.
3. Step 3 (memoization of `auth`/`theme`) and step 4 (fonts) — one commit each, measurement after the fonts.
4. Step 5 is started only if, after steps 1-4, the first load of the home page is still outside the budget.
5. Rollback — by reverting the corresponding commit: the steps are not connected by shared edits, except for step 2, which touches `data-context` and its consumers as a whole.

## Open Questions

- Whether `useSearchParams` is updated on a native `window.history.replaceState` in Next 13.5. This is verified by a spike before implementing step 1; the chosen approach does not depend on the answer.
- Whether the effect synchronization is enough for the browser's "back/forward" buttons to show a consistent state after switching the tab: `replaceState` does not create a history entry, so back returns to the previous page, and not to the previous tab. The behavior coincides with the current `router.replace`.
