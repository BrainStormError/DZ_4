## Context

The application is a client-side demo on Next.js (App Router) without a backend. State lives in `lib/data-store.ts` (`useDataStore`, React state) and is distributed through `lib/data-context.tsx`; login is `lib/auth-context.tsx` on `localStorage`; data is in `lib/mock-data.ts` and is reset on reload. This sets the boundaries: fixes are made in existing components and client contexts, without server-side authorization and without external services. The motivation for the change is in `proposal.md`; the requirements are in the delta specifications under `specs/`.

## Goals / Non-Goals

**Goals:**
- Eliminate the six identified behavioral defects within the current client-side architecture.
- Keep the mock data model and state reset on reload as a deliberate demo limitation.
- Make the corporate email validation rule a single source of behavior for login and participation in the collection.

**Non-Goals:**
- Real integration of corporate email, SSO, or a payment service.
- A server-side DB, server-side authorization, and real protection of amounts.
- Changing the visual concept and themes.
- Migration or persistence of data between sessions.

## Decisions

### D1. Chat modes in a single component

`ChatThread` gets two modes: the employee sees one thread of their own, the administrator sees a list of all threads and the selected one. Data and operations (`getAllThreads`, getting/creating a thread) are added to `useDataStore` and `DataContext`.
- Alternative: a separate `AdminChat` component — rejected due to duplication of the message layout and send logic.

### D2. The administrator flag is computed from the role

When sending a message, `isAdmin` is computed from the current user's role (`user.role === 'admin'`), and `authorEmail` is taken from the sender. The hard-coded `false` is removed.
- Alternative: keep the parameter but pass the correct value from the component — rejected, because there must be a single source of truth and it exists in the authorization context.

### D3. A single corporate address validation function

The rule "ends with `@company.com` AND is present in the directory" is extracted into a shared `lib/` module and used both in `auth-context` and in `DonateDialog`.
- Alternative: duplicate the validation in the donation form — rejected due to the discrepancy that led to the defect.

### D4. An employee's congratulation creates a wish

A step with congratulation text is added to the employee participation scenario; on confirmation, `addWish` from the same store is called. Amounts are not shown to the employee (see the `donations` spec).
- Alternative: create a wish with automatic text — rejected, because the board loses the meaning of a meaningful congratulation.

### D5. The calendar year is state, not a constant

`CURRENT_YEAR` is replaced with the selected-year state with forward/backward switching; birthdays are recalculated relative to the selected year, and the current-day mark is shown only for the actual current year.
- Alternative: keep a single year — rejected, because the requirement allows viewing birthdays in the current year, and the demo must survive a year change without code edits.

### D6. The "Leave a wish" button opens the board form

The wish board form state is lifted or wired so that the button in the home page hero block opens the wish creation form.
- Alternative: remove the button — rejected, because it is declared in the home page requirements.

### D7. Removal of dead code

`getRole()` in `lib/auth-context.tsx` is removed as unused.

### D8. The employee specifies their participation amount

In addition to the congratulation text, the employee enters a positive amount for their participation, which is added to the recipient's collection via `addDonation`. The total collected amount is not shown to the employee: only their own contribution and an explanation about hiding are displayed. The administrator's amount and the employee's amount use the same `addDonation` operation.
- Alternative: record the amount only by the administrator and express employee participation as a wish — rejected by the customer's decision.

## Risks / Trade-offs

- Amount hiding is implemented on the client, so it is not protection: the data is available in the browser memory. For an educational demo this is acceptable, but moving to a real service will require server-side authorization and storing amounts outside the client.
- Combining two modes in `ChatThread` complicates the component — mitigated by isolating the mode logic and store operations.
- Calling `addWish` from the participation form creates a second wish creation path — mitigated by reusing a single store operation instead of duplicating it.
- Extending the calendar and chat state increases client-side state without persistence — acceptable for the demo.

## Migration Plan

Not required. The change is client-side, the data is ephemeral and reset on reload; backward compatibility of data formats is not affected.

## Open Questions

There are no open questions affecting the participation form. The method for recording the employee's participation amount has been agreed and fixed in `D8`: the employee enters their own amount, and the total collected amount is not disclosed to them. The corresponding requirement has been added to the `donations` delta spec.
