## 1. Money congratulation dialog

- [x] 1.1 In `components/features/DonateDialog.tsx`, remove the "Without a wish" button at the `message` step, keeping "Back" and "Continue"; verify that with an empty field "Continue" leads to confirmation
- [x] 1.2 In `components/features/DonateDialog.tsx`, remove the block with the `Lock` icon and the text about hiding the amount at the `confirm` step and remove the unused `Lock` import; verify that the confirmation step shows only the sender, recipient, amount, and wish text
- [x] 1.3 In `components/features/DonateDialog.tsx`, show the recipient's corporate email in the `Select` options of the recipient selection; verify that the name, department, and email are visible for each option

## 2. Wish cards

- [x] 2.1 In `components/features/WishBoard.tsx`, in `renderCard` output the creation date without time (`d MMM` instead of `d MMM, HH:mm`); verify that there is no time on the card, while `createdAt` is still stored

## 3. Administrator unread messages

- [x] 3.1 In `lib/data-store.ts`, replace counting by threads with counting by messages: add `countUnreadMessages(threads)` and `countUnreadInThread(thread)`, keeping `markThreadRead`; verify with `npm run typecheck`
- [x] 3.2 Update `components/layout/Header.tsx` and `app/(app)/faq/page.tsx` to `countUnreadMessages`; verify that the badge in the header and on the "Messages" tab shows the total number of unread messages
- [x] 3.3 In `components/features/ChatThread.tsx`, add to the thread list a marker with the number of unread (`countUnreadInThread`) and a visual highlight; verify that the marker disappears after opening the thread and the total counter decreases by its contribution

## 4. A refund on decline zeroes the amount

- [x] 4.1 In `components/features/AdminTable.tsx`, when selecting the reason `refund_declined`, forcibly set `editAmount = '0'` and disable the field; `canSave` requires `0` for this reason; verify that saving a decline records `0 ₽`
- [x] 4.2 In `lib/mock-data.ts`, fix `mockDonationHistory[0]` to `previousAmount: 15600, newAmount: 0` and the amount of `u3` in `mockDonations` to `0`; verify that the table shows `0 ₽`, and the log shows the change `15600 → 0 ₽`

## 5. Explicit log navigation

- [x] 5.1 In `components/features/AdminTable.tsx`, replace the boolean `showHistory` with `Tabs` tabs with values `table` and `history` and labels "Collection table" / "Change log"; verify switching in both directions without pressing the same button again
- [x] 5.2 Verify that the date preview block remains outside the tabs, and that the tabs and the log are unavailable to the employee

## 6. Birthday calendar

- [x] 6.1 In `app/(app)/calendar/page.tsx`, attach `key={`${year}-${month}`}` to the grid container; verify that with fast switching of the month and year the date highlighting does not bleed from the previous period

## 7. Performance (Core Web Vitals)

- [x] 7.1 Replace the Google Fonts `@import` in `app/globals.css` with `next/font/google` in `app/layout.tsx`, connecting the used families as CSS variables and binding `--font-heading`/`--font-body` per theme; verify that the CSS has no external blocking `@import`, and that all three themes are displayed with the correct font
- [x] 7.2 Remove the `null` return from `lib/theme-context.tsx` and `lib/auth-context.tsx`, add an early inline script for setting `data-theme` and initialize the state from the DOM attribute; verify that the server HTML of the pages contains the main content (view the page source before JS)
- [x] 7.3 Build and run production (`npm run build && npm start`), measure Lighthouse (mobile) for `/`, `/calendar`, `/faq`, `/admin`, and record LCP and CLS; verify the values against the budgets of 2.5 s and 0.1
- [x] 7.4 Measure INP by interaction tracing (opening and sending the participation dialog, switching tabs and months) and record the value; verify that it does not exceed 200 ms
- [x] 7.5 If the metrics exceed the budget, eliminate the specific cause and re-measure; the completion criterion is LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on all checked pages

## 8. Verification and finalization

- [x] 8.1 Run `npm run typecheck` and `npm run lint` without errors
- [x] 8.2 Run the manual scenarios: sending money without text; absence of an explanation about hiding at confirmation; email in the recipient selection; card without time; unread markers by thread and counting by messages; decline zeroes the amount; switching the log tabs; fast switching of the calendar month
- [x] 8.3 Run `openspec validate "fix-review-round-6" --strict` and make sure there are no errors
