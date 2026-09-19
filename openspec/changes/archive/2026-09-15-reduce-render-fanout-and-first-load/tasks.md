## 1. Baseline

- [x] 1.1 Record baseline measurements on `npm run build && npm run start`: the "tab click" and "add a wish" scenarios in the Profiler (Self time, "why did this render"), the number of font requests, and the number of `?_rsc=` requests in Network on the first load of the home page — verification: the recorded values before the edits are saved for comparison
- [x] 1.2 Spike: check whether the `useSearchParams` value updates after a native `window.history.replaceState` in Next 13.5 — verification: the answer is recorded; regardless of the outcome, the scheme from `design.md` (decision 1) is used without changing the plan

## 2. FAQ tab without navigation

- [x] 2.1 Convert the tab to state: `useState` with an initial value from `searchParams`, effect synchronization with `urlTab` — verification: `npm run build` passes, the page does not require abandoning `Suspense`
- [x] 2.2 Replace `router.replace` with `setTab` + `window.history.replaceState` with the URL assembled from `window.location`; remove `useRouter` and `usePathname` from the imports and the component body — verification: `npm run lint` and `npm run typecheck` pass without warnings about unused imports
- [x] 2.3 Check the scenarios on `npm run start`: a tab click, navigation by the indicator from the header with the FAQ page already open (`Header.tsx:111`), the direct link `/faq?tab=messages`, reloading on the active tab — verification: the tab corresponds to the address in all cases, `?_rsc=` is absent in Network on a tab click, and the empty content placeholder does not appear

## 3. Splitting DataContext by domains

- [x] 3.1 Create in `lib/data-context.tsx` three contexts and three memoized values (`Wishes`, `Donations`, `Chats`) per `design.md`, decision 2 — verification: `npm run typecheck` passes, the `DataStore` type and the `DataProvider` name are preserved
- [x] 3.2 Add the hooks `useWishes()`, `useDonations()`, `useChats()` and remove `useData()` — verification: `grep -rn "useData()" --include=*.tsx --include=*.ts` finds no calls outside the definition
- [x] 3.3 Convert `Header.tsx:30` and `app/(app)/faq/page.tsx:54` and `ChatThread.tsx:21` to `useChats()` — verification: the header, the FAQ page, and the correspondence strip display unread counts and messages on `npm run start`
- [x] 3.4 Convert `WishBoard.tsx:42` to `useWishes()` — verification: adding and editing a wish work on `npm run start`
- [x] 3.5 Convert `DonateDialog.tsx:48` to `useDonations()` and `useWishes()` — verification: the confirmation step sends the contribution and creates a wish, `declinedUserIds` takes the history into account
- [x] 3.6 Convert `AdminTable.tsx:79` to `useDonations()` — verification: the table, the log, and the gift status toggling work on `npm run start`
- [x] 3.7 Update the `@/lib/data-context` mock in `components/features/DonateDialog.test.tsx:52-69`: replace `useData` with `useWishes` and `useDonations` — verification: `npm test` passes, both `DonateDialog` tests are green
- [x] 3.8 Check the isolation of re-renders on `npm run start`: add a wish and make sure `Header` and `ChatThread` do not re-render; send a contribution and make sure `WishBoard` does not re-render — verification: the Profiler shows no re-renders of these components

## 4. Memoization of root provider values

- [x] 4.1 Wrap `value` in `useMemo` in `lib/auth-context.tsx:47` — verification: `npm run typecheck` passes, login and logout work on `npm run start`
- [x] 4.2 Wrap `value` in `useMemo` in `lib/theme-context.tsx:36` — verification: switching all three themes and saving the choice work on `npm run start`

## 5. Fonts of the active theme

- [x] 5.1 Set `preload: false` for `Bricolage_Grotesque`, `Manrope`, `Fraunces`, `Inter` in `app/layout.tsx:16-38`, leaving `preload: true` for `Nunito`; do not change `subsets` — verification: `npm run build` passes, the built HTML has 0 `rel="preload" as="font"` references
- [x] 5.2 Check the first load on `npm run start`: the number of font requests with the `warm` theme and with the saved `premium` theme — verification: with `warm`, only `nunito` files are requested (latin+cyrillic), with `festival` only `bricolage` (latin) and `manrope` (latin+cyrillic), with `premium` only `fraunces` (latin) and `inter` (latin+cyrillic); loading of only the active theme is confirmed by the composition of `document.fonts` (loaded contains exclusively the families of the active theme), and the comparison with the baseline measurement from 1.1 (8 files of all families) favors the new one. The measurement is performed in a separate document for each theme: switching the theme within one page additionally loads foreign fonts and produced false 8 requests

## 6. Lazy participation dialog (conditional step)

- [x] 6.1 Compare the first-load measurement of the home page after steps 2-5 with the LCP budget — verification: the home page LCP is 88–148 ms against a budget of 2.5 s (CLS 0.0081–0.0082 against a budget of 0.1); the first load is within budget, so group 6 is skipped entirely
- [x] 6.2 Connect `DonateDialog` via `next/dynamic` with `ssr: false` and mount it only after the first opening (`donateMounted`, without unmounting) — skipped: per decision 6.1 the first load fits within the LCP budget, so the conditional step is not performed
- [x] 6.3 Check the first click on "Congratulate / send funds" on `npm run start` — skipped: per decision 6.1 the first load fits within the LCP budget, so the conditional step is not performed

## 7. Final verification

- [x] 7.1 Run `npm run lint`, `npm run typecheck`, `npm test` — verification: 0 errors, 7/7 tests pass
- [x] 7.2 Run `npm run build` — verification: a successful build without warnings about `useSearchParams` and `ssr: false`
- [x] 7.3 Compare the before/after measurements for the scenarios from 1.1 on `npm run start` — verification: a tab click goes from 1 → 0 `?_rsc=` requests without an empty placeholder; the isolation of re-renders is confirmed by counters (a contribution does not render `Header`/`WishBoard`, a wish does not render `Header`); the first load requests fonts only for the active theme; LCP and CLS are within budget — all affected requirements of `openspec/specs/performance/spec.md` and `openspec/specs/support-chat/spec.md` are confirmed by observation
- [x] 7.4 Check that the prohibited items were not touched: `React.memo` on `Header`/`WishBoard`/`HomePage` was not added, the resets by `usePathname` in `WishBoard:49`, `DonateDialog:56`, `AdminTable:88` are preserved, `useAsyncAction` is unchanged — verification: `React.memo` is absent, `usePathname` is present in `WishBoard.tsx:49`, `DonateDialog.tsx:57`, `AdminTable.tsx:88`, and `lib/hooks/useAsyncAction.ts` was not modified
- [x] 7.5 Run `cmd /c "openspec validate reduce-render-fanout-and-first-load"` — verification: the change is valid before archiving
