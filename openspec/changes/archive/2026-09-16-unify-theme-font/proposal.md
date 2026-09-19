## Why

Typography is distributed across five families (`Nunito`, `Bricolage Grotesque`, `Manrope`, `Fraunces`, `Inter`) across three themes, so each style requires its own loading and maintenance, and `Bricolage Grotesque` and `Fraunces` are declared with Latin only and already lead to font substitution on Cyrillic headings. A single font for all themes removes this fork, guarantees correct Cyrillic, and reduces the number of font files.

## What Changes

- All themes (`warm`, `festival`, `premium`) use the single `Manrope` family for headings and body text.
- `app/layout.tsx` includes only `Manrope`; the imports and variables of `Nunito`, `Bricolage Grotesque`, `Fraunces`, `Inter` are removed.
- `lib/theme.ts` — the theme metadata no longer defines the `fonts { heading, body }` pair.
- `app/globals.css` — `--font-heading` and `--font-body` are defined once and are not overridden inside `[data-theme]`.
- The theme stops influencing typography; the visual distinction of themes is preserved through the palette, radii, and decoration.
- **BREAKING** (visual): the headings of the `festival` and `premium` themes lose the display families, the heading and text are no longer distinguished by family.

## Capabilities

### New Capabilities

- `theming`: rules of the theme system — unified typography of all themes and the composition of the theme's typographic tokens.

### Modified Capabilities

<!-- None: the requirements of the existing specs (hydration, performance, ui-consistency) do not change. -->

## Impact

- Code: `app/layout.tsx` (`next/font` imports), `lib/theme.ts` (the `ThemeMeta.fonts` model), `app/globals.css` (the `--font-*` tokens), `tailwind.config.ts` (the `fontFamily` mapping remains on the variables).
- Performance: the number of requested font files decreases from 8 to 2 (`Manrope` latin + cyrillic); the `performance` requirement about loading only the active theme's fonts remains satisfiable.
- Documentation: `InitialSpec.md:56-69` has already been brought into compliance (a single `Manrope` for all concepts).
- Tests: there are no component typography checks; the existing theme and hydration tests are not affected.
