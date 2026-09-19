## Context

See `proposal.md` — Why. The current state and constraints that determine the approach:

- Project: Next.js 13.5 (App Router), React 18, Tailwind CSS **3.3.3**, Radix UI, `cn` via `tailwind-merge`. Tailwind 3.3 does not contain named `dvh` utilities (`min-h-dvh` appeared in 3.4), so the dynamic height is set with the arbitrary value `min-h-[100dvh]`.
- Hero (`app/(app)/page.tsx:67-85`): button container `flex flex-wrap gap-3`; the base `Button` class contains `whitespace-nowrap` (`components/ui/button.tsx:8`), and `size="lg"` gives `h-11 px-8`. At 320px the available inner width of the hero is ≈240px, so a button ≈320px wide overflows the section's `overflow-hidden` and gets clipped.
- Calendar (`app/(app)/calendar/page.tsx:77-111`): a group of 4 `size="icon"` buttons (40px) + `h2` with `min-w-[160px]` without wrapping; at 320px `scrollWidth` is greater than the container width.
- Dialogs (`components/ui/dialog.tsx:41`): `w-full max-w-lg` without side margins, without a height limit and without internal scrolling; Radix overlay primitives (`popover.tsx`, `select.tsx`) without `collisionPadding`.
- Chat (`components/features/ChatThread.tsx:122,134`): `Card` with `max-h-[600px] md:h-[600px]`, `CardContent` with `flex-1 overflow-hidden` without `min-h-0`, which is why `flex-1` does not shrink and the history's `overflow-y-auto` does not activate.
- Admin table (`components/features/AdminTable.tsx:329-408`): the outer `div.overflow-x-auto` around `Table`, which itself wraps the table in `overflow-auto` (double scrolling); 6 columns do not fit at 640px. `AdminTable.test.tsx` looks for the text `Сумма сбора` via `getByText` and the `Изменить` buttons via `getAllByRole`, so duplicating the markup (table + card list) will break the tests.
- Header (`components/layout/Header.tsx:154-158`): mobile navigation — `px-1.5`/`py-1.5`/`text-xs` (≈28px high) in `overflow-x-auto` without a scroll hint.
- Height/effects: `min-h-screen` in `app/(app)/layout.tsx:9` and `app/(auth)/login/page.tsx:38`; `hover:scale-[1.02]` in `components/features/BirthdayCard.tsx:47` without a `hover: hover` restriction.
- Strip (`components/features/WishBoard.tsx:304-312`): `overflow-x-auto` list of fixed cards without `scroll-snap` and without a visual hint; the `wishes` requirement preserves manual scrolling without auto-scroll.
- Tests: `vitest`, `@testing-library/react`, `happy-dom`; CSS media queries are not applied in the test environment, so hiding by breakpoints is safe for existing queries.

## Goals / Non-Goals

**Goals:**

- Eliminate horizontal page overflow and content clipping at 320–360px at the root cause, in specific components, with a defensive invariant at the root.
- Make dialogs and overlay elements usable on a narrow and short screen.
- Fix the chat's internal scrolling and the accessibility of the submit form with a long history.
- Make the admin table and navigation/strip usable on mobile without duplicating markup and without changing behavior fixed by tests and specs.

**Non-Goals:**

- Redesigning pages, changing data, business logic, display rules, and roles.
- Migrating to Tailwind 4, replacing Radix primitives or custom contexts.
- A card list for the admin table with duplicating markup (see Decision 6).
- Auto-scroll of the wish strip (prohibited by the `wishes` requirement).

## Decisions

### Decision 1: root-cause component fixes + a defensive invariant at the root

First the specific overflows are fixed (hero, calendar, table, dialogs), then a defensive `overflow-x-hidden` for `body` is added in `app/globals.css`.

- Why: protection at the root is useful as insurance against future regressions, but on its own it would mask bugs and clip legitimate local scrolling.
- Alternative — only `overflow-x-hidden` on `body`: rejected, it hides symptoms rather than causes.
- Alternative — only targeted fixes: also workable, but leaves a broad class of regressions; the combination is more reliable.

### Decision 2: hero — column wrapping and a multiline label

The button container gets `flex-col sm:flex-row`, the buttons get `w-full sm:w-auto px-5 sm:px-8 whitespace-normal h-auto min-h-11 py-2.5`; wrapping is enabled only on a narrow screen, on `sm+` the current appearance is preserved.

- Why: at 320px the inner width of the hero is ≈240px, and even a full-width button with `px-8` and a single line of ≈295px does not fit; wrapping the line is the minimal change without losing the meaning of the label.
- Alternative — shorten the button text to "Congratulate": rejected, the label carries the meaning "with money or a congratulation" and is mentioned in the FAQ texts.
- Alternative — reduce the button `size`: does not solve the 240px constraint and worsens tap-target accessibility.
- Consequence: `cn`/`tailwind-merge` already overrides `whitespace-nowrap` and `px-8` from the variant, so the fix is local.

### Decision 3: calendar — wrapping the group and compact arrows

The navigation group gets `flex-wrap items-center justify-center gap-2`, the arrows get `size="sm" className="h-8 w-8 shrink-0"`, `min-w-[160px]` is removed from `h2` and the text size is reduced on a narrow screen (`text-lg sm:text-xl` with `whitespace-nowrap`).

- Why: 4 buttons of 32px each + a heading ≈120px + paddings fit into the 288px page container of 320px; wrapping leaves a margin.
- Alternative — split the navigation into two rows (month / year): changes the familiar layout and is excessive.
- Consequence: the buttons remain 32×32px; the minimum tap target of 44px applies to the header's mobile navigation (see Decision 9); for the compact calendar arrows 32px is allowed as a secondary control with `title`/`aria-label`.

### Decision 4: calendar cells — a compact marker below `sm`

Below `sm`, a compact marker (emoji/dot) with a `title` of the full list of birthday people is rendered in the cell instead of the name; the names remain at `sm+`. The cell's `min-h` is preserved.

- Why: with a cell width of ≈33px the text "🎂Anna" is physically unreadable; the marker preserves the signal "there is a birthday", and the full name is available from the list of birthday people for the month below and from the `title`.
- Alternative — horizontal scrolling of the calendar grid: rejected, it creates nested scrolling and breaks the overview of the month.
- Alternative — increase the cell's `min-w`: leads to the overflow that is being eliminated.

### Decision 5: dialogs — a constraint at the level of the primitive

In `components/ui/dialog.tsx` the base `DialogContent` gets `w-[calc(100%-1.5rem)] max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain`. `PopoverContent`/`SelectContent` get `collisionPadding={8}`; the popover in `AdminTable` additionally gets `collisionPadding`, and `SelectContent` gets `max-w-[calc(100vw-2rem)]`.

- Why: a fix in the primitive repairs all dialogs (participation, amount change, wish change) with a single change and does not require repeating the classes in every host.
- Alternative — edit `className` in each usage: duplication and the risk of missing a dialog.
- Alternative — `max-h-[90vh]`: `vh` does not account for the dynamic address bar; `dvh` as an arbitrary value is available in 3.3.
- Consequence: `overflow-y-auto` on the dialog container does not conflict with `DayPicker` inside `Popover`, since the popover is rendered in a portal.

### Decision 6: admin table — hiding columns, a single container, compact controls

The table remains the only source of markup. The outer `div.overflow-x-auto` wrapper is removed (it is already provided by `Table`). The "Department" and "Birthday date" columns get `hidden md:table-cell`, the e-mail in the employee cell gets `hidden sm:block`. Below `sm` the labels of the "Gift" and "Edit" buttons are hidden (`hidden sm:inline`), and an `aria-label` is added for the accessible name; the cell paddings become `px-2 sm:px-4`.

- Why: `AdminTable.test.tsx` uses `getByText('Сумма сбора')` and `getAllByRole('button', { name: 'Изменить' })`; a card list would add duplicates to the DOM and break the uniqueness of the queries. Hiding via CSS does not remove nodes from the DOM and does not affect queries in happy-dom/tests.
- Alternative — a card list `<md`: rejected due to duplicating markup, double maintenance, and conflict with the tests.
- Consequence: on mobile, the department and birthday date are lost in the table, but the key data (name, e-mail, amount, statuses, action) is preserved; the full set is available at `md+`.

### Decision 7: chat — a definite height and `min-h-0` along the chain

The card root gets `h-[70dvh] md:h-[600px]`, `CardContent` gets `min-h-0`; the `min-h-0` chain is preserved on the inner row and columns, and the history remains `flex-1 overflow-y-auto`.

- Why: the cause of the defect is the absence of `min-h-0`, which is why `flex-1` does not shrink below the content and `overflow-y-auto` does not activate; without `min-h-0` any height constraint will not work.
- Alternative — only `min-h-0` without changing the height: on mobile the card may end up taller than the viewport, and the form will move off screen.
- Alternative — only `h-[70dvh]`: does not remove the cause of the incompressibility, scrolling will not activate.
- Consequence: on mobile the card occupies 70% of the dynamic screen height, which leaves the header visible and does not require scrolling the page to the form.

### Decision 8: recipient selection — width limit and label truncation

`SelectContent` gets `max-w-[calc(100vw-2rem)]` and `collisionPadding={8}`; `SelectItem`/`ItemText` get `min-w-0` and `truncate`; the full text of the option remains available via `title`. In `DonateDialog` the long label is preserved but visually truncated.

- Why: `truncate` gives predictable truncation instead of clipping without an ellipsis, and the width limit prevents the list from going outside the viewport.
- Alternative — a short label only on mobile (name only): the risk of losing the distinguishability of recipients with the same name; the e-mail and department are needed by the `donations` requirement.
- Consequence: at 320px the option shows the beginning of the label and an ellipsis, the full value comes from the `title` and from the confirmation steps.

### Decision 9: mobile navigation — tap target and scroll hint

Mobile navigation links get `min-h-[44px] py-2.5`, the container gets `snap-x snap-mandatory` and the items get `snap-start`; the continuation hint is implemented as a gradient mask at the right edge, visible only on overflow.

- Why: 44px is the generally accepted minimum touch target; `scroll-snap` makes scrolling predictable, and the gradient signals a continuation that is currently unnoticeable.
- Alternative — wrap the items onto a second row: increases the header height and takes space away from the content.
- Alternative — a "burger" menu: a larger change to product behavior, outside the scope of this change.
- Consequence: the gradient must not intercept clicks (`pointer-events-none`) and does not appear when all items fit.

### Decision 10: dynamic height, anchor, and hover

`min-h-screen` is replaced with `min-h-[100dvh]` in `app/(app)/layout.tsx` and `app/(auth)/login/page.tsx`; `scroll-mt-20` is added to the `#wish-board` section; `hover:scale-[1.02]` is replaced with the `hoverable:hover:scale-[1.02]` variant, where `hoverable` is a custom `@media (hover: hover)` variant in `tailwind.config.ts`.

- Why: `dvh` removes the height jump when the address bar is shown; `scroll-mt-20` compensates for the sticky `h-16` header with a margin; restricting hover effects with a media condition removes sticking on touch devices.
- Alternative — remove `hover:scale` entirely: the affordance on desktop is lost, the `responsive-layout` requirement allows the effect when hover is present.
- Alternative — `motion-safe`: relates to animations, not to the presence of a pointer; does not solve the sticking.
- Consequence: `hoverable` is added via the Tailwind plugin through `addVariant('hoverable', '@media (hover: hover)')`; the class `hoverable:hover:scale-[1.02]` is not applied on touch screens.

### Decision 11: wish strip — hint and stepwise alignment

The strip gets `snap-x snap-mandatory`, the cards get `snap-start`; a gradient hint about horizontal scrolling, visible only on overflow, is added to the container. `overflow-x-auto`, the fixed card width, and manual scrolling are preserved; auto-scroll is not added.

- Why: the `wishes` requirement explicitly prohibits auto-scroll and requires manual scrolling; `scroll-snap` improves manual scrolling without breaking keyboard accessibility.
- Alternative — scroll arrows: excessive for a strip of cards and duplicate gestures.
- Alternative — a progress-bar indicator: provides information about the position but does not signal the possibility of scrolling on the first screen; the gradient is cheaper and clearer.
- Consequence: the hint is implemented as a CSS gradient on the wrapper with `pointer-events-none`; in the test environment without CSS it does not affect queries.

## Risks / Trade-offs

- [Hiding table columns on mobile reduces the amount of data] → The department and birthday date are hidden only below `md`, the key fields and actions are preserved; the alternative full access is on tablet and desktop.
- [Hiding button text via `hidden sm:inline` and the accessible name] → An `aria-label` is added to the buttons so that on mobile they retain a meaningful name when the label is `display:none`.
- [The chat card with `h-[70dvh]` on mobile] → Leaves room for the header and allows the form to be visible; at `md+` the height is fixed at 600px, as before, which preserves the `support-chat` requirement about the visibility of the reply field.
- [`overflow-y-auto` on `DialogContent` may scroll the entire dialog] → This is expected and required by the spec; the header and footer scroll together with the content, the buttons remain reachable thanks to `max-h` and `dvh`.
- [Long recipient labels are truncated] → The full value is available via `title` and at the confirmation step, where the selected recipient is displayed.
- [The gradient hint at the screen edge may overlay content] → `pointer-events-none` and a small width of a few pixels; when there is no overflow the hint is not rendered.
- [Tailwind 3.3 without named `dvh` utilities] → Arbitrary values are used (`min-h-[100dvh]`, `max-h-[90dvh]`, `h-[70dvh]`), which pass through JIT.
- [Custom `hoverable` variant in the Tailwind config] → Changes the config but does not affect existing classes; the alternative — targeted media queries in `globals.css` — is less expressive.

## Migration Plan

The change is entirely client-side, data and API are not affected — there are no migrations, rollback is via revert. Fixes in the UI primitives (`dialog`, `popover`, `select`, `table`) and `tailwind.config.ts` affect all usage sites, so they should be made in a single commit together with the call sites, and afterwards run `npm run lint`, `npm run typecheck`, `npm test`, and a manual check at 320/360/640px.
