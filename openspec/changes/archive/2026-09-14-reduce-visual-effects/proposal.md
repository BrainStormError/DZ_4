## Why

Continuous visual effects place a constant load on rendering: the running congratulations strip spins an animation and a `ResizeObserver` constantly, the "glassy" header recomputes `backdrop-blur` on every scroll frame, and large theme shadows add many paint layers. At the same time, the `wishes` requirement explicitly mandates auto-scroll, so reducing the load without amending the specification is impossible.

## What Changes

- **Wish board without a marquee.** The congratulations strip stops scrolling automatically. One horizontal strip with manual scrolling remains; the duplicate copy of the cards, the `ResizeObserver`, and the overflow detection logic are removed. The color highlighting of cards by birthday person is preserved. **BREAKING** for the `wishes` requirement "Congratulations strip for the day's birthday people".
- **Header without blur.** `backdrop-blur` is removed from `Header` — a solid background is used instead of a translucent one with blur.
- **Light shadows instead of heavy ones.** The custom theme shadows `--card-shadow` (large blur, 24-32px) are replaced with the card's standard light `shadow-sm` in combination with the existing `border`; the visual separation of cards is preserved.
- **Removal of dead decorative CSS.** Unused effect classes (confetti shimmer, floating, premium shimmer, festival tilt and gradient text, card glow) are removed as unreachable code.
- **Preservation of cheap effects.** The focus-ring, short appearance animations of popovers/menus/dialogs, the static hero gradient, and theme transition remain as they do not create a constant load.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wishes`: the requirement "Congratulations strip for the day's birthday people" is replaced with the requirement "Static congratulations strip" — auto-scroll and its scenarios are removed in favor of a strip with manual scrolling.
- `performance`: a requirement is added about the absence of continuous visual effects (infinite animations and background blur) and about static light shadows.

## Impact

- Components: `components/features/WishBoard.tsx`, `components/layout/Header.tsx`, `components/features/BirthdayCard.tsx`.
- Styles: `app/globals.css` (the marquee, decorative @keyframes/classes, `--card-shadow`), plus ~15 places with the `card-shadow` class in `app/**` and `components/**`.
- Specifications: deltas for `wishes` and `performance`.
- Note: the completed change `fix-review-round-8` is not yet archived and contains the delta "The congratulations strip does not loop rendering"; after abandoning auto-scroll, this delta becomes irrelevant and is subject to reconciliation during archiving.
- Not changed: data and display rules by birthday, color highlighting of authors, persistence, backend, accessibility (focus-ring and keyboard navigation are preserved).
