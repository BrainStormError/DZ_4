## 1. Data model and store

- [x] 1.1 Add `updateWish(id, text)` to `useDataStore` (`lib/data-store.ts`): updates the wish text by id without changing the author, recipient, and `createdAt`; check — `npm run typecheck` passes without errors
- [x] 1.2 Proxy `updateWish` through `lib/data-context.tsx`; check — `useData()` returns the method, `npm run typecheck` passes
- [x] 1.3 Add the optional field `readByAdmin?: boolean` to `ChatMessage` (`lib/types.ts`); check — `npm run typecheck` passes
- [x] 1.4 Add `markThreadRead(userEmail)` to `useDataStore`: marks all messages of the thread with `isAdmin === false` as read; check — `npm run typecheck` passes
- [x] 1.5 Set `readByAdmin: true` on already answered threads in `lib/mock-data.ts` (Anna's thread), leaving the unanswered thread unread; check — when logging in as administrator, the unread counter equals the number of unanswered threads

## 2. Participation form parity

- [x] 2.1 Remove role-based step branching in `DonateDialog.tsx`: the scenario is always `recipient → email → amount → message → confirm → success`; check — the administrator and the employee go through the same number of steps
- [x] 2.2 Make the step and result-screen texts neutral (the employee variant) and call `addWish` regardless of role; check — after the administrator confirms, a wish in their name appears on the board and the amount is not displayed
- [x] 2.3 Verify that the "Congratulation" step blocks continuation when the text is empty and that the result screen is the same for both roles; check — a manual run of the scenario under both roles

## 3. Wish editing

- [x] 3.1 Add an "Edit" action to the wish card in `WishBoard.tsx`, visible only when `user.role === 'admin'`; check — the employee has no editing controls, the administrator does
- [x] 3.2 Implement the edit dialog with a `Textarea`, saving via `updateWish`, and blocking of empty text; check — after saving, the new text is visible on the board and the author and recipient have not changed

## 4. Messages section and unread

- [x] 4.1 In `app/(app)/faq/page.tsx`, set the tab name by role: "Messages" for the administrator, "Write to admin" for the employee, and adjust the card description by role; check — under both roles the headings match the `support-chat` specification
- [x] 4.2 In `ChatThread.tsx`, call `markThreadRead` when the administrator selects a thread; check — after opening a thread, the unread counter decreases
- [x] 4.3 Add an unread badge to the "Messages" tab; check — when there are unread messages the badge is visible, otherwise it is hidden
- [x] 4.4 Make the tabs controlled and open the messages tab via `?tab=messages` from `window.location.search` in `useEffect`; check — navigating to `/faq?tab=messages` opens the messages tab

## 5. Header and profile menu

- [x] 5.1 Remove the non-interactive department item from the profile menu in `Header.tsx`; check — the menu retains the profile, the department as a label is absent, and there are no false commands
- [x] 5.2 Add an unread message indicator in `Header.tsx` for the administrator only, with a link to `/faq?tab=messages`; check — the indicator is visible to the administrator with unread messages and absent for the employee and when there are zero unread messages

## 6. Copy

- [x] 6.1 Remove "Collection amounts are visible only to the administrator." from `components/layout/Footer.tsx`, keeping "Participation is voluntary."; check — the footer does not contain a statement about amounts
- [x] 6.2 Remove "Only the administrator can see the collection amounts." and "Warm words matter more than the amount." from `app/(app)/page.tsx`; check — the home page has no mentions of amount visibility or the warm-words phrase

## 7. Integration check

- [x] 7.1 Run the pages `/`, `/calendar`, `/faq`, `/admin` under the administrator and the employee: the participation forms are identical, the administrator's wish appears on the board, editing works, the "Messages" tab replies, and the unread indicator is cleared when a thread is opened; check the console for absence of errors
- [x] 7.2 Run `npm run typecheck`, `npm run lint`, and `npm run build`; check for absence of errors and warnings about the new modules
