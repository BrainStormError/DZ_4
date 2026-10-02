## Why

The home page shows congratulations for the nearest past birthday date even when there are no birthday people today: currently such a placeholder was added "so the page would not be empty", but it is misleading — the user sees congratulations for a person whose birthday has already passed. At the same time, at narrow resolutions the footer caption and the upcoming birthdays grid break (names are truncated to one or two letters), while on wide screens the wish board uses only about a quarter of the available width, leaving a large empty field.

## What Changes

- **Congratulations are shown only on the birthday.** The wish board is built only from today's birthday people; the fallback to the nearest past date is removed. If there are no birthday people today, or there are no wishes for them yet, the board stays in place with an empty state, and the empty-state text stops referring to past dates.
- **The wish board uses the available width.** Wish cards stretch from the current minimum to the readable maximum, and the strip is centered when the cards do not fill the row. One strip, manual scrolling, and the scrolling hint are preserved; a grid of cards is not introduced.
- **The footer caption wraps neatly on narrow screens.** At small widths the brand and the caption "— collection for gifts to colleagues" stack centered instead of wrapping in a way where the caption begins with a dash on a new line.
- **Upcoming birthdays do not truncate names on mobile.** The grid of the "Birthday soon" block switches to one column on narrow screens; names stop being truncated at 320–414px.
- **BREAKING** for board behavior: wishes for a past birthday date are no longer displayed, and the requirement "Past birthday read-only" is removed from the spec.

## Capabilities

### New Capabilities

- none

### Modified Capabilities

- `wishes`: the rule for showing congratulations is limited to today's birthday; the requirement "Past birthday read-only" is removed; the empty-state behavior of the board and the stretching of strip cards to the available width are added.
- `birthdays`: the requirement for the grid of the "Birthday soon" block is strengthened — names are not truncated at any width from 320px, and on narrow screens the cards are placed one below another.
- `responsive-layout`: a requirement is added for wrapping the footer caption at a narrow viewport (without a hanging dash and without desynchronization with the icon).

## Impact

- Components: `components/features/WishBoard.tsx` (selection of board wishes, empty state, card widths and strip centering), `components/layout/Footer.tsx` (caption layout), `app/(app)/page.tsx` (columns of the "Birthday soon" grid).
- Logic: `lib/birthdays.ts` — `getBoardDate` loses the fallback to the nearest past date and the unused `date` field.
- Specifications: the deltas `wishes`, `birthdays`, `responsive-layout`.
- Tests: a unit test for the selection of board wishes (the project has vitest; board coverage is currently absent).
- Not changing: the data and mock set, the rules of monetary participation and contribution recipients, the hiding of amounts, roles, authorization, the administrator's date preview.
