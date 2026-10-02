## 1. Wish display rule

- [x] 1.1 Remove the fallback to the nearest past date in `lib/birthdays.ts:31` (`getBoardDate` selects only employees whose birthday is on the current date, the unused `BoardDate.date` field is removed) and switch `components/features/WishBoard.tsx:53` to the resulting list of birthday people; check that `npm run typecheck` passes without errors
- [x] 1.2 Rewrite the empty-state texts of `components/features/WishBoard.tsx:352-361`: when there are no birthday people — an explanation that wishes are available on the birthday; when there are birthday people but no wishes — an invitation to leave the first one; check manually on the current date without birthday people that the board stays in place and does not show cards for a past date
- [x] 1.3 Add a unit test for the display rule (the date is passed as an argument, without dependence on the launch date): a wish for today's birthday person is displayed, a wish for a past date is not; check that `npm test` passes and that the test fails if the fallback is restored

## 2. The board uses the available width

- [x] 2.1 Let the strip card stretch from the current minimum (280px, 320px from `sm`) to the readable maximum and center the strip when it does not fill the row (`components/features/WishBoard.tsx:329-351`); check at 1440px with one wish that the card is stretched and the free space is distributed at the edges
- [x] 2.2 Check that with flexible widths the static strip, manual scrolling, snap, and the scrolling hint are preserved: the overflow detector `components/features/WishBoard.tsx:96-101` does not show the hint with 1–4 wishes and does show it with 6+, and the left cards remain reachable when scrolling at 320/360/1024/1440px

## 3. Footer caption

- [x] 3.1 Make the footer caption a centered column by default and return one line from `sm` (`components/layout/Footer.tsx:8-12`); check at 320px that the description line does not begin with a dash and the icon is not vertically desynchronized, and at 640px and above the caption is again on one line

## 4. Upcoming birthdays

- [x] 4.1 Change the grid layout to `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (`app/(app)/page.tsx:154`); check at 320/360/414px that the cards go one below another and the names are not truncated, and at 640/1024/1440px the layout remains as before

## 5. Checking the change

- [x] 5.1 Run `npm run lint`, `npm run typecheck`, and `npm test` — all three commands finish without errors
- [x] 5.2 Manual check at 320/360/414/640/1024/1440px with 1, 2, 4, and 6 wishes, on a day with birthday people and on a day without them, including the administrator's date preview: no horizontal page scroll, the names in the upcoming birthdays block are not truncated, the strip does not duplicate cards
