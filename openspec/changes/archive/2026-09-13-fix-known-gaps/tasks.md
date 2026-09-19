## 1. Clarification of the product decision

- [x] 1.1 Agree with the customer on the method for recording the employee's participation amount (see `design.md` → Open Questions), fix the chosen option in `design.md` by updating the Open Questions section; completion criterion — the section contains no open question or contains only questions that do not affect the participation form

## 2. Unified corporate email validation

- [x] 2.1 Extract the corporate address validation into a shared `lib/` module (the `@company.com` suffix and presence in the directory) and use it in `lib/auth-context.tsx`; completion criterion — `npm run typecheck` passes, login with `anna.smirnova@company.com` succeeds, login with `unknown.user@company.com` is rejected
- [x] 2.2 Wire the same validation into `components/features/DonateDialog.tsx` instead of checking only by suffix; completion criterion — the address `unknown.user@company.com` is rejected in the participation form as well, and an existing address is accepted

## 3. Chat between the employee and the administrator

- [x] 3.1 Add operations to `lib/data-store.ts` and `lib/data-context.tsx` for getting all threads and accessing a thread by user; completion criterion — `npm run typecheck` passes and the operations are available via `useData()`
- [x] 3.2 Implement an administrator mode in `components/features/ChatThread.tsx` with a list of employee requests and replies to the selected thread; completion criterion — the administrator sees threads created by employees, and the sent reply appears in that employee's thread
- [x] 3.3 Compute the administrator flag when sending a message from the current user's role, removing the hard-coded `false`; completion criterion — an administrator message is saved as administrative, an employee message as an employee message

## 4. An employee's congratulation creates a wish

- [x] 4.1 Add to `components/features/DonateDialog.tsx` for the employee a step for entering their participation amount and a step for entering the congratulation text; on confirmation, call the amount addition operation and create a wish via the store operation; completion criterion — after confirming the congratulation, an entry appears on the wish board with the author's nickname and the recipient, the entered amount is added to the collection, and the total collection amount is not displayed on the employee's steps

## 5. Calendar by years

- [x] 5.1 Replace the year constant in `app/(app)/calendar/page.tsx` with state and add forward/backward year switching with birthday recalculation; completion criterion — switching the year changes the set and dates of birthday people, and the current-day mark is displayed only for the actual current year

## 6. The wish button on the home page

- [x] 6.1 Wire the "Leave a wish" button in `app/(app)/page.tsx` to the wish board form; completion criterion — pressing the button opens the wish creation form

## 7. Cleanup and final verification

- [x] 7.1 Remove the unused `getRole()` function in `lib/auth-context.tsx`; completion criterion — `npm run lint` reports no errors related to the removed code
- [x] 7.2 Run the final check `npm run lint` and `npm run typecheck`; completion criterion — both commands finish without errors
