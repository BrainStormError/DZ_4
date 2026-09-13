## Context

See `proposal.md - Why`. Relevant current state:

- `components/features/WishBoard.tsx` renders the feed as one track containing the wish list twice inside `.wish-marquee-track` (`app/globals.css` animates it `translateX(0 -> -50%)`). The duplicate is a seam filler, but it is always in the DOM, so when the list is short (or `prefers-reduced-motion` disables the animation) the cards appear doubled and motion is imperceptible.
- `WishBoard` colors each wish card with `personColor(index)` from `lib/birthdays.ts`, assigned over `board.users` sorted by `fullName`. `components/features/BirthdayCard.tsx` instead renders the today ring as `ring-2 ring-primary`, so the colors diverge.
- `WishBoard`'s recipient `Select` lists every `mockUsers` entry except the current user. `components/features/DonateDialog.tsx` builds `recipientOptions = mockUsers.filter(u => u.id !== user?.id)`, so both free wishes and money accept any colleague, including past birthdays.
- All state is client-side, in memory, seeded from `lib/mock-data.ts` (`DataProvider` / `useDataStore`). There is no `giftSent` concept; `Donation` is `{ userId, totalAmount }`.
- `AdminTable` is already admin-gated and lists employee / department / sum / action.
- The project has no test suite; verification is `npm run lint` and `npm run typecheck` plus manual scenarios.

## Goals / Non-Goals

**Goals:**

- One feed that loops only when it must, never showing adjacent duplicate cards while static.
- One deterministic per-person color shared by the birthday card and the feed.
- Recipient eligibility rules expressed once and reused by the free-wish form and the money dialog.
- A minimal, admin-only gift status flag on existing donation data.

**Non-Goals:**

- Changing the board's date-selection rule (`getBoardDate` today-first, else nearest past).
- Adding persistence, a backend, or a gift "sent date".
- Reworking the admin sum-editing/refund flow or the chat.
- Introducing a JS carousel.

## Decisions

### 1. Feed loops only when content overflows

Render a single accessible list by default. Measure the list against the container (e.g. `scrollWidth > clientWidth` via a ref + `ResizeObserver`) and only when it overflows render the duplicated track with the existing CSS animation. When it fits, or when `prefers-reduced-motion` matches, render the single list as a static strip with `overflow-x-auto` for manual scroll.

- Alternative: keep the always-duplicated track and hide the copy under reduced motion. Rejected — a short list still shows both copies at once even while animating on wide screens.
- Alternative: `embla-carousel-react` with `loop`. Rejected — autoplay is a separate uninstalled plugin and it adds JS for behavior CSS already provides.
- Consequence: the animation class must be applied conditionally (a "looping" modifier), and the duplicated copy must only exist in loop mode.

### 2. One shared per-person color

Keep `BIRTHDAY_PALETTE` / `personColor` in `lib/birthdays.ts` and add a helper that maps a user list to colors over a stable ordering (sorted by `fullName`). Use it in `WishBoard` (as today) and on the home page, passing the resolved color into `BirthdayCard`. `BirthdayCard` uses the passed color for the `isToday` ring/outline instead of `ring-primary`.

- Alternative: derive the color inside `BirthdayCard` from the user id. Rejected — the assignment must be identical to the feed's ordering, so a single shared function is safer.
- Alternative: keep `ring-primary` and recolor the feed to the theme accent. Rejected — the specs require a color pinned per birthday person and different people to be distinguishable.

### 3. Centralized recipient eligibility helpers

Add pure helpers in `lib/birthdays.ts`:

```
getTodayBirthdays(today, users)    -> users whose (month, day) == today
hasBirthdayNotPassed(today, user)  -> this year's occurrence >= today
getCongratulatableUsers(today, users) -> users where hasBirthdayNotPassed, excluding self
```

`WishBoard` uses `getTodayBirthdays` for its recipient list and disables the entry control when empty (the board may still show the nearest-past filler). `DonateDialog` uses `getCongratulatableUsers` for `recipientOptions`. Both reuse `parseIsoLocal` so timezone handling stays consistent.

- Alternative: inline filters in each component. Rejected — the rules must stay identical and testable in one place.

### 4. Gift status as a boolean on the donation record

Extend `Donation` with `giftSent: boolean` (default `false`, seeded in `mock-data.ts`) and add `setGiftSent(userId, sent)` to `useDataStore`. `AdminTable` gains a "Дата рождения" column (`format(parseIsoLocal(birthDate), 'd MMMM yyyy', { locale: ru })`) and a "Подарок" column with a manual toggle showing «Выслано» / «Не выслано». The status stays admin-only because `AdminTable` is already admin-gated; employees never render it.

- Alternative: a separate `GiftStatus[]` store. Rejected — overkill for one boolean keyed by `userId`.
- Assumption (per user): no sent date is stored; if needed later, add `giftSentAt` without changing behavior.

### 5. Copy fixes

Remove the footer statement in `components/layout/Footer.tsx`; the hero sentence in `app/(app)/page.tsx` remains the single voluntary-participation source. Update the FAQ author answer in `app/(app)/faq/page.tsx` to describe `Фамилия Имя (ник)`.

## Risks / Trade-offs

- [Measuring overflow in React can flash the wrong state before the first measurement] → default to the static single list (safe, no duplicates) and promote to loop mode only after layout is measured in an effect.
- [Duplicated track announced twice by screen readers] → keep `aria-hidden` on the copy and only mount the copy in loop mode.
- [Color mismatch if the two lists order users differently] → assign colors through the same shared helper (sorted by `fullName`) on both screens.
- [Gift status resets on reload] → acceptable for the in-memory demo; consistent with all other state.
- [Disabling the free-wish control on birthday-less days could look like a defect] → show a short explanatory hint next to the disabled control, matching the "заранее только деньгами" rule.

## Migration Plan

All changes are client-side and data-free. Implement the helpers first, then the components, then the admin column. Rollback is reverting the change branch; there is no data migration.

## Open Questions

- Exact marquee speed and the reduced-motion threshold can be tuned during implementation without affecting specs or the approach.
