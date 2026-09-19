## Context

See `proposal.md` — Why. Current state affecting the approach:

- The administrator chat (`components/features/ChatThread.tsx`) is a card with `max-h-[600px]` and `overflow-hidden`, an inner row with `h-full`, and the employee list on desktop `md:max-h-none`. With many threads, the list grows to full height, and the bottom block with the reply field is clipped.
- The current date is set in `lib/date-context.tsx` as `useState(() => startOfDay(new Date()))` — the value is computed during SSR and during hydration at different moments/time zones, which produces a mismatch in the date text and forces the entire tree to switch to client-side rendering.
- The theme is set in `lib/theme-context.tsx` as `useState(readDomTheme)`, where the initializer reads `document.documentElement.getAttribute('data-theme')`. The inline script in `app/layout.tsx` already sets `data-theme` before hydration, and the theme label in `ThemeSwitcher` is marked with `suppressHydrationWarning`, which masks the mismatch.
- The congratulations strip (`components/features/WishBoard.tsx`) determines overflow via `ResizeObserver` + `setIsOverflowing` and duplicates the list for the marquee; a loop of "measurement → state → DOM change → measurement" is possible.
- Modal dialogs (`DonateDialog`, "Change amount" in `AdminTable`, "Change wish" in `WishBoard`) use the modal Radix `Dialog`, which sets scroll and pointer lock on `<body>`; when navigating with an open dialog, the lock may get stuck.
- The `app-shell` capability was introduced in `fix-review-round-7` and awaits archiving; the delta of this change supplements it.

## Goals / Non-Goals

**Goals:**

- Make the administrator reply field accessible with any number of requests.
- Eliminate the mismatch of date and theme between server-side rendering and hydration without forcing client-side rendering.
- Prevent the congratulations strip rendering from looping.
- Prevent the scroll lock from getting stuck after navigation with an open modal dialog.

**Non-Goals:**

- Persistence, backend, real authorization; state remains client-side.
- Replacing the custom `theme-context` with `next-themes` (not required to fix the defect).
- Changing the rules for displaying wishes, hiding amounts, and the themes themselves.
- Abandoning the modality of dialogs (modality is preserved).

## Decisions

### Decision 1: the reply field gets a definite card height

The problem is that `h-full` inside the card does not resolve: `CardContent` has no definite height (only `flex-1`), so the row grows under the list and the bottom block is clipped. The cure is to give the card a definite height on desktop and a `min-h-0` chain.

- Why: with a definite height, percentage heights resolve, and the list's `overflow-y-auto` starts working, and the list scrolls within its area.
- Alternative — limit only the list (`md:max-h-[…]`): treats the symptom but leaves a fragile height chain and requires selecting a magic height for the header.
- Consequence: the card gets `md:h-[600px]`, the inner row and columns get `min-h-0`; the request list and the message block scroll independently, the reply field stays at the bottom.

### Decision 2: the current date is computed only on the client

`DateProvider` initializes `realToday` with a stable value, the same for the server and the first client render, and sets the real date in `useEffect` after mounting.

- Why: the server and the first client render match, so there is no date text mismatch; then the effect sets the correct local date.
- Alternative — `suppressHydrationWarning` at every date output location: rejected, since the mismatch causes the entire tree to switch to client-side rendering, and the date is used in many blocks.
- Consequence: a brief date update after mounting is acceptable; the application is already wrapped in `AuthGate`, so the visible difference is minimal.

### Decision 3: theme — start with the default theme + restore effect

`ThemeProvider` initializes state with the default value (matching SSR), and in `useEffect` reads the already set `data-theme` and updates the state.

- Why: the default value matches on the server and client — there is no mismatch; the effect sets the real theme, and since the value changes, the re-render corrects the label.
- Alternative — switch to `next-themes` (already in dependencies): solves the same problem in a standard way, but requires rebuilding `ThemeProvider`/`ThemeSwitcher` for the library API; deferred as unnecessary for the defect.
- Consequence: the dependency on `suppressHydrationWarning` as a "mask" is removed; the label always matches the applied theme.

### Decision 4: strip — stabilizing overflow measurement

First reproduce the loop, then protect the measurement: functional update `setIsOverflowing(prev => …)` with an explicit comparison, batching calls via `requestAnimationFrame`, and observing only the container, not the list.

- Why: the source of "measurement → state → DOM → measurement" and boundary oscillation at the threshold is eliminated.
- Alternative — remove the marquee: contradicts the `wishes` requirement for auto-scroll on overflow.
- Consequence: the strip remains, but overflow is detected without looping.

### Decision 5: dialogs — close on route change, modality is preserved

Dialogs remain modal, but on route change (`usePathname`) they close so that Radix correctly releases the `<body>` lock.

- Why: modality is needed for focus and `aria-modal`; closing on route change eliminates the lock getting stuck rather than masking it.
- Alternative — `modal={false}`: rejected, breaks focus trapping and the semantics of a modal dialog.
- Alternative — manually reset `<body>` styles after navigation: treats the symptom and requires knowing all navigation points; acceptable as a safety net, but not as the main solution.
- Consequence: each dialog host gets an effect that closes it on path change.

## Risks / Trade-offs

- [Dependency on round-7 archiving] → The `app-shell` delta supplements the capability introduced in `fix-review-round-7`. Archiving round-7 must precede archiving this change, or the deltas are applied together.
- [Brief date update after mounting] → May cause one date re-render; acceptable, since the content is wrapped in `AuthGate` and the mismatch is not visible to the user.
- [Non-modal header menus were already done in round-7] → This change does not roll back `modal={false}` for header menus; it only extends the protection to modal dialogs.
- [The strip bug is not confirmed statically] → It is reproduced first; if the loop is not reproduced, only protective stabilization is applied, rather than a change in the strip's behavior.
- [Change in chat card height] → May affect the mobile layout; on mobile the card keeps `max-h`, and the height constraint is applied only on desktop.

## Migration Plan

The change is entirely client-side and non-persistent — there are no data migrations, and rollback is via revert. The chat layout and the date/theme providers change atomically; no separate deployment sequence is required.
