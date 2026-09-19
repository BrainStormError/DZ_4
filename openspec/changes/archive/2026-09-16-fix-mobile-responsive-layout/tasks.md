## 1. Common overlay primitives and root protection

- [x] 1.1 Update `components/ui/dialog.tsx` (`DialogContent`): `w-[calc(100%-1.5rem)]`, `max-h-[90dvh]`, `overflow-y-auto`, `overscroll-contain` in the base class. Check: open the participation/amount-change/wish-change dialogs at 320×568 — the dialog has side margins, does not go outside the viewport, scrolls when there is not enough height, and the buttons are reachable
- [x] 1.2 Update `components/ui/popover.tsx` and `components/ui/select.tsx`: `collisionPadding={8}`, `SelectContent` gets `max-w-[calc(100vw-2rem)]`, `SelectItem`/`ItemText` get `min-w-0` and `truncate`. Check: at 320px open the date-picker popover and the recipient select — the lists are inside the viewport, long labels are truncated with an ellipsis, the full value is available via `title`
- [x] 1.3 Add protection against horizontal overflow to `body` in `app/globals.css`. Check: at 320px and 360px the width of `document.documentElement.scrollWidth` does not exceed the viewport width and there is no horizontal page scrolling
- [x] 1.4 Add a custom `hoverable` variant to `tailwind.config.ts` via `addVariant('hoverable', '@media (hover: hover)')`. Check: `npm run typecheck` completes without errors, and the built CSS contains a rule for `hoverable:hover:scale-[1.02]`

## 2. Home page

- [x] 2.1 In `app/(app)/page.tsx` replace the hero button container with `flex-col sm:flex-row`, add `w-full sm:w-auto`, `whitespace-normal`, `h-auto min-h-11 py-2.5 px-5 sm:px-8` to the buttons. Check: at 320px and 360px both buttons are fully visible inside the hero, the text is not clipped, and at `sm+` the layout remains a row
- [x] 2.2 Add `scroll-mt-20` to the `#wish-board` section in `app/(app)/page.tsx`. Check: activating "Leave a wish" brings the board heading into view, not hidden under the sticky header
- [x] 2.3 Replace the grid of the "Birthday soon" block with `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` in `app/(app)/page.tsx`. Check: at 640px the names in the cards are displayed in full without clipping
- [x] 2.4 In `components/features/BirthdayCard.tsx` replace `hover:scale-[1.02]` with `hoverable:hover:scale-[1.02]`. Check: on a touch emulator, touching the card does not leave the scale applied; on desktop, hovering enlarges the card

## 3. Calendar

- [x] 3.1 In `app/(app)/calendar/page.tsx` set `flex-wrap items-center justify-center gap-2` on the navigation group, `size="sm"` and `h-8 w-8 shrink-0` on the arrows, remove `min-w-[160px]` from `h2` and set `text-lg sm:text-xl whitespace-nowrap`. Check: at 320px the page's `scrollWidth` equals the viewport width, all buttons and the heading are visible
- [x] 3.2 In `app/(app)/calendar/page.tsx`, below `sm`, render a compact birthday marker in the cell with the full list of birthday people in the `title` instead of a truncated name; keep the names at `sm+`. Check: at 320px a cell with a birthday person shows a distinguishable marker and does not display a name clipped to a single letter, the full list is available from the `title`

## 4. Dynamic viewport height

- [x] 4.1 Replace `min-h-screen` with `min-h-[100dvh]` in `app/(app)/layout.tsx`. Check: on mobile, when the address bar is shown/hidden, the height does not jump and the content is not clipped
- [x] 4.2 Replace `min-h-screen` with `min-h-[100dvh]` in `app/(auth)/login/page.tsx`. Check: the login screen remains vertically centered without a height jump

## 5. Chat

- [x] 5.1 In `components/features/ChatThread.tsx` set `h-[70dvh] md:h-[600px]` on the card root and add `min-h-0` to `CardContent`, preserving `min-h-0` in the inner flex chain. Check: with a long conversation the card keeps its height, the history scrolls inside, the submit form remains inside the card and is reachable

## 6. Admin table

- [x] 6.1 In `components/features/AdminTable.tsx` remove the outer `div.overflow-x-auto` around `Table`, set `px-2 sm:px-4` on the cells, hide the "Department" and "Birthday date" columns via `hidden md:table-cell`, the e-mail in the employee cell via `hidden sm:block`, the labels of the "Gift"/"Edit" buttons via `hidden sm:inline` with an added `aria-label`. Check: at 640px and 320px the page does not get horizontal scrolling, the "Action" column is visible, and the table scrolling happens in a single container
- [x] 6.2 Run `npx vitest run components/features/AdminTable.test.tsx`. Check: the table and edit-gating tests pass without changes to the test file

## 7. Mobile navigation

- [x] 7.1 In `components/layout/Header.tsx` set `min-h-[44px] py-2.5` on the mobile navigation links, `snap-x snap-mandatory` on the container, `snap-start` on the items. Check: the tap area height of each item is at least 44px, and on overflow the scrolling snaps to the items
- [x] 7.2 Add a visual hint about horizontal scrolling of the mobile navigation (a gradient mask with `pointer-events-none`) shown only on overflow. Check: at 320px the administrator sees a sign of continuation and reaches the "FAQ" and "Admin" items; when the items fit, the hint is absent

## 8. Wish strip

- [x] 8.1 In `components/features/WishBoard.tsx` set `snap-x snap-mandatory` on the strip container, `snap-start` on the cards, preserving `overflow-x-auto` and manual scrolling without auto-scroll. Check: during horizontal scrolling the cards snap to the step and do not remain clipped at the edge, and the strip is keyboard accessible
- [x] 8.2 Add a visual hint about horizontal scrolling of the strip, visible only on overflow. Check: when the cards do not fit, the hint is visible; when they fit, it is absent

## 9. Final check

- [x] 9.1 Run `npm run lint`, `npm run typecheck`, and `npm test`. Check: all commands complete without errors
- [x] 9.2 Perform a manual check at 320px, 360px, and 640px: home page, calendar, admin table, chat, participation and amount-change dialogs, mobile menu, wish strip. Check: there is no horizontal page scrolling, the content and controls are fully visible and reachable, and the loading/error states are unchanged
