## 1. Common helpers

- [x] 1.1 In `lib/birthdays.ts`, add `getTodayBirthdays(today, users)`, `hasBirthdayNotPassed(today, user)`, and `getCongratulatableUsers(today, users)` (the latter excludes the current user); verify `npm run typecheck`
- [x] 1.2 In `lib/birthdays.ts`, add a helper for assigning a personal color by a list of users (deterministically, sorting by `fullName`), reusable by both the birthday person card and the strip; verify that the color order matches for the same list

## 2. Congratulations strip

- [x] 2.1 In `components/features/WishBoard.tsx`, switch the strip to a single accessible (`aria-hidden`) copy of the list by default — a static row without duplicates; verify that with 1–2 wishes each card is displayed once
- [x] 2.2 Add measurement of container overflow (ref + `ResizeObserver`) and enable the looped scrolling mode only on overflow; verify that with few cards the duplicate is not mounted, and with many, auto-scroll is enabled
- [x] 2.3 In `app/globals.css`, apply the `wish-marquee` animation only under the scrolling-mode modifier and do not duplicate the content in the static case and with `prefers-reduced-motion`; verify that with reduced motion enabled, one manually scrollable row remains
- [x] 2.4 Verify the auto-scroll pause on hover and focus in scrolling mode; the completion criterion is that hover and focus stop the movement and the content remains accessible

## 3. Single birthday person color

- [x] 3.1 In `components/features/BirthdayCard.tsx`, accept a personal color and use it for the outline when `isToday` instead of `ring-primary`; verify that the card outline matches the color of its congratulation cards
- [x] 3.2 In `app/(app)/page.tsx`, compute the colors of today's birthday people with the common helper and pass them to `BirthdayCard`, and use the same helper in `WishBoard`; verify that one employee has the same color in the card and the strip, and different ones have different colors

## 4. Availability of a free wish

- [x] 4.1 In `components/features/WishBoard.tsx`, restrict the form's recipient list to today's birthday people via `getTodayBirthdays`; verify that the list contains no other employees and not the user themself
- [x] 4.2 Make the "Leave a wish" controls (the hero button in `app/(app)/page.tsx` and the board button) inactive when there are no birthday people today, with a clear hint; verify that the form does not open and the wish is not created

## 5. Eligible recipients of a money congratulation

- [x] 5.1 In `components/features/DonateDialog.tsx`, replace `recipientOptions` with `getCongratulatableUsers`; verify that employees with a past birthday are absent from the list, today's and future ones are present, and the user themself is excluded

## 6. Interface texts

- [x] 6.1 Remove the statement "Participation is voluntary." from `components/layout/Footer.tsx`; verify that the footer contains neither a statement about voluntariness nor a statement about amounts
- [x] 6.2 Update the FAQ answer about the author in `app/(app)/faq/page.tsx` to display "real name + nickname in parentheses" with the example `Last name First name (nick)`; verify that the full email address is not revealed and the wording matches the board's behavior

## 7. Admin panel: birthday date and gift status

- [x] 7.1 Add `giftSent: boolean` to the `Donation` type (`lib/types.ts`) and seed the value in `lib/mock-data.ts`; verify `npm run typecheck`
- [x] 7.2 Add `setGiftSent(userId, sent)` to `lib/data-store.ts` and pass it through to `lib/data-context.tsx`; verify that the status change is reflected in the session state
- [x] 7.3 In `components/features/AdminTable.tsx`, add a "Birthday date" column with formatting via `parseIsoLocal`; verify that the date is displayed for each row
- [x] 7.4 In `components/features/AdminTable.tsx`, add a "Gift" column with the status "Sent" / "Not sent" and manual toggling by the administrator; verify that the toggle is immediately reflected in the table and is unavailable to an employee

## 8. Verification and finalization

- [x] 8.1 Run `npm run typecheck` and `npm run lint` without errors
- [x] 8.2 Run the manual scenarios: birthday person today; no birthday people today (past-day placeholder); few wishes — static; many wishes — scrolling; reduced motion; an attempt to congratulate in advance for free; the money recipient list without past dates; marking the gift status
- [x] 8.3 Run `openspec validate "fix-feed-eligibility-and-admin-panel"` and make sure there are no errors
