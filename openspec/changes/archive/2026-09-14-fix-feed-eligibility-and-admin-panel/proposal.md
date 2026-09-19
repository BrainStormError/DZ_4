## Why

QA found that the congratulations strip duplicates cards and does not scroll, and that the recipient selection rules allow "congratulating in advance" with a free wish and sending money to those whose birthday has already passed. Additionally, the admin panel does not allow seeing birthday dates and does not store a flag that the gift has been sent.

## What Changes

- **Congratulations strip**: one strip; with few cards — a static row without duplicates, with overflow — automatic looped scrolling. The duplicate copy of the track is no longer shown when scrolling is not active (few cards or `prefers-reduced-motion`).
- **Color equality**: the "Birthday people today" card uses the same personal color as the cards of the same employee in the strip.
- **Footer**: the statement "Participation is voluntary." is removed; the single source of the statement about voluntariness is the home page hero block.
- **FAQ**: the answer about the author is updated to "real name + nickname in parentheses" (`<Last name First name> (nick)`), without revealing the full address.
- **Free wish**: the recipient can be selected only among today's birthday people; if there are no birthday people today, the "Leave a wish" button is inactive. Congratulating in advance is possible only with money.
- **Money congratulation in advance**: the recipient list retains only employees whose birthday is today or has not yet come; employees with a past birthday are removed from the list.
- **Admin panel**: the table has been supplemented with the employee's birthday date and the gift status "Sent" / "Not sent", which the administrator sets manually. The status is visible only to the administrator.

## Capabilities

### New Capabilities

- `admin-panel`: the employee table in the admin panel with the birthday date and the gift sending status, manually edited by an administrator.

### Modified Capabilities

- `wishes`: the strip — static with few cards and scrolling only on overflow; a free wish is available only for today's birthday people, otherwise the control is unavailable.
- `donations`: eligible recipients of a money congratulation — today's and future birthdays; past ones are excluded from the selection.
- `birthdays`: the card of today's birthday person uses a personal color matching the color of its cards in the strip.
- `ui-consistency`: the footer does not contain a statement about voluntary participation; the single canonical source is the home page.
- `support-chat`: the FAQ answer about the wish author describes the display of "name + nickname" instead of the old "nickname only" rule.

## Impact

- Components: `components/features/WishBoard.tsx`, `components/features/BirthdayCard.tsx`, `components/features/DonateDialog.tsx`, `components/features/AdminTable.tsx`, `components/layout/Footer.tsx`, `app/(app)/page.tsx`, `app/(app)/faq/page.tsx`.
- Data and helpers: `lib/mock-data.ts` and `lib/data-store.ts` (gift sending flag), `lib/birthdays.ts` / `lib/utils.ts` (color and eligible recipient selection), `lib/types.ts` (gift status type).
- Styles: `app/globals.css` (strip animation conditions).
- Behavior: the changes are noticeable both to an employee (availability of the wish and recipients) and to an administrator (date preview, table).
