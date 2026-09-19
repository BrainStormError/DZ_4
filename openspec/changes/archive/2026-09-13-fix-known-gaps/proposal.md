## Why

The "Korporpodarki" demo application generally implements the declared functionality but contains a number of behavioral defects that make some key scenarios not work: the administrator does not see employee requests and cannot reply to them, an employee's congratulation does not create a wish, the calendar is limited to 2026, and corporate email validation is not consistent between login and the participation form. The correct behavior needs to be fixed in the specifications and the discrepancies eliminated.

## What Changes

- The administrator sees all employee chat threads and can reply in each of them; the employee still sees only their own thread.
- An employee's congratulation in the participation form creates an entry on the wish board, as the interface promises after sending.
- The "Leave a wish" button in the home page hero block opens the wish form (it currently has no handler).
- The birthday calendar supports year switching, not only month switching within 2026.
- Corporate email validation is unified: the address must end with `@company.com` and be present in the corporate directory; the rule applies both at login and when confirming participation in the collection.
- Chat messages get the correct author flag (`isAdmin`) instead of a hard-coded `false`.
- The dead code `getRole()` in `lib/auth-context.tsx` is removed.

## Capabilities

### New Capabilities
- `auth`: login by corporate email and a unified corporate address validation rule.
- `birthdays`: birthday people on the home page and a birthday calendar with navigation by months and years.
- `wishes`: the wish board, authorship under a corporate nickname, and wish creation from the congratulation form.
- `donations`: corporate email confirmation before participation, hiding collection amounts from employees, and tracking participation.
- `support-chat`: FAQ and private chat between the employee and the administrator.

### Modified Capabilities
<!-- There are no existing specifications in openspec/specs/ yet, so we do not list modified capabilities. -->

## Impact

- `components/features/ChatThread.tsx`, `lib/data-store.ts`, `lib/data-context.tsx` — administrator access to threads and the author flag.
- `components/features/DonateDialog.tsx`, `components/features/WishBoard.tsx`, `app/(app)/page.tsx` — the congratulation scenario and the wish button.
- `app/(app)/calendar/page.tsx` — year navigation.
- `lib/auth-context.tsx` — unified email validation, removal of dead code.
- The change does not affect external APIs or dependencies; the application remains a client-side demo on mock data.
