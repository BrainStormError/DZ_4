## Context

See `proposal.md` — Why. The current state affecting the approach:

- A gift decline is recorded only as a log entry (`DonationHistoryEntry` with the reason `refund_declined`), while the collection model `Donation` stores only `totalAmount` and `giftSent: boolean` (`lib/types.ts`). At the same time, the admin panel shows two buttons: a gift toggle and "Edit", available for any employee, including one who has already declined.
- The recipient selection for a money congratulation is built from `getCongratulatableUsers` (`lib/birthdays.ts`) by birthday and does not take a decline into account.
- The wish card shows the creation date (`WishBoard.tsx`).
- The header menus (`ThemeSwitcher` and the user menu in `Header.tsx`) are modal Radix `DropdownMenu` by default: while a menu is open, `pointer-events: none`, `overflow: hidden`, and `data-scroll-locked` are set on `<body>`.
- The correspondence tab in the FAQ is initialized once from `window.location.search` in `useEffect([])`, so a client-side navigation between `/faq` and `/faq?tab=messages` does not switch the tab.

## Goals / Non-Goals

**Goals:**

- Reflect a gift decline as a separate state with locked amount and status management.
- Prohibit money congratulations for those who declined, while preserving the ability to send a text congratulation.
- Remove the date from the wish card and automatically fill in the only birthday person.
- Eliminate the stuck page lock after navigation with an open header menu.
- Guarantee that the correspondence tab opens at the address `/faq?tab=messages`.

**Non-Goals:**

- Persistence, backend, real authorization; the state remains client-side and resets on reload.
- Changing the rules for hiding amounts from employees and the rules for showing wishes by birthday.
- Changing the appearance of themes and the remaining header controls.

## Decisions

### Decision 1: the decline is derived from the log, not from a new field

The decline flag is computed as the presence of a log entry with the reason `refund_declined` for the employee (`history.some(...)`). We do not add a separate field to `Donation`.

- Why: the log already stores the fact of the decline and is the only source of the amount change; deriving from it eliminates desynchronization of the two representations of the state.
- Alternative — add `declined`/`giftStatus` to `Donation`: simpler to read in the UI, but creates a second source of truth and requires maintenance on every amount change.
- Consequence: a helper `isGiftDeclined(userId, history)` in `lib/data-store.ts`; the existing entry `h1` for the employee `u3` automatically makes them declined.

### Decision 2: the "Declined" status and locked management in the admin panel

In the collection table, the gift status becomes three-valued at the display level: "Not sent", "Sent", "Declined". For a declined person, the status is shown as a non-editable badge, and the "Edit" button and the status toggle are unavailable. `setGiftSent` is additionally protected at the store level.

- Why: both actions need to be hidden/deactivated, otherwise the amount and status remain changeable in circumvention of the requirement.
- Alternative — keep the buttons active and show an error on press: rejected, the requirement prohibits the very possibility, not only the result.

### Decision 3: money congratulation is unavailable to those who declined

In the recipient selection for a money congratulation (`DonateDialog`), a declined person remains in the list, but their `SelectItem` is inactive and contains the note "declined the gift". A text congratulation via the wish board remains available for them.

- Why: the user must understand why the recipient is unavailable for money and have an alternative in the form of text.
- Assumption (recorded, since the question was not explicitly clarified): the deactivation and note apply only to the money congratulation list; the recipient selection in the wish form remains active so that text is possible.
- Alternative — completely exclude the declined person from the money list: rejected, since the requirement asks to show the reason in the list.
- Alternative — also block the text congratulation: contradicts "text congratulations only".

### Decision 4: wish card without a date

From `renderCard` in `WishBoard.tsx`, the block with `format(createdAt, ...)` is removed. `createdAt` continues to be stored and used for sorting the strip.

- Why: the date carries no value on the board; the requirement about the date without time is removed from the specification.
- Alternative — keep the date without time: already implemented and rejected by the review.

### Decision 5: auto-selection of the only birthday person

When the wish form is opened, if `wishRecipients` contains exactly one employee, they are filled into `targetUserId`; with several recipients, the choice remains with the user.

- Why: removes an extra step with a single recipient.
- Alternative — auto-selection also with several recipients: rejected, creates a risk of accidentally sending to the wrong addressee.
- Edge case: if the only birthday person is the user themselves, the recipient list is empty, and auto-selection does not trigger.

### Decision 6: non-modal header menus

The `DropdownMenu` in `ThemeSwitcher.tsx` and in the user menu of `Header.tsx` are switched to `modal={false}`. This removes the `<body>` lock (`pointer-events: none`, `overflow: hidden`, `data-scroll-locked`) and, consequently, the sticking during navigation.

- Why: the lock appears precisely because of the modal mode; abandoning modality eliminates the cause rather than the symptom.
- Alternative — keep modality and reset the `<body>` styles after a route change: treats the symptom and requires knowing all navigation points; acceptable as an additional safeguard, but not as the primary solution.
- Alternative — controlled closing of the menu on `usePathname` change: reduces the chance of a race, but does not guarantee recovery if the layer has already unmounted.
- Impact: the header menus stop trapping focus and blocking outside clicks — acceptable for small menus in the header; keyboard accessibility is preserved.

### Decision 7: the correspondence tab is controlled by the address

The FAQ uses `useSearchParams()` to determine the active tab; navigating to `/faq?tab=messages` makes the correspondence tab active regardless of whether the page was already open. The component that reads `useSearchParams` is wrapped in `<Suspense>`.

- Why: the address is the source of truth for a deep link, and `useSearchParams` reactively tracks query-string changes during client-side navigation.
- Alternative — the current `window.location.search` in `useEffect([])`: rejected, it does not trigger on a client-side navigation from an already open page (which is the defect).
- Alternative — a `useEffect` depending on `usePathname`: rejected, the path `/faq` does not change when the query string changes.
- Consequence: compatibility with the static build is preserved thanks to the Suspense boundary.

## Risks / Trade-offs

- [Deriving the decline from the log] → The log lives only in session memory; when the data is reset, the decline is also reset. For a client-side demo, this is consistent with the current behavior and out of scope.
- [Non-modal header menus] → Focus trapping inside the menu is lost; acceptable, but keyboard accessibility needs to be checked (names and activation from `accessibility`).
- [`useSearchParams` and the static build] → Without a Suspense boundary, the build may fail; it is mandatory to wrap it and run `npm run build`.
- [Deactivation of a declined recipient only in the money list] → The assumption is left explicit; with a different expectation, the `donations` spec and the wish form will need to be edited.
- [Removal of the date requirement] → A visible change to the card; intentional, the creation time is preserved in the data.

## Migration Plan

The change is entirely client-side and non-persistent — there are no data migrations, and rollback is via revert. The existing log entry `h1` (`refund_declined` for `u3`) immediately moves the employee into the "Declined" state, and no additional configuration of mock data is required.

## Open Questions

- Whether the protection against a sticking lock should be extended to modal dialogs (participation, amount editing) if the user leaves the page with a dialog open. It does not affect the specifications or the decomposition; it can be decided during implementation.
