## Context

See `proposal.md` — Why. Current state:

- `components/features/WishBoard.tsx` holds `ResizeObserver`, the `isOverflowing`/`prefersReducedMotion` state, computes `isLooping`, and renders a second `<ul aria-hidden>` with a copy of the cards. The animation is `@keyframes wish-marquee` in `app/globals.css:208-231`.
- `components/layout/Header.tsx:84` — a sticky header with `bg-background/80 backdrop-blur-md`.
- Heavy shadows are defined by the `--card-shadow` variable in three themes (`globals.css:36/72/108`) and by the `.card-shadow` class (`globals.css:137`), which is applied in ~15 places.
- In `globals.css:150-206`, decorative classes/`@keyframes` are declared that are not referenced anywhere in the code.
- The project is spec-driven: the wish board's behavior is fixed in `openspec/specs/wishes/spec.md`; performance budgets are in `openspec/specs/performance/spec.md`.

## Goals / Non-Goals

**Goals:**

- Remove continuously running effects: the marquee and the header's background blur.
- Reduce the rendering cost of shadows while preserving the visual separation of surfaces.
- Remove unreachable decorative CSS.
- Bring the `wishes` and `performance` specifications in line with the new behavior.

**Non-Goals:**

- Do not change the rules for displaying wishes by birthday, the data composition, or the color highlighting of birthday people.
- Do not touch short-lived state effects (appearance of popovers, menus, dialogs) or the focus-ring.
- Do not change fonts, palettes, page structure, or theme logic.

## Decisions

### 1. Congratulations strip — a static model

Removed: the duplicate `<ul>`, `ResizeObserver`, the `isOverflowing`/`isLooping`/`prefersReducedMotion` states, the `wish-marquee*` classes, and `@keyframes wish-marquee`. One `<ul>` remains inside a block with `overflow-x-auto` and `tabIndex={0}`.

- **Why:** without auto-scroll, duplicates and overflow measurement are unnecessary; manual scrolling fully covers the overflow case.
- **Alternative:** keep auto-scroll but slow it down/pause it more often — rejected, since a continuous animation remains.

### 2. Header — a solid background

`bg-background/80 backdrop-blur-md` is replaced with `bg-background`.

- **Why:** `backdrop-blur` on a sticky element is recomputed on every scroll frame — the only truly heavy effect after the strip.
- **Alternative:** enable blur only while scrolling — rejected: complexity and residual load without noticeable benefit.
- **Compatibility:** the `border-b` border is preserved, and the header's contrast over the content is not lost.

### 3. Shadows — replace the heavy one rather than removing it

The custom `--card-shadow` (blur 16-32px) are removed; cards rely on the standard `shadow-sm` from `components/ui/card.tsx` together with the existing `border`.

- **Why:** box-shadow is a static paint, so removing it entirely gives no gain in frames but worsens the readability of boundaries. A light `shadow-sm` + `border` preserve the separation of surfaces.
- **Alternative:** introduce a new "medium" shadow token — rejected: an extra entity with no benefit.
- The `shadow-sm/md/lg` of opened popovers, menus, and dialogs are preserved: they are painted only while open.

### 4. Micro-interaction of the birthday card

In `components/features/BirthdayCard.tsx:37`, `transition-all hover:scale-[1.02]` is replaced with `transition-transform hover:scale-[1.02]`.

- **Why:** `scale` is a composite transform, cheap and only on hover; the narrow `transition-transform` stops animating all properties in a row, and the quality of the micro-interaction is preserved.

### 5. Removing unreachable CSS

`confetti-fall`, `gentle-float`, `subtle-shimmer`, `festival-tilt`, `festival-gradient-text`, `festival-card-glow`, and `warm-soft-shadow` are removed. `--hero-overlay` is preserved. There are no references to the removed classes in `app/**`, `components/**`, `lib/**` (verified by grep).

- **Why:** unreachable decorative code carries no behavior and is misleading; consistent with the `ui-consistency` requirement about the absence of unused modules.
- `hero-overlay` (a static gradient in `app/(app)/page.tsx:55`) **is preserved** — one paint, it creates no constant load.

### 6. Form of the `wishes` delta

The requirement "Congratulations strip for the day's birthday people" is issued as `REMOVED` + a new `ADDED` "Static congratulations strip", rather than `MODIFIED`: the OpenSpec validator forbids a `MODIFIED` block from discarding existing scenarios (auto-scroll and its accessibility), and keeping them under their former names would be incorrect in meaning.

## Risks / Trade-offs

- **Flat cards after removing the shadow** → we keep `border` + `shadow-sm`; check visually in all three themes (`warm`, `festival`, `premium`).
- **Header reads worse over a colorful hero** → a solid `bg-background` and `border-b`; check on the home page while scrolling.
- **Divergence from the original technical specification** (`InitialSpec.md` asks for "smooth shadows", "confetti", "tilt", "sparkles") → this is the user's deliberate compromise; meaningful festive accents (colored cards, the static hero gradient, emojis) are preserved.
- **Unarchived `fix-review-round-8`** contains the delta "The congratulations strip does not loop rendering", which loses its meaning → see Migration Plan.
- **Accidentally deleting a used effect class** → before removing CSS, run grep for the classes and build/typecheck; remove only what is confirmed unreachable.

## Migration Plan

1. Changes are in the repository only; data and API are not migrated; rollback is via git.
2. Order relative to the unfinished archive: archive `fix-review-round-7` and `fix-review-round-8` before applying this change, or when archiving reconcile their `wishes` delta, acknowledging it is no longer relevant after abandoning auto-scroll.
3. Apply the code edits per `tasks.md`, then sync/archive the `wishes` and `performance` deltas.
4. Check: `npm run build`/typecheck (per the project's actual scripts), a visual run of the three themes and the strip with and without overflow.
