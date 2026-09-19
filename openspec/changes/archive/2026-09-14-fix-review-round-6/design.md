## Context

See `proposal.md` — Why. Key constraints of the current state:

- The participation dialog (`components/features/DonateDialog.tsx`) is step-by-step, and roles are not distinguished; the `message` step contains an extra button, and the `confirm` step contains a block explaining that the amount is hidden.
- The wish board (`components/features/WishBoard.tsx`) formats the card date as `d MMM, HH:mm`.
- Unread counts are calculated by thread: `countUnreadThreads` (`lib/data-store.ts`), used in `Header.tsx` and `app/(app)/faq/page.tsx`; there are no markers in the thread list in `ChatThread.tsx`.
- The change log lives inside `AdminTable.tsx` and is toggled by a boolean `showHistory` with a single button.
- `AppDate`/`ThemeProvider`/`AuthProvider`: `ThemeProvider` and `AuthProvider` return `null` before hydration, so the server-side HTML is empty. Fonts are connected via a blocking `@import` in `app/globals.css`.
- The calendar (`app/(app)/calendar/page.tsx`) is a grid of cells with `key={day}` and `transition-colors`.

## Goals / Non-Goals

**Goals:**

- Remove extra controls and copy in the money congratulation dialog, and show the recipient's email in the selection.
- Count unread by messages and show markers by thread.
- Fix the refund example and forcibly zero the amount on decline.
- Make the "table/journal" navigation explicit.
- Fix and meet the LCP/INP/CLS budgets.
- Remove the visual bleed of the calendar highlight when the period changes.

**Non-Goals:**

- Real backend, DB, real authentication and payment — remain mocks.
- Redesigning pages beyond the listed defects.
- Continuous collection of field metrics (RUM) in production — the check is laboratory-based and via interaction tracing.
- Changing the rules for visibility of amounts and roles, and the behavior of the date preview.

## Decisions

### 1. Participation dialog: removing a control and a block, email in the selection

- Remove the "Without a wish" button (the `message` step). Sending without text remains available: empty field → "Continue" → confirmation.
- Completely remove the block with the `Lock` icon and text on the `confirm` step; remove the unused `Lock` import.
- In the recipient selection `Select`, show `{fullName} — {department} — {email}`.
- Alternative: keep a single line "The final collection amount is hidden." — rejected by the user's decision (the block is removed entirely).

### 2. Unread by messages

In `lib/data-store.ts`, replace `countUnreadThreads` with:

- `countUnreadMessages(threads)` — the sum of messages with `!isAdmin && readByAdmin !== true` across all threads;
- `countUnreadInThread(thread)` — the number of unread in a single thread.

`markThreadRead` remains unchanged (it marks all of the employee's messages in the thread as read). Update `Header.tsx` (badge = `countUnreadMessages`), `app/(app)/faq/page.tsx` (the same), `ChatThread.tsx` — in the thread list item, add a marker with `countUnreadInThread(thread)` and highlight the row; the marker disappears after the thread is opened.

Alternative: keep the count by thread and only add a dot — rejected, the user chose counting by messages.

### 3. A refund zeroes the amount

- In `AdminTable.handleOpenEdit` and when selecting a reason: if `editReason === 'refund_declined'`, forcibly `setEditAmount('0')` and disable the input field; `canSave` additionally requires `parsedEditAmount === 0` for this reason.
- Fix the mock: `mockDonationHistory[0]` → `previousAmount: 15600, newAmount: 0`; `mockDonations` for `u3` → `totalAmount: 0`.
- Alternative: only fix the mock without changing behavior — rejected: the rule must be enforced in the UI, otherwise a non-zero "decline" remains possible.

### 4. Explicit log navigation

- Replace the boolean `showHistory` with `Tabs` tabs (`@/components/ui/tabs`): values `table` and `history`, labels "Collection table" and "Change log". The date preview block remains outside the tabs.
- Alternative: keep the button and add "← Back to collection table" — less consistent: `faq/page.tsx` already uses tabs.

### 5. Calendar stability

- Attach `key={`${year}-${month}`}` to the grid container so that the cells remount when the period changes. This eliminates the color transition from the previous month's/year's state and the partial bleed when the number of days differs.
- Alternative: remove `transition-colors` from the cells — simpler, but expresses the intent less explicitly and affects the smoothness of theme switching; rejected.

### 6. Performance

- **Fonts:** replace the Google Fonts `@import` in `app/globals.css` with `next/font/google`. Load the used families (Nunito; Bricolage Grotesque + Manrope; Fraunces + Inter) as CSS variables, and bind `--font-heading`/`--font-body` to these variables per theme. `next/font` hosts the files itself, sets `size-adjust` (reducing CLS), and does not block rendering. Limit the weights to those used.
- **Server-side content:** remove the `null` return from `ThemeProvider` and `AuthProvider`. Apply the theme with an early inline script in `<head>` (reading `localStorage` and setting `data-theme` before hydration), and initialize the provider state from the already set attribute. `AuthGate` renders the shell and performs a client-side redirect when there is no user, without hiding the tree.
- **Verification:** production build (`npm run build && npm start`), Lighthouse in mobile mode for `/`, `/calendar`, `/faq`, `/admin` — LCP and CLS; INP — by interaction tracing (opening the dialog, entering and sending, switching tabs/months). Compare the values against the budgets of 2.5 s / 200 ms / 0.1.

## Risks / Trade-offs

- [Five families via `next/font` increase the bundle weight] → load only the used weights; the fonts are inlined and cached, and the blocking request disappears.
- [A redirect without hiding the tree may briefly show protected content to an unauthorized user] → `AuthGate` performs the redirect immediately after hydration; for the demo mock this is acceptable, and real protection is out of scope.
- [The inline theme script complicates hydration] → `suppressHydrationWarning` on `<html>` is already present; initializing the theme from the DOM attribute removes the mismatch.
- [Counting by messages changes the number on the badge] → expected behavior per the user's decision; the per-thread markers keep it understandable.
- [Locking the amount field on decline reduces flexibility] → an emergency refund remains available for partial amounts.
- [Lighthouse does not measure INP in the laboratory] → use interaction tracing and/or web vitals in the console; record the methodology in the tasks.

## Migration Plan

A demo application without persistence or data migrations. Mock changes are applied on load. Rollback is via git. Deployment to Netlify does not change; after the edits, make sure that `npm run build` passes.

## Open Questions

None.
