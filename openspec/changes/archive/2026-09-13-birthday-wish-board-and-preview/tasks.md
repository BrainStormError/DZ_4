## 1. Shared date source

- [x] 1.1 Add `lib/birthdays.ts` with `parseIsoLocal(iso)` (parsing `yyyy-mm-dd` into a local date via `new Date(y, m-1, d)`) and `getBoardDate(today, users)`, which returns the selected date and the list of employees; verify that the date `1990-09-13` does not shift in a negative offset

- [x] 1.2 Add `lib/date-context.tsx` with `DateProvider` and `useAppDate()`, exposing `{ today, isPreview, previewDate, setPreviewDate, resetDate }`; wrap `app/layout.tsx` with the provider; verify that `npm run typecheck` passes

- [x] 1.3 Migrate `app/(app)/page.tsx` and `app/(app)/calendar/page.tsx` to `useAppDate()` instead of a direct `new Date()`; verify that the "Birthday people today" block, "Birthday soon" and the current-day marker in the calendar use the same date

## 2. Showing congratulations by birthday

- [x] 2.1 In `components/features/WishBoard.tsx`, replace rendering all wishes with filtering via `getBoardDate`: today — only wishes for the day's birthday people, otherwise — the nearest past date (all born on that day), and if there are no wishes — an empty state without falling through to earlier dates; future dates are excluded. Verify against the mock data: with the date 2026-09-13, `w1`, `w2` (Anna Smirnova) are visible and `w3` for Dmitry is hidden

- [x] 2.2 In the board card, render `From: <Last name First name> (<nick>)` and `To: <Last name First name>` with an explicit direction; in the form, add the heading "Whom we congratulate" and show the current user as the sender; verify that the full email address is not displayed anywhere

- [x] 2.3 Update the hero block text in `app/(app)/page.tsx` to "We collect funds for gifts to colleagues for their birthdays. Any employee can join — participation is voluntary." and make sure the sentence is displayed exactly once in the page content

## 3. Looping strip

- [x] 3.1 Replace the congratulations grid in `WishBoard` with a single looping strip with smooth automatic scrolling (CSS marquee, a duplicated track with `aria-hidden`); verify that with several birthday people there is one strip and it scrolls in a loop

- [x] 3.2 Assign each birthday person a color from a fixed palette (deterministically, cycling when the palette is exceeded) via an inline CSS variable and highlight the cards; verify that cards of different birthday people are visually distinct

- [x] 3.3 Implement pausing of auto-scroll on hover/focus and disabling under `prefers-reduced-motion` while preserving manual scrolling; verify the behavior with `prefers-reduced-motion` enabled

## 4. Monetary congratulation without a wish

- [x] 4.1 In `components/features/DonateDialog.tsx`, make the "Congratulation" step optional (skip/empty text), create a wish via `addWish` only when the text is non-empty; verify that sending without text adds the amount and does not create a wish

- [x] 4.2 Separate the confirmation step and result screen texts for the scenarios with and without a wish; verify that the result without a wish reports that the amount was added and does not claim that a congratulation was sent

- [x] 4.3 Make sure a monetary congratulation can be sent in advance, and the created wish does not appear on the board until the recipient's birthday; verify on a date before the recipient's birthday

## 5. Administrator date preview

- [x] 5.1 Add a date picker control for the administrator (a popover with `react-day-picker`) in `components/features/AdminTable.tsx`; verify that the control is not displayed for the `employee` role

- [x] 5.2 Add an indicator of the active preview with the selected date and a reset action, as well as resetting the mode on reload; verify that reset returns the real date

- [x] 5.3 Block writes in preview mode in `WishBoard`, `DonateDialog` and `AdminTable` (buttons are disabled, handlers return early); verify that real data is not changed while the preview is active

- [x] 5.4 Make sure the preview consistently affects the birthday person blocks, the board and the day marker in the calendar; verify that when another date is selected, all three views show the state for that date

## 6. Verification and finalization

- [x] 6.1 Run `npm run typecheck` and `npm run lint` without errors

- [x] 6.2 Run the manual scenario: a birthday person today; no birthday people (the nearest past date); hiding future wishes; a birthday person who is an administrator; sending funds with and without a wish; date preview and write blocking

- [x] 6.3 Run `openspec validate "birthday-wish-board-and-preview"` and make sure there are no errors
