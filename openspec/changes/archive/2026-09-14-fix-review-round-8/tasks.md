## 1. Administrator reply field

- [x] 1.1 In `components/features/ChatThread.tsx`, give the chat card a definite height on desktop (`md:h-[600px]` instead of `max-h-[600px]`) and add `min-h-0` to the inner row and columns; check — `npm run typecheck` passes, and the reply field is visible with 11 employees at a width ≥768px
- [x] 1.2 Ensure that the request list scrolls within its own area independently of the message block, and that the "Reply to employee..." field stays at the bottom; check — on desktop the list scrolls, the field is not clipped; on the mobile layout (`max-h-44`) the behavior does not change

## 2. Consistent current date

- [x] 2.1 In `lib/date-context.tsx`, initialize `realToday` with a stable value, the same for the server and client, and set the real date in `useEffect` after mounting; check — `npm run build` and `npm run typecheck` pass, there is no date text mismatch in the console during loading and no switch of the entire tree to client-side rendering
- [x] 2.2 Check that date-dependent blocks (birthday people, wish board, calendar) show the same current date immediately after loading; check — a manual run of the home page and the calendar without the date "flashing"

## 3. Consistent theme

- [x] 3.1 In `lib/theme-context.tsx`, initialize the theme with the default value (matching SSR) and restore the real theme from `data-theme` in `useEffect`; check — `npm run typecheck` passes, and the theme label in `ThemeSwitcher` matches the applied theme
- [x] 3.2 Check theme restoration with a saved `festival` value and without a saved value; check — with `localStorage='festival'`, the label and `data-theme` are both `festival`; when there is no value, the default theme is applied with a correct label

## 4. Congratulations strip without looping

- [x] 4.1 Reproduce the looping risk: change the number of cards so that the strip transitions between the static state and auto-scroll; check — whether `Maximum update depth exceeded` was recorded in the console
- [x] 4.2 In `components/features/WishBoard.tsx`, stabilize overflow measurement: functional update with an explicit comparison, batching via `requestAnimationFrame`, observing only the container; check — transitions between states do not produce an update depth exceeded error, and the application remains responsive

## 5. Modal dialogs during navigation

- [x] 5.1 In `components/features/DonateDialog.tsx`, close the dialog on route change (`usePathname`); check — navigating with an open participation dialog leaves the page scrollable without a reload
- [x] 5.2 Extend closing on route change to the "Change amount" dialog in `components/features/AdminTable.tsx` and the "Change wish" dialog in `components/features/WishBoard.tsx`; check — after navigating with any open dialog, the page is interactive
- [x] 5.3 Ensure that after navigation, `<body>` does not retain `pointer-events: none` and `data-scroll-locked`; check — `document.body` is clean after navigation, scrolling and clicks work

## 6. Verification and finalization

- [x] 6.1 Run `npm run typecheck`, `npm run lint`, and `npm run build` without errors
- [x] 6.2 Run `openspec validate fix-review-round-8 --strict` and ensure there are no errors
