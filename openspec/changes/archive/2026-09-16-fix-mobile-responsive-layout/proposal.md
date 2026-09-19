## Why

On narrow screens (320–360px) the application breaks: the CTA and month navigation overflow the card and create horizontal scrolling of the whole page, the amount-change dialog does not fit the screen height and does not scroll, and the chat with a long conversation "releases" the input form outside the card by ~813px. The user cannot see a button in full, reach the reply field, or read long labels, and some links of the mobile menu are hidden behind the edge without a scroll indicator. This blocks the main scenarios (congratulate, reply in chat, change the amount) on phones and tablets.

## What Changes

- **General narrow-screen invariants.** The page MUST NOT get horizontal scrolling because of the content; a defensive `overflow-x-hidden` is added to `<body>`, and any "drop-down" element (dialog, popover, select) MUST fit within the viewport.
- **Hero CTA.** The hero buttons MUST wrap onto separate lines on mobile and occupy the available width instead of the fixed 320.6px with `whitespace-nowrap`; at 320px the text is not clipped.
- **Calendar navigation.** The group of month/year buttons MUST wrap or shrink at 320–360px without horizontal scrolling; `min-w-[160px]` is removed from the heading, the arrows become `size="sm"`.
- **Calendar cells.** On screens `< sm` the names of birthday people MUST NOT be rendered in a form clipped to a single letter; instead, a dot/emoji with an accessible `title`.
- **The "Birthday soon" grid.** The layout MUST be `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` so that names are not clipped at `sm`.
- **Dialogs.** `DialogContent` MUST have side margins (`w-[calc(100%-1.5rem)]`), a height limit `max-h-[90dvh]`, and internal scrolling (`overflow-y-auto overscroll-contain`); the header and footer remain accessible.
- **Chat.** The chat card MUST keep the input form inside itself and enable history scrolling: `min-h-0` in the flex chain and a dynamic height instead of `max-h-[600px]`.
- **Admin table.** At `< md` the table MUST be replaced by a card list or hide the secondary columns; the mandatory horizontal scroll and the double nested `overflow-x-auto` wrapper are removed, the "Action" column remains accessible.
- **Mobile menu.** The links MUST have a tap target ≥ 44px and an explicit hint about horizontal scrolling (`scroll-snap`/gradient) — currently "FAQ"/"Admin" slide off the edge without an indicator.
- **Recipient selection.** Long option labels MUST be truncated with `truncate` with the full text accessible, and `SelectContent` MUST NOT go outside the viewport (width limit, short labels on mobile).
- **Popover with DayPicker.** `align="end"` MUST get `collisionPadding` so as not to go outside the left edge at ≤320px.
- **Height units.** Instead of `min-h-screen`, `min-h-dvh` is used (`login/page.tsx`, `app/(app)/layout.tsx`) — without a jump when the address bar is shown/hidden.
- **Wish board anchor.** The `#wish-board` section MUST have `scroll-mt-20` so that the heading does not hide under the sticky header.
- **Hover and strip.** `hover:scale-[1.02]` is applied only on devices with hover; the wish strip gets `scroll-snap` and a visual hint, remaining scrollable manually.

## Capabilities

### New Capabilities

- `responsive-layout`: end-to-end invariants of the narrow viewport — no horizontal page scrolling, dialogs/popovers/selects fitting within the viewport, dynamic height units, anchor-section offset under the sticky header, and hover effects applied only to devices with hover.

### Modified Capabilities

- `birthdays`: month/year navigation and the contents of the calendar cells MUST remain readable and not create horizontal scrolling at 320–360px; the grid of upcoming birthday people MUST wrap without clipping names.
- `app-shell`: mobile navigation MUST show all available links and hint at horizontal scrolling instead of hiding some items behind the edge.
- `accessibility`: interactive elements of the mobile navigation MUST have a minimum tap target of 44×44px.
- `support-chat`: the conversation MUST scroll inside the card, and the submit form MUST remain inside the card and be reachable with a long history and a limited screen height.
- `admin-panel`: the collection table MUST remain usable on narrow screens — without mandatory horizontal page scrolling, with an accessible "Action" column and a single scroll container.
- `donations`: the participation dialog and the recipient select MUST fit within the viewport, and long recipient labels MUST remain distinguishable.
- `wishes`: the congratulations strip MUST give a visual hint about horizontal scrolling and use `scroll-snap`, preserving manual scrolling and the absence of auto-scroll.

## Impact

- Components: `app/(app)/page.tsx`, `app/(app)/calendar/page.tsx`, `app/(app)/layout.tsx`, `app/(auth)/login/page.tsx`, `components/features/AdminTable.tsx`, `components/features/ChatThread.tsx`, `components/features/DonateDialog.tsx`, `components/features/BirthdayCard.tsx`, `components/features/WishBoard.tsx`, `components/layout/Header.tsx`.
- UI primitives: `components/ui/dialog.tsx`, `components/ui/popover.tsx`, `components/ui/select.tsx`, `components/ui/table.tsx`, `components/ui/button.tsx` (local classes, without changing the default variants).
- Styles: `app/globals.css` (`overflow-x` protection, `scroll-snap`).
- Specifications: the new `responsive-layout`; the deltas `birthdays`, `app-shell`, `accessibility`, `support-chat`, `admin-panel`, `donations`, `wishes`.
- Unchanged: data, persistence, backend, authentication, business rules (hiding amounts, allowed recipients, gift statuses, strip auto-scroll).
