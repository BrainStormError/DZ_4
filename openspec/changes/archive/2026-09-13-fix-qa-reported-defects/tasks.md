## 1. Common helpers

- [x] 1.1 Add the functions `parsePositiveInt`, `parseNonNegativeInt`, `pluralizeRu`, and `prepositionalMonth` to `lib/utils.ts`; verify that `parsePositiveInt('1e3')`, `parsePositiveInt('12.5')`, `parsePositiveInt('0')` return `null`, and `parsePositiveInt('500')` returns `500`
- [x] 1.2 Check the project state: `npm run typecheck` and `npm run lint` complete without new errors

## 2. Participation scenario (donations)

- [x] 2.1 In `components/features/DonateDialog.tsx`, add a first recipient selection step when `targetUser` is not set (opening from the common button); verify that the `amount/message/confirm` steps are unavailable before selection and that the texts contain no `undefined`
- [x] 2.2 Block the transition to confirmation without a selected recipient and replace the silent exit in `handleConfirm` with an unavailable submission with an explanation; verify that confirmation without a recipient does not change the data
- [x] 2.3 Prefill the email with the current user's value and reject a third-party address; verify that entering a colleague's email shows an error, and that for one's own email the "From:" matches the wish author
- [x] 2.4 Replace `parseInt` with `parsePositiveInt` in the amount step; verify that `1e3`, `0`, `-5`, `12.5`, and an empty value are not accepted, and that `500` is carried over as exactly 500 ₽
- [x] 2.5 Reformulate the text of the email confirmation step: remove the promise of participation without funds and point to the "Leave a wish" button; verify the text in the dialog
- [x] 2.6 Make the success screen role-based: for an administrator — about the amount being added without mentioning a congratulation; verify both scenarios (employee and admin)
- [x] 2.7 Remove the declinable templates `for ${fullName}` in the dialog, replacing them with the neutral construction `Recipient: <Full name>`; verify all the `amount/message/confirm` steps, including the admin variant

## 3. Admin amount change (donations)

- [x] 3.1 In `components/features/AdminTable.tsx`, add a `parseNonNegativeInt` check to `canSave`; verify that a negative amount is not saved and does not appear in the table or the log
- [x] 3.2 Verify that a correct non-negative amount is saved, and a record with the reason, comment, and before/after values is added to the change log

## 4. Dates and calendar (birthdays)

- [x] 4.1 In `app/(app)/page.tsx`, remove the hardcoded `2026-09-13` and compute "today" from the real local date with an update after mounting; verify that the birthday people list matches the system date and there are no hydration warnings
- [x] 4.2 In `app/(app)/calendar/page.tsx`, initialize the starting month and year with the current date; verify that when launched in any month, the current period opens, and month and year navigation works
- [x] 4.3 Use `pluralizeRu` for the counter and `prepositionalMonth` for the heading; verify "1 birthday person", "2 birthday people", "5 birthday people", and "Birthday people in September 2026"

## 5. Texts, accessibility, avatars

- [x] 5.1 In `app/(app)/faq/page.tsx`, fix the misspelling of "warm attention"; verify the answer to the first question
- [x] 5.2 Add accessible names (`aria-label`) for the theme switcher and the user menu in `components/layout/ThemeSwitcher.tsx` and `components/layout/Header.tsx`; verify at a width of 375 px and with the keyboard (Tab, Enter/Space)
- [x] 5.3 Switch `avatarUrl` in `lib/mock-data.ts` to local files `public/avatars/*` or an inline SVG with initials; verify that when the source is unavailable, initials are shown and there are no resource loading errors in the console

## 6. Integration check

- [x] 6.1 Run the scenarios in a browser: hero button → recipient selection → success; rejection of a third-party email; rejection of `1e3` and a negative amount; saving the admin amount; calendar and "birthday people today"; mobile header
- [x] 6.2 Verify that the console contains no errors on the `/`, `/calendar`, `/faq`, `/admin` pages and that `npm run typecheck` passes
