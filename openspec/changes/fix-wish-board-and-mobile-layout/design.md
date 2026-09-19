## Context

See `proposal.md` — Why. Current state and constraints that determine the approach:

- Project: Next.js 13.5 (App Router), React 18, Tailwind CSS 3.3.3, Radix UI, `cn` via `tailwind-merge`; the custom `hoverable` variant (`@media (hover: hover)`) has already been added by the plugin in `tailwind.config.ts`. There are no named `dvh`/`text-balance` utilities in 3.3.3 — arbitrary values and arbitrary variants are used when needed.
- Selection of board wishes: `lib/birthdays.ts:31` `getBoardDate(today, users)` returns today's birthday people, and if there are none — everyone born on the nearest past date. The only consumer is `components/features/WishBoard.tsx:53`; the `BoardDate.date` field is read nowhere (verified by grep for `getBoardDate`), that is, the whole fallback branch exists only for the placeholder.
- The board strip (`WishBoard.tsx:329-351`): `ul.flex.w-max.gap-4.pr-4` and `li.w-[280px] sm:w-[320px].shrink-0.snap-start`; the overflow detection (`WishBoard.tsx:96-101`) compares the right edge of the last card with the right edge of the scroller, and on overflow a gradient hint is shown (`:345`).
- Footer (`components/layout/Footer.tsx:8-12`): a single `div.flex.items-center.gap-2` with an icon, the brand, and a description; the outer `justify-between` is useless, since there is only one child.
- The "Birthday soon" grid (`app/(app)/page.tsx:154`): `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, up to 4 cards (`slice(0, 4)`).
- Measurements in the live app (09/16/2026, widths 320–1920): at 1440px the board strip is 1216px and one card is 320px — about 26% of the width is occupied (336px of 1216px used); the footer description at 320px wraps and the line begins with a dash (the block is 40px versus 20px on one line, the dash requires 189px with 175px available); in the upcoming birthdays grid the name "Ekaterina Lebedeva" requires 143px with 56px available at 320px and 76px at 360px — 3 of 3 names are truncated at 320–375px and 2 of 3 at 414px, while from 640px there is no truncation.
- Tests: `vitest`, `@testing-library/react`, `happy-dom`; media queries are not applied in the test environment, so visual thresholds are checked manually, and pure logic — by a unit test.
- Spec constraints: `wishes` forbids an "expanding grid" and auto-scroll of the strip and requires manual scrolling with a hint; `ui-consistency` requires a single primary wish control (on the home page this is the button in the hero, the built-in board button is not rendered because `formOpen` is passed).

## Goals / Non-Goals

**Goals:**

- Stop showing wishes for past birthday dates, without leaving the page and section without an explanation.
- Make the wish board use the available width so that a single wish does not leave a one-sided empty field, while keeping one strip, manual scrolling, snap, and the hint.
- Ensure readability of the footer and the names in the upcoming birthdays block starting from 320px.
- Preserve verifiability: the board display rule is extracted into a pure function and covered by a unit test.

**Non-Goals:**

- A grid of wish cards and auto-scroll of the strip (forbidden by the `wishes` spec).
- Changing the rules of monetary participation, the list of contribution recipients, the visibility of amounts, roles, and the date preview mode.
- Redesigning pages, replacing UI primitives, migrating to Tailwind 4.
- Changing the composition of the displayed data (the number of cards in the upcoming birthdays block remains the same).

## Decisions

### Decision 1: selection of board wishes — only today's birthday people

`getBoardDate` is reduced to selecting employees whose birthday is on the current date (in effect — to the existing `getTodayBirthdays`), the fallback branch and the `BoardDate` type with the unused `date` field are removed. The board component stops depending on a "selected date" and works from a single list of birthday people.

- Why: the cause of the defect is precisely the fallback; removing the branch eliminates both the placeholder and the dead field and the extra level of indirection.
- Alternative — keep `getBoardDate` but return an empty list: the name and signature continue to promise date selection, and the `date` field remains dead.
- Alternative — filter wishes directly in the component: the display rule is smeared across the UI and becomes uncoverable by a unit test.
- Consequence: a wish becomes visible again on the recipient's birthday; the data does not change.

### Decision 2: the empty state remains inside the section

The board section and the title are preserved, and the reason for the emptiness is explained by the text: no birthday people — "wishes are available on the birthday"; there are birthday people but no wishes — an invitation to leave the first one.

- Why: the section serves as an anchor point for the "Leave a wish" button from the hero (`#wish-board` anchor), and its disappearance would make navigation by the anchor meaningless.
- Alternative — hide the section on days without birthday people: the chosen anchor and the hero hint lose their target.
- Alternative — show the board only when wishes exist: the invitation to leave the first wish on the birthday disappears.
- Consequence: the empty-state text referring to "the nearest past birthdays" is removed.

### Decision 3: strip cards stretch within the readable maximum

The card gets the base (minimum) width of the current level — 280px on mobile and 320px from `sm` — and grows with the strip up to a maximum of about 520px. The strip remains a `w-max` block, but gets `min-w-full`, and its content is centered when it does not fill the row: on overflow the strip width equals the sum of the cards' base widths, there is no free space, so centering does not create an unreachable left part.

- Why: growth to the maximum closes the "hole" on a wide screen while preserving a readable line length; centering turns the remainder into symmetric margins instead of one-sided emptiness.
- Alternative — fixed widths per breakpoint (`lg:w-[440px] xl:w-[500px]`): simpler, but with one or two wishes one-sided emptiness remains, and fewer cards fit in the row than the width allows (3 instead of 4 at 1440px).
- Alternative — a grid of cards: directly forbidden by the `wishes` requirement.
- Alternative — stretch the card to the full strip width without a maximum: with a 1216px strip the text line becomes unreadably long.
- Consequence: with 5+ cards the behavior does not change (minimum width, manual scrolling, hint); snap and keyboard accessibility are preserved.

### Decision 4: the footer caption wrap threshold — `sm`

By default the footer becomes a column with centering (the icon and brand on one line, the description below them), and from `sm` it returns to one line.

- Why: the `sm` threshold does not depend on font metrics, zoom, or future text edits.
- Alternative — wrap only below 360px (`min-[360px]:flex-row`): keeps one line at 360–639px, but the margin at 320px is only ~14px, so a font, zoom, or text change breaks the "hanging dash" line again.
- Consequence: on phones the footer becomes one line taller; this is a conscious cost for robustness.

### Decision 5: upcoming birthdays grid — one column up to `sm`

The layout changes to `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.

- Why: the measurements show name truncation precisely up to 640px; one column gives the name the full card width, and from 640px two columns are already enough (143px is needed out of 286px available).
- Alternative — `min-[480px]:grid-cols-2`: at 414px the card is 181px, and the longest name is still truncated (2 of 3 names), that is, the requirement is not met.
- Alternative — reduce the font or hide part of the name: worsens readability instead of eliminating the cause.
- Consequence: on mobile the section is longer by 3 rows of compact cards (~80px each); the data composition does not change.

### Decision 6: a unit test for the board display rule

A test is added for the pure function of selecting birthday people and for filtering wishes by recipients: today's birthday person is visible, a wish for a past date is not shown.

- Why: after Decision 1 this is new pure logic, and media queries are not applied in the test environment, so visual thresholds cannot be checked this way.
- Alternative — only a manual check: a regression of the display rule (the return of the placeholder) will not be caught automatically.
- Consequence: the test does not depend on the launch date (the date is passed as an argument).

## Risks / Trade-offs

- [Centering the strip may make the left cards unreachable on overflow] → The strip width on overflow equals the sum of the cards' base widths, there is no free space, so centering does not create a negative offset; verified with 6+ wishes and at widths 320/360/640/1024/1440.
- [Flexible card widths may break the overflow detection and the hint] → The detector compares the right edge of the last card with the container edge and does not depend on the card width; check: with 1–4 wishes there is no hint, with 6+ there is one.
- [The column footer on phones adds a line] → Compensated by robustness to fonts and zoom and by the absence of a "hanging" dash.
- [One column of upcoming birthdays lengthens the home page on mobile] → The cards are compact, the section remains within one or two screens; shortening the list would be a loss of data.
- [On days without birthday people the page becomes shorter] → The empty state explains the rule, and the board section follows immediately after the hero hint; the decision is product-confirmed.
- [Removing `BoardDate` affects an exported type] → There are no other imports of `getBoardDate`/`BoardDate` (verified by a repository search); the type is used only inside `birthdays.ts` and `WishBoard.tsx`.
- [The measurements were made on the current mock name set] → The longest name sets the threshold; if longer names are added, one column up to `sm` remains correct, since the width margin at 320px is more than 200px.

## Migration Plan

The change is entirely client-side: data, persistence, and the API are unaffected, there are no migrations, and rollback is a commit revert. Order of application: (1) the board display rule and removal of the fallback, (2) the layout of the board cards, (3) the footer, (4) the upcoming birthdays grid, (5) the test. After the edits — `npm run lint`, `npm run typecheck`, `npm test` and a manual check at 320/360/414/640/1024/1440px with 1, 2, 4, and 6 wishes, including a day with birthday people and a day without them (including via the administrator's date preview).
