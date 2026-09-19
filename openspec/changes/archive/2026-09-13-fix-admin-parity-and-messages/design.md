## Context

The application is a client-side demo on mock data: state lives in React contexts (`ThemeProvider` → `AuthProvider` → `DataProvider`, see `app/layout.tsx`) and is reset on reload. The motivation for the change is in `proposal.md`.

Current state affecting the approach:

- `components/features/DonateDialog.tsx` branches steps and texts by `isAdmin`: the administrator skips the `message` step, and `addWish` is called only when `!isAdmin`.
- `components/features/WishBoard.tsx` has no editing, and `useDataStore` (`lib/data-store.ts`) provides only `addWish`.
- `components/features/ChatThread.tsx` already has employee and administrator modes, but `app/(app)/faq/page.tsx` hard-codes the tab name as "Write to admin", and `ChatMessage`/`ChatThread` (`lib/types.ts`) do not store read status.
- `components/layout/Header.tsx` renders the user's department as a non-interactive `div` styled like a menu item, and `DataProvider` is available to the header because it wraps the entire application in the root layout.
- The phrases about amounts and "warm words" are located in `components/layout/Footer.tsx` and `app/(app)/page.tsx`.

## Goals / Non-Goals

**Goals:**

- A single participation scenario for the administrator and the employee, including the "Congratulation" step and wish creation.
- The ability for the administrator to edit the text of any wish.
- A chat section named "Messages" for the administrator with unread message indication on the tab and in the header.
- Remove the false menu item and the listed phrases.

**Non-Goals:**

- Persistence, backend, authentication, and real access protection (the role is checked in the UI, as in the current demo).
- Wish deletion, pagination, and real-time chat updates.
- Changing the rules for hiding amounts from employees and the FAQ answer "Who can see the collection amounts?".

## Decisions

### Decision 1: a single scenario in `DonateDialog`

All `isAdmin` checks in the dialog are removed: the steps always go `recipient → email → amount → message → confirm → success`, `addWish` is called for any role, and the step and result-screen texts become neutral (the employee variant).

- Alternative — keep a separate admin flow: rejected because it contradicts the requirement of identical forms.

### Decision 2: wish editing

`updateWish(id, text)` is added to `useDataStore`, proxied through `DataContext`. On the wish card, the "Edit" action is displayed only when `user.role === 'admin'`; it opens a dialog with a `Textarea` and updates only the text — the author, recipient, and `createdAt` do not change.

- Alternative — a separate admin wishes table: rejected in favor of the in-place editing context.
- Alternative — inline editing in the card: rejected because it breaks the card grid.

### Decision 3: the unread model

An optional field `readByAdmin?: boolean` is added to `ChatMessage`. Unread for the administrator are messages with `isAdmin === false` and `readByAdmin !== true`. When the administrator opens a thread, all its messages are marked as read via `markThreadRead(email)`. Scope — administrator only (the requirement concerns their notifications).

- Alternative — `lastReadAt` on the thread with time comparison: rejected due to fragility with equal or shifted timestamps; an explicit flag is more reliable.

### Decision 4: indication and navigation from the header

A badge with the number of unread messages is displayed on the profile button in the header, as well as a badge on the "Messages" tab. A click leads to `/faq` with the messages tab active: the page uses controlled `Tabs` and reads `?tab=messages` from `window.location.search` in `useEffect`.

- Alternative — `useSearchParams`: requires a Suspense boundary during static build; rejected for simplicity of the build.
- Alternative — an indicator without navigation: rejected because the indicator must be actionable.

### Decision 5: the "Messages" section

The tab name and description depend on the role (`admin` → "Messages", otherwise "Write to admin"); `ChatThread` gets a `markThreadRead` call when a thread is selected. The logic of the request list and reply is already implemented and is not rewritten.

### Decision 6: profile menu and copy

The department block is removed from the profile menu. The statement about amounts is removed from the footer ("Participation is voluntary." remains), the sentence about amount visibility is removed from the home hero, and the phrase "Warm words matter more than the amount." is removed from the "The team matters" card.

## Risks / Trade-offs

- [Wish editing is checked only in the UI] → Consistent with the current mock model; real protection is out of scope and is noted as a known limitation.
- [The indicator relies on `DataProvider` in the header] → The provider already wraps the entire application in the root layout; no additional providers are required.
- [The "read" mark without real-time] → Sufficient for the demo: with an open thread, new messages are handled by the same rule on the next selection/render.
- [Removal of the `ui-consistency` requirement about amounts] → The footer with the voluntariness statement remains the canonical place; hiding amounts is governed by the `donations` capability.
- [A single result screen changes the previously stated role-based behavior] → Reflected by `MODIFIED`/`REMOVED` deltas of `donations`.

## Migration Plan

The change is entirely client-side and non-persistent — there are no data migrations; rollback is via revert. Existing mock messages without `readByAdmin` are treated as unread; for already answered `mockChats` threads, the flag can be set immediately so that the counter does not appear at startup.

## Open Questions

None — the decisions affecting the specifications, approach, and task set are made above.
