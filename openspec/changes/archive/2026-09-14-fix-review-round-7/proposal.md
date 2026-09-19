## Why

The seventh round of QA revealed that after an employee declines a gift, the admin panel does not reflect this state and still allows changing the amount and gift status; the wish cards still show an extra date; money can still be gifted to employees who declined; with a single birthday person, the wish form does not fill them in; fast switching of the header tabs leads to a complete freeze of the application due to a stuck scrolling and pointer lock; and navigating via the unread-messages indicator does not open the correspondence tab, so the administrator does not reach the chat and cannot reply.

## What Changes

- **A third gift status — "Declined".** For an employee who declined the gift, the admin panel MUST show the status "Declined". The collection amount and the gift status for such an employee MUST be unavailable for editing: the amount is fixed, and the manual status toggle is removed.
- **Wish card without a date.** The card on the wish board MUST stop showing the creation date; the requirement about the date without time is removed. The creation time is still stored in the data.
- **Prohibition of money gifts to those who declined.** An employee who declined the gift MUST NOT be available as a recipient of a money congratulation: in the recipient dropdown, their entry MUST be displayed as inactive with the note "declined the gift". Such an employee can only be congratulated with text.
- **Auto-selection of the only birthday person.** If there is exactly one birthday person today, when the "Leave a wish" form is opened, they MUST be filled into the recipient selection automatically.
- **Elimination of the freeze when switching tabs.** The header menus (the theme switcher and the user menu) MUST NOT leave the page locked after navigation between pages: navigation and scrolling MUST remain available without a reload.
- **Navigation to messages via the indicator.** Navigation via the unread-messages indicator in the header MUST reliably open the correspondence tab so that the administrator can open a thread and reply.

## Capabilities

### New Capabilities

- `app-shell`: the behavior of the application shell (header and navigation menus) — open header menus must not block interaction and scrolling after navigation between pages.

### Modified Capabilities

- `admin-panel`: a third gift status "Declined" is added, along with locking of amount and status changes for an employee who declined the gift.
- `donations`: an employee who declined the gift is excluded from money congratulation recipients (an inactive entry with a note in the recipient selection).
- `wishes`: the requirement to show the creation date in the wish card is removed; auto-selection of the only birthday person when the form is opened is added.
- `support-chat`: navigation via the unread-messages indicator reliably opens the correspondence tab.

## Impact

- Components: `components/features/AdminTable.tsx`, `components/features/DonateDialog.tsx`, `components/features/WishBoard.tsx`, `components/layout/Header.tsx`, `components/layout/ThemeSwitcher.tsx`, `app/(app)/faq/page.tsx`.
- Data and helpers: `lib/types.ts` (the decline state in the collection model), `lib/data-store.ts` (setting the decline and edit availability), `lib/mock-data.ts` (the initial state of a declined employee), `lib/birthdays.ts` (filtering money congratulation recipients).
- Specifications: `openspec/specs/` — deltas for `app-shell` (new), `admin-panel`, `donations`, `wishes`, `support-chat`.
- Not changing: persistence, backend, real authentication, the rules for hiding amounts from employees, themes, and avatars.
