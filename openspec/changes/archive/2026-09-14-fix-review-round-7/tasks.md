## 1. Decline state

- [x] 1.1 In `lib/data-store.ts`, add the helper `isGiftDeclined(userId, history)` (whether there is an entry with the reason `refund_declined`) and export it; check — `npm run typecheck` passes without errors
- [x] 1.2 In `lib/data-store.ts`, protect `setGiftSent`: for a declined employee, the call does not change the status; check — `npm run typecheck` and a manual check that the decline status does not toggle
- [x] 1.3 Make sure that the existing log entry `mockDonationHistory` (`refund_declined`, employee `u3`) makes `u3` declined without editing `Donation`; check — `isGiftDeclined('u3', mockDonationHistory)` returns `true`

## 2. Admin panel: "Declined" status

- [x] 2.1 In `components/features/AdminTable.tsx`, for a declined employee show a non-editable "Declined" badge instead of the status toggle button; check — the row `u3` shows "Declined"
- [x] 2.2 In `components/features/AdminTable.tsx`, make the "Edit" button unavailable for a declined employee (the button is inactive, the dialog does not open); check — for `u3` the amount change is unavailable, and the amount remains `0 ₽`
- [x] 2.3 Verify that for employees without a decline, the "Not sent" ↔ "Sent" toggle and amount changes work as before; check — a manual run on any other employee

## 3. Prohibition of money gifts to those who declined

- [x] 3.1 In `components/features/DonateDialog.tsx`, compute the set of declined persons from `history` and mark their entries in the recipient list: `SelectItem` is inactive, with the note "declined the gift"; check — the `u3` entry is inactive and labeled
- [x] 3.2 Make sure that an inactive entry cannot be selected and that confirmation with it is impossible; check — selecting `u3` does not set the recipient, and subsequent steps are unavailable
- [x] 3.3 Verify that a text congratulation to a declined person remains available via the form on the wish board on their birthday; check — a manual run with a date when the declined person is the birthday person

## 4. Wish card without a date

- [x] 4.1 In `components/features/WishBoard.tsx`, remove the block with `format(wish.createdAt, …)` from `renderCard` and the unused imports `format`/`ru`, if they are no longer needed; check — `npm run lint` does not report unused imports
- [x] 4.2 Verify that the date is not displayed on the card, while `createdAt` continues to be stored and the sorting of the strip "from new to old" has not changed; check — a visual inspection of the cards and the order of the strip

## 5. Auto-selection of the only birthday person

- [x] 5.1 In `components/features/WishBoard.tsx`, when the form is opened, fill in the recipient if `wishRecipients` contains exactly one employee; check — with a single birthday person the "Whom are we congratulating" field is already filled
- [x] 5.2 Verify that with several birthday persons auto-selection does not trigger, and with a single birthday person — the user themselves — the form remains without a recipient; check — a manual run of both cases

## 6. Elimination of the header menu freeze

- [x] 6.1 In `components/layout/ThemeSwitcher.tsx`, set `modal={false}` on the root `DropdownMenu`; check — opening the menu no longer sets `pointer-events: none` on `<body>`
- [x] 6.2 In `components/layout/Header.tsx`, set `modal={false}` on the root `DropdownMenu` of the user menu; check — opening the menu does not set a lock on `<body>`
- [x] 6.3 Reproduce the original defect and make sure it is absent: open the header menu, press the browser "back"/"forward", then check that the page scrolls and elements respond to clicks without a reload; check — `document.body` does not retain `pointer-events: none` and `data-scroll-locked`
- [x] 6.4 Verify responsiveness during fast switching of the top navigation sections; check — the application remains interactive, and a reload is not required

## 7. Correspondence tab from the address

- [x] 7.1 In `app/(app)/faq/page.tsx`, determine the active tab from `useSearchParams()` and wrap the component that uses `useSearchParams` in `<Suspense>`; check — `npm run typecheck` and `npm run build` pass
- [x] 7.2 Verify that pressing the unread indicator in the header opens the correspondence tab both from an already open page `/faq` and on direct navigation to `/faq?tab=messages`; check — the correspondence tab is active, and the administrator can select a thread and reply

## 8. Verification and finalization

- [x] 8.1 Run `npm run typecheck`, `npm run lint` and `npm run build` without errors
- [x] 8.2 Run the integration scenarios: the "Declined" status and locked management; unavailability of a money gift to a declined person and availability of a text one; absence of the date on the card; auto-selection of the only birthday person; absence of freezes during navigation; opening the correspondence tab from the header; check the console for errors
- [x] 8.3 Run `openspec validate fix-review-round-7 --strict` and make sure there are no errors
