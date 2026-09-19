## Why

A QA run of the "Korporodarki" application (home page, calendar, FAQ, admin panel, login) revealed a number of defects: the main participation CTA opens the scenario without a recipient and shows "undefined", the entered email may not match the account, amounts are accepted in scientific notation and with a negative value, and "today" and some texts are hardcoded or grammatically incorrect. The correct behavior needs to be recorded in the specifications and then the discrepancies must be eliminated.

## What Changes

- **Mandatory recipient in the participation scenario.** The "Congratulate / send funds" button on the home page MUST require selecting a birthday person; without a selected recipient, the participation steps are unavailable, and the text MUST NOT contain `undefined`. **BREAKING** for the current scenario from the home page.
- **Single sender identity.** The email in the participation dialog MUST match the current user's account; the confirmation step and the wish author MUST NOT diverge.
- **Strict amount parsing.** Only a positive integer in ordinary notation is accepted; scientific notation (`1e3`), fractional, zero, and negative values are rejected without `parseInt` truncation.
- **Correct participation copy.** The promise to "congratulate with a wish without sending funds" is removed from the participation dialog; a wish without a contribution is sent via the existing "Leave a wish" button on the board.
- **Validation of the admin amount change.** The new amount MUST be non-negative; negative, empty, and non-numeric values are not saved.
- **Role-based success screen.** An administrator sees confirmation of the amount being added, not text about a congratulation delivered to the birthday person.
- **Real current date.** The hardcoded date `2026-09-13` is removed: "today" and the calendar's starting month are computed from the system date taking the local time zone into account.
- **Texts and grammar.** Cases and forms are corrected: "for Anna Smirnova", "in September 2026", "2 birthday people", "warm attention".
- **Mobile header accessibility.** The theme switcher and the user menu receive accessible names (`aria-label`) when the text label is hidden.
- **Avatar resilience.** When the loading of external avatars fails, the interface shows initials and does not generate errors in the console.

**Out of scope:** persisting wishes, contributions, and chats across reloads remains a known limitation of the in-memory demo (no persistence is introduced).

## Capabilities

### New Capabilities

- `donations`: the participation scenario in the collection — mandatory recipient, sender identity, strict amount validation, role-based result, and correct copy; admin amount change without negative values.
- `birthdays`: "birthday people today" and the calendar based on the real system date with the correct local time zone, number forms, and starting month.
- `support-chat`: FAQ content (texts and grammar of the frequently asked questions section).
- `accessibility`: accessible names of the interactive header elements in the mobile layout.
- `avatars`: avatar display with a correct fallback when the external source is unavailable.

<!-- There are no existing specifications in openspec/specs/, so we do not list the modified capabilities. The donations/birthdays/support-chat paths coincide with the not-yet-archived change fix-known-gaps and are merged during synchronization. -->

## Impact

- `components/features/DonateDialog.tsx` — recipient, sender identity, amount parsing and validation, copy, role-based success screen.
- `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx` — real date, starting month, navigation, and texts.
- `components/features/AdminTable.tsx` — validation of the new amount and the change log.
- `components/features/WishBoard.tsx` — reconciling the author label with the current user.
- `app/(app)/faq/page.tsx` — FAQ answer text.
- `components/layout/Header.tsx`, `components/layout/ThemeSwitcher.tsx` — accessible names.
- `lib/mock-data.ts` and/or the image configuration — avatar source and fallback.
- The change adds no external APIs or dependencies; the application remains a client-side demo on mock data.
