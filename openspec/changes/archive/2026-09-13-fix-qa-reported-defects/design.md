## Context

A client-side Next.js 13 (App Router) demo on mock data; participation, wish, and chat state lives in React contexts (`lib/data-context.tsx`, `lib/data-store.ts`) without a backend. See `proposal.md` — Why. Key feature: `DonateDialog` already accepts `targetUser`, but when launched from the home page `null` is passed, and `handleConfirm` silently exits when `!targetUser`. Additionally: `app/(app)/page.tsx` hardcodes the date, `AdminTable` does not check the sign of the new amount, and avatars are pulled from the external `i.pravatar.cc`, which periodically responds with `ERR_CONNECTION_RESET`.

Project constraint: `openspec/specs/` is empty; the specifications currently exist as deltas in the unclosed change `fix-known-gaps`. The `donations`, `birthdays`, `support-chat` paths coincide, so the wording of this change must be layered on top of them during synchronization.

## Goals / Non-Goals

**Goals:**

- Make the participation scenario completable from anywhere: the recipient is mandatory and explicitly selected, without `undefined` and silent no-ops.
- Reduce the displayed sender, the wish author, and the account to one person.
- Validate the participation amount and the admin amount change strictly, without `parseInt` truncation.
- Tie the calendar's "today" and starting month to the real local date.
- Remove grammatical errors and ensure header accessibility and avatar resilience.

**Non-Goals:**

- No persistence is introduced (localStorage/backend) — the data still lives in the session memory.
- The role model, authorization, and the `@company.com` login rule are not changed.
- The visual concept and themes are not reworked.

## Decisions

1. **The recipient is selected explicitly; the dialog does not open "into the void".**
   A recipient selection step (`step: 'recipient'`) is added to `DonateDialog`, which becomes the first step when `targetUser` is not set. From a birthday person's card, the dialog opens directly at the email step with the recipient already selected. `targetUser` stops being nullable at the `amount/message/confirm` steps; the transition buttons are disabled until a recipient is selected.
   - Why: this keeps the main CTA working (unlike simply disabling the button) and removes `undefined` from the templates.
   - Alternative: forbid `handleDonate()` without a recipient — rejected, the main CTA would become dead.

2. **The sender's email must match the current user.**
   When the email step opens, the field is prefilled with `user.email`, and `handleEmailSubmit` additionally checks that the normalized addresses are equal and shows an error on a mismatch. The wish author remains `user.email`.
   - Why: closes sender spoofing and the discrepancy between "From:" and the actual author.
   - Conflict: `fix-known-gaps/specs/auth/spec.md` and its `donations` scenario allow any existing `@company.com` address. This change narrows the rule to the current user; when archiving both changes, the wording in `auth` must be reconciled.
   - Alternative: attribute the wish to the entered email — rejected due to the possibility of impersonating a colleague.

3. **Strict parsing of the amount as a positive integer.**
   Instead of `parseInt(amount, 10) || 0`, a helper `parsePositiveInt(raw)` is introduced, which accepts only `/^\d+$/` (after `trim`), rejecting `1e3`, `12.5`, `-5`, `+5`, `0x10`, empty, and any value with `e/E./-/+`. The `Infinity`/overflow value is cut off by `Number.isSafeInteger`. The input remains `type="number"` with `min="1"` and `step="1"` for the mobile keyboard, but the decision is made on the raw string.
   - Why: `type=number` in Chromium allows `e`, and `parseInt` truncates.
   - Alternative: switch to `type="text"` + `inputMode="numeric"` — left as a fallback if the behavior of `number` gets in the way.

4. **A wish without a contribution — only through the wish board.**
   The text at the email step is reformulated: the promise of participation without funds is removed and a reference to the "Leave a wish" button is added. The amount remains mandatory and positive.
   - Why: matches the product owner's decision; the dialog must not duplicate the board.

5. **Admin amount change — a non-negative integer.**
   `canSave` is supplemented with a `parseNonNegativeInt(editAmount)` check; negative and non-numeric values are not saved, and "Save" is disabled. The reason and comment remain mandatory; zero is allowed.
   - Why: a negative collection is meaningless and breaks the display.
   - Alternative: forbid only negative values but not check the format — rejected, `1e3` would again cause truncation.

6. **The real date is computed on the client after mounting.**
   Home page: `today` is taken from `new Date()` (local `getMonth()/getDate()`), not from the string `2026-09-13`. Calendar: the starting `year/month` are initialized with the current ones. Since client components are prerendered on the server, the date values are initialized stably and updated in `useEffect` after mounting to avoid a hydration mismatch and dependence on the server time zone. Birthday comparison is performed by the local calendar day.
   - Why: the server and client time zones may differ.
   - Alternative: `new Date()` directly in the `useState` initializer — risk of a hydration discrepancy.

7. **Grammar through neutral constructions and a single pluralization helper.**
   Where the genitive case of a name is required, a construction without declension is used: `Recipient: Anna Smirnova` instead of "for Anna Smirnova". For the birthday person counter, `pluralizeRu(n, ['именинник','именинника','именинников'])` is added, and for months, an array of prepositional forms ("in September").
   - Why: avoid pulling in a morphological engine and storing a declension map of all names.
   - Alternative: a case map for 12 employees — fragile and does not scale.

8. **Accessible header names.**
   The `ThemeSwitcher` and user menu triggers receive an `aria-label` ("Change theme", "User menu: <Full Name>") independent of `hidden sm:inline`.
   - Why: the accessible name must not depend on a media query.

9. **Avatars without the external network.**
   `avatarUrl` in `lib/mock-data.ts` is switched to local files in `public/avatars/*`, generated/exported at the implementation stage, or (as a fallback) to a deterministic inline SVG with initials. `AvatarImage` remains with `AvatarFallback` based on initials.
   - Why: network errors from the external host cannot be suppressed from the application, and the specification requires the absence of unhandled errors.
   - Trade-off: the source of the photos changes from a product perspective; to preserve the appearance, the images must be vendored once.
   - Alternative: keep `i.pravatar.cc` — rejected, does not pass the console requirement.

## Risks / Trade-offs

- [Conflict with `fix-known-gaps` over the participation email] → During archiving, first reconcile the `auth`/`donations` delta; record the narrowing of the rule "address = current user" in both changes.
- [Hydration mismatch due to `new Date()`] → Initialize with a stable value and update in `useEffect`; avoid rendering the date on the server.
- [Avatar vendoring unavailable offline] → Fallback inline SVG with initials; `AvatarFallback` already covers the display.
- [Numeric input on mobile] → Keep `type="number"`/`inputMode`, but validate the string; if problems arise, switch to a text field with `pattern`.
- [Grammar via neutral constructions may remain in other places] → Add a full pass over the user-facing texts of the affected pages to the tasks.
