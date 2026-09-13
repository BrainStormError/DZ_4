## Context

See `proposal.md - Why`. Relevant current state:

- All state is client-side and in memory: `DataProvider` wraps `AuthProvider` in `app/layout.tsx`, seeded from `lib/mock-data.ts`. There is no backend or persistence.
- "Now" is read ad hoc as `new Date()` in `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, and implicitly by `format(...)` calls. Nothing shares a single "today".
- `WishBoard` renders every wish in a plain grid with no date filtering; cards show only the recipient's first name and the author's nick.
- `DonateDialog` forces a non-empty congratulation text (`handleMessageSubmit` blocks empty) and always calls `addWish`.
- `mockUsers` already maps `email -> fullName`, so name resolution needs no data change.
- Available libraries: `react-day-picker@8` and `embla-carousel-react@8` are installed. `embla-carousel-autoplay` is NOT installed. No `components/ui/calendar.tsx` wrapper exists.
- Existing `birthdays` spec already warns that ISO dates parsed via `new Date()` can shift by a day in negative-offset timezones.

## Goals / Non-Goals

**Goals:**

- One shared, overridable "today" consumed by every date-derived view.
- A board selection rule driven by recipients' birthdays, with a nearest-past fallback.
- A single looping, color-coded congratulations feed that stays usable at 20+ entries.
- Money participation with or without a wish, with a role-neutral result screen.
- Clear "who congratulates whom" using real names plus retained corporate nick.
- Read-only, session-only admin date preview that never mutates real data.

**Non-Goals:**

- Persistence, backend, or server-side date handling.
- Deleting or bulk-moderating wishes.
- Changing the role model or the existing rule that sums stay hidden from employees.
- Reworking the birthday calendar's month/year navigation.

## Decisions

### 1. A dedicated `DateProvider` as the single source of "now"

Add `lib/date-context.tsx` exposing `useAppDate()` with `{ today, isPreview, previewDate, setPreviewDate, resetDate }`. `today` is a `Date` at local midnight. Default is the real local clock; when preview is active, `today` is the chosen day. Wrap it in `app/layout.tsx` inside `AuthProvider` so both header and pages can read it.

- Alternative: pass the date as a prop from each page. Rejected — the preview must propagate to the header indicator and the calendar at once.
- Alternative: a global mutable module variable. Rejected — React would not re-render on change.

### 2. ISO birth dates parsed as local calendar dates

Add a pure helper module (e.g. `lib/birthdays.ts`) with `parseIsoLocal(iso)` that splits `yyyy-mm-dd` and builds `new Date(y, m-1, d)`, plus `getBoardDate(today, users)` returning the selected date and the target users. All month/day comparisons use these local components. This mirrors the existing timezone requirement and avoids the UTC shift in `new Date('1990-09-13')`.

### 3. Board selection: today first, else nearest past date

```
targets = users where (month, day) == today        (today)
if targets empty:
    candidates = users whose birthday date < today  (this year's occurrence)
    d = max(candidate date)                         (nearest past)
    targets = users born on d
boardWishes = wishes where targetUserId in targets, sorted newest first
```

The nearest-past date is the single most recent birthday date; all employees born that day are included. If the resulting target set has no wishes, the board shows the empty state and does NOT fall through to earlier dates. Future occurrences are never eligible because a birthday equal to today is handled by the today branch and later dates are excluded from `candidates`.

- Alternative: fall through to the next-earliest date when the nearest has no wishes. Rejected per confirmed decision (empty state instead).

### 4. Looping feed via a CSS marquee, not a JS carousel

Render one track containing the board wishes twice, animate `translateX` from `0` to `-50%` with a linear infinite `@keyframes` for a seamless loop. Use `animation-play-state: paused` on `:hover`/`:focus-within`, and disable the animation under `@media (prefers-reduced-motion: reduce)`, leaving a natively scrollable container (`overflow-x: auto`).

- Alternative: `embla-carousel-react` with `loop: true`. Rejected as the primary mechanism because autoplay is a separate plugin that is not installed; a CSS marquee achieves smooth continuous scroll with less JS. Embla remains an option if manual drag is later required.
- Note: because the today and nearest-past cases share one component, both get the same looping behavior, satisfying the single-behavior decision.

### 5. Deterministic color per birthday person

Assign colors from a fixed palette by the recipient's index in a stable ordering (e.g. sorted by `fullName`). Apply color via inline `style` with a CSS custom property (`--person-color`) consumed by the card's border/ring and badge, rather than dynamic Tailwind class names, which Tailwind cannot generate at build time. The palette cycles when there are more people than colors.

### 6. Read-only preview enforcement at the action boundary

Gate writes on `isPreview` from `useAppDate()`:

- `WishBoard` submit button disabled and `handleSubmit` returns early.
- `DonateDialog` primary actions disabled and handlers return early.
- `AdminTable` `Сохранить` disabled and `handleSave` returns early.

A slim banner shows the preview date and a reset action, and the calendar page's today marker reads `useAppDate().today` so all three views agree. Session-only is achieved by keeping preview in React state with no `localStorage`.

- Alternative: hide all write controls entirely. Rejected — disabled controls with a banner explain why better than silently missing UI.

### 7. Optional congratulation step in `DonateDialog` without a second flow

Keep the existing `message` step but make it skippable ("Без пожелания" / "Пропустить") and allow empty submission; `handleConfirm` calls `addWish` only when `wishText.trim()` is non-empty. The confirm and success copy branch on whether text exists, so a money-only gift never claims a congratulation was sent.

- Alternative: a separate "send money only" flow. Rejected — duplication of recipient/email/amount steps.

### 8. Names rendered from existing mock data

Resolve author via `getUserByEmail` and recipient via `getUserById`; render `От: <fullName> (<nick>) → Кому: <fullName>`. Reuses existing data, no mock change. The `wishes` spec delta captures the new display contract.

## Risks / Trade-offs

- [The fallback set can be empty or unexpectedly old (e.g. January shows a December birthday)] → Empty state is explicit and the preview lets QA see any date; acceptable for a demo.
- [CSS marquee content is duplicated, so screen readers may announce wishes twice] → mark the duplicate track `aria-hidden="true"` and keep the first track as the accessible list; disable motion under `prefers-reduced-motion`.
- [Slow marquee makes the first card hard to read] → pause on hover/focus and keep animation duration long enough to read; exact duration is a tuning detail.
- [A preview date could leak into real records if a write slips through] → centralized `isPreview` guard at every write handler, plus read-only UI; preview state is not persisted.
- [Tailwind purge dropping dynamic color classes] → inline CSS variable instead of class interpolation.
- [Date comparisons regressing in negative-offset timezones] → centralize on the local ISO parser and forbid `toISOString()`/UTC comparisons for birthdays.

## Migration Plan

1. Introduce `lib/birthdays.ts` and `lib/date-context.tsx`; wire `DateProvider` into `app/layout.tsx`.
2. Migrate `app/(app)/page.tsx` and `app/(app)/calendar/page.tsx` to `useAppDate()`.
3. Update `WishBoard` (selection, names, form, feed) and `DonateDialog` (optional wish).
4. Add the admin preview control and banner; add write guards.
5. Update the hero sentence and run `npm run lint` / `npm run typecheck`.

Rollback: all changes are client-side and data-free; reverting the branch restores prior behavior with no data migration.

## Open Questions

- Exact marquee duration and the concrete palette hex values can be tuned during implementation without affecting specs or the approach.
