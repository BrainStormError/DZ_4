## Why

The sixth round of QA review revealed a set of copy and UX defects in the money congratulation scenario and the administrator log, the absence of per-thread indication of unread messages for the administrator, a misleading refund example in the log, a visual calendar defect during fast month switching, and the absence of fixed performance budgets (LCP/INP/CLS) against which the application must be checked.

## What Changes

- **Money congratulation dialog — extra control.** The "Without a wish" button at the congratulation text step is removed: an empty field and the "Continue" button already cover sending funds without text.
- **Money congratulation dialog — extra text.** The block explaining the hiding of the final amount at the confirmation step is removed entirely (along with the icon), including the wording "No wish is created". At the confirmation step, only the sending data entered by the user remains.
- **Recipient selection shows the email.** In the recipient selection form of the money congratulation, the recipient's corporate email is displayed next to the name and department, so that an employee with the same name cannot be selected by mistake.
- **Congratulation cards without time.** The wish card on the board shows only the creation date; the time is not displayed. The creation time is still stored in the data.
- **Unread messages by thread.** The administrator's unread indication is counted by individual messages rather than by the number of threads: each thread in the request list gets a marker with the number of unread messages, and the total badge on the "Messages" tab and in the header shows the total number of unread. The mark is cleared when the thread is opened.
- **A refund on decline zeroes the amount.** The example in the change log is fixed: for the reason "Refund (gift declined)", the new amount equals `0`. In the amount-change form, selecting this reason forcibly sets `0`; an emergency refund allows a partial amount.
- **Explicit log navigation.** Switching between the collection table and the change log in the admin panel is moved to tabs (`Collection table` / `Change log`) instead of the non-obvious toggle button, a repeated press of which returned to the table.
- **Performance budgets.** Target metrics are fixed: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, along with the method of checking them; the identified causes of LCP/CLS degradation are eliminated (blocking font import, absence of server-side content due to blocking the tree before hydration).
- **Stable calendar highlighting.** During fast switching of the month/year, the highlighting of dates in the birthday calendar no longer bleeds from the old state into the new one.

## Capabilities

### New Capabilities

- `performance`: target Core Web Vitals budgets (LCP, INP, CLS) and a requirement to check the metrics on key pages.

### Modified Capabilities

- `donations`: removal of the explanation about hiding at the confirmation step; display of the recipient's email in the recipient selection; forcible zeroing of the amount for the reason "Refund (gift declined)".
- `wishes`: the congratulation card does not display the creation time.
- `support-chat`: unread is counted by messages with a per-thread marker in the request list.
- `admin-panel`: the change log — a correct refund example with zeroing and explicit switching by tabs.
- `birthdays`: the highlighting of dates in the calendar is stable when switching the month and year.

## Impact

- Components: `components/features/DonateDialog.tsx`, `components/features/WishBoard.tsx`, `components/features/ChatThread.tsx`, `components/features/AdminTable.tsx`, `components/layout/Header.tsx`, `app/(app)/faq/page.tsx`, `app/(app)/calendar/page.tsx`.
- Data and helpers: `lib/mock-data.ts` (the refund example and the amount of `u3`), `lib/data-store.ts` (counting unread by messages), `lib/types.ts`, `lib/data-context.tsx`.
- Performance: `app/globals.css` (Google Fonts `@import`), `app/layout.tsx`, `lib/theme-context.tsx`, `lib/auth-context.tsx` (server-side output instead of `null` before hydration), migration to `next/font`.
- Styles: `app/globals.css`.
- Behavior: the changes are noticeable to the employee (congratulation dialog, wish cards, calendar) and to the administrator (request list, change log).
