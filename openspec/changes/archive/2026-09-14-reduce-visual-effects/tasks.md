## 1. Congratulations strip — static band

- [x] 1.1 In `components/features/WishBoard.tsx`, remove the duplicate `<ul aria-hidden>`, the `isOverflowing`/`prefersReducedMotion` states, the effects with `ResizeObserver` and `matchMedia`, the `isLooping` computation, and the `containerRef`/`listRef` variables; leave one `<ul>` in a block with `overflow-x-auto` and `tabIndex={0}`. Check: the file contains no occurrences of `isLooping`, `ResizeObserver`, `wish-marquee`.
- [x] 1.2 Check the strip's behavior: with few cards — a static band without duplicates; on overflow — manual horizontal scrolling, keyboard focus. Check: `npm run typecheck` and a visual run on the home page.
- [x] 1.3 In `app/globals.css`, remove `@keyframes wish-marquee`, `.wish-marquee-track--looping`, the `:hover`/`:focus-within` rules, and the `@media (prefers-reduced-motion)` block for the strip. Check: grep for `wish-marquee` finds no occurrences in the project.

## 2. Header without blur

- [x] 2.1 In `components/layout/Header.tsx:84`, replace `bg-background/80 backdrop-blur-md` with `bg-background`. Check: the file has no `backdrop-blur`; scrolling the home page shows no blur under the header.

## 3. Shadows — a light replacement

- [x] 3.1 In `app/globals.css`, remove the `--card-shadow` definitions in the three themes and the `.card-shadow` class. Check: grep for `--card-shadow` and `card-shadow` finds no occurrences.
- [x] 3.2 Remove the `card-shadow` class from ~15 usage places in `app/**` and `components/**`, without adding new shadows (cards rely on `shadow-sm` and `border` from `components/ui/card.tsx`). Check: grep for `card-shadow` is empty, `npm run typecheck` passes.
- [x] 3.3 Check the separation of cards in the three themes (`warm`, `festival`, `premium`). Check: a visual run of the home page, calendar, FAQ, admin panel, and login without boundaries "sticking together".

## 4. Micro-interaction of the birthday card

- [x] 4.1 In `components/features/BirthdayCard.tsx:37`, replace `transition-all` with `transition-transform`, preserving `hover:scale-[1.02]`. Check: `transition-all` is absent from the file, the hover enlargement works.

## 5. Removing unreachable decorative CSS

- [x] 5.1 Remove from `app/globals.css` the classes/`@keyframes`: `confetti-fall`/`.confetti-piece`, `gentle-float`/`.gentle-float`, `subtle-shimmer`/`.subtle-shimmer`, `festival-tilt`, `festival-gradient-text`, `festival-card-glow`, `warm-soft-shadow`. Keep `hero-overlay` and `--hero-overlay`. Check: grep for each class name finds no references in `app/**`, `components/**`, `lib/**`.
- [x] 5.2 Confirm that the removed classes are not used dynamically anywhere. Check: `npm run lint` and `npm run build` complete without errors.

## 6. Specification synchronization

- [x] 6.1 Reconcile the unarchived change `fix-review-round-8` (its `wishes` delta "The congratulations strip does not loop rendering" loses its meaning). Check: `openspec list` does not show conflicting active changes for `wishes`, or their deltas are reconciled.
- [x] 6.2 Run `openspec validate reduce-visual-effects` — the change is valid; then apply and archive the `wishes` and `performance` deltas. Check: `openspec validate reduce-visual-effects` reports `is valid`.

## 7. Final check

- [x] 7.1 Run `npm run lint`, `npm run typecheck`, `npm run build` without errors. Check: all three commands complete successfully.
- [x] 7.2 Check in the browser for the absence of continuous animations and blur (Performance/Rendering tab, absence of constant repaints at rest). Check: when the page is idle there are no active animations.
