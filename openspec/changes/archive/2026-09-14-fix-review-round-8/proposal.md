## Why

An in-depth check revealed five defects not closed by previous rounds: on desktop, the administrator reply field is clipped past the bottom edge of the chat card, which blocks the main task; the current date and theme are computed differently on the server and client, causing hydration desynchronization and forcing the entire tree to switch to client-side rendering; the congratulations strip risks looping rendering; modal dialogs may leave a scroll lock after navigating between sections (an open question from round-7).

## What Changes

- **The administrator reply field is always accessible.** In the chat with the administrator, the "Reply to employee..." field MUST remain visible and usable for input with any number of requests, including on desktop with a long employee list.
- **Consistent hydration of the current date.** The current date MUST be determined consistently on the server and client, so that hydration does not diverge in the date text and does not result in a full switch to client-side rendering.
- **Consistent hydration of the theme.** The active theme label MUST match the actually applied theme after loading, without a residual incorrect label due to masking the mismatch with `suppressHydrationWarning`.
- **Congratulations strip without rendering looping.** Detecting the strip's overflow and starting auto-scroll MUST NOT lead to repeated state update loops or main thread freezes.
- **Modal dialogs do not block the application during navigation.** Modal dialogs (participation, amount change, wish change) MUST NOT leave the page blocked after navigating between sections.

## Capabilities

### New Capabilities

- `hydration`: consistency between server-side rendering and client-side hydration for browser-dependent values — the current date and theme — without interface desynchronization and without forcing a switch to client-side rendering.

### Modified Capabilities

- `support-chat`: a requirement is added that the administrator reply field remains visible and accessible with any number of requests.
- `wishes`: a requirement is added that the congratulations strip detects overflow and starts auto-scroll without looping rendering.
- `app-shell`: a requirement is added that modal dialogs do not leave the page blocked after navigation. Note: the `app-shell` capability was introduced in `fix-review-round-7` and awaits archiving; the delta in this change supplements it.

## Impact

- Components: `components/features/ChatThread.tsx`, `components/features/WishBoard.tsx`, `components/features/DonateDialog.tsx`, `components/features/AdminTable.tsx`, `components/layout/ThemeSwitcher.tsx`.
- State providers: `lib/date-context.tsx`, `lib/theme-context.tsx`.
- Styles: `app/globals.css` (strip auto-scroll).
- Specifications: deltas for `hydration` (new), `support-chat`, `wishes`, `app-shell`.
- Not changed: persistence, backend, real authentication, amount hiding rules, data and display rules by birthday.
