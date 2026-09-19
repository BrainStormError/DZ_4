## Why

The congratulation and funds-sending form branches by role: the administrator skips the "Congratulation" step, their text does not reach the wish board, and the wishes themselves cannot be edited. At the same time, the administrator's chat section is disguised as "Write to admin" and does not signal unread messages, a non-working department item remains in the profile menu, and advertising phrases about amounts and "warm words" that were decided to be removed remain on the home page and in the footer.

## What Changes

- **Congratulation form parity.** The participation dialog MUST lead the administrator and the employee through the same scenario: recipient selection, email confirmation, amount, "Congratulation" step, confirmation. The administrator no longer skips the congratulation input, and their text MUST create a wish on the board just like the employee's.
- **The administrator adds and edits wishes.** The administrator MUST be able to leave a wish in their own name and edit the text of any wish on the board (moderation of bad-faith entries). Wish deletion is out of scope.
- **Profile menu without a false command.** The non-interactive department item ("Management" for the administrator, "Marketing" for the employee) MUST be removed from the dropdown menu.
- **The "Messages" section for the administrator.** In the FAQ section, the chat tab MUST be named "Messages" for the administrator ("Write to admin" remains for the employee), and the administrator MUST reply in it as well; the section description MUST match the role.
- **Unread messages.** The system MUST mark threads with unread administrator messages with a badge on the "Messages" tab and an indicator in the header. The "read" mark MUST be cleared when the thread dialog is opened.
- **Copy cleanup.** The phrases "Collection amounts are visible only to the administrator." (footer), "Only the administrator can see the collection amounts." and "Warm words matter more than the amount." (home page) are removed.

## Capabilities

### New Capabilities

None — all changes relate to existing capabilities.

### Modified Capabilities

- `wishes`: parity of wish creation from the dialog for both roles; the administrator edits the text of any wish.
- `donations`: the participation result no longer depends on the role — the administrator goes through the same scenario and sees the same result screen as the employee.
- `support-chat`: the chat section gets the name "Messages" for the administrator and an unread-message model with notification on the tab and in the header.
- `ui-consistency`: the requirement to place the amount-visibility statement in a single canonical place is removed; "voluntariness" remains the only canonical statement.

## Impact

- `components/features/DonateDialog.tsx` — removal of role-based branching of the form and the result screen.
- `components/features/WishBoard.tsx` — the "Edit" action for the administrator.
- `lib/data-store.ts`, `lib/data-context.tsx` — the wish update operation.
- `lib/types.ts` — read status of messages/thread.
- `components/layout/Header.tsx` — removal of the department item from the profile menu; unread message indicator.
- `app/(app)/faq/page.tsx` — role-based tab name and description; unread badge.
- `app/(app)/page.tsx`, `components/layout/Footer.tsx` — removal of the phrases.
- `openspec/specs/*` — the corresponding MODIFIED/ADDED/REMOVED deltas.
- Persistence, the real backend, role models, hiding amounts from the employee, avatars, and themes do not change; the FAQ "Who can see the collection amounts?" remains unchanged.
