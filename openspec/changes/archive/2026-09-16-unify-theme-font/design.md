## Context

The motivation is in `proposal.md`. Supporting facts about the current state:

- `app/layout.tsx:3-51` includes five `next/font/google` families (`Nunito`, `Bricolage_Grotesque`, `Manrope`, `Fraunces`, `Inter`) and attaches five CSS variables to `<html>`.
- `app/globals.css:34-35,69-70,104-105` inside each `[data-theme]` overrides `--font-heading` and `--font-body`, referencing the family variables.
- `lib/theme.ts:9,26,41,56` declares `ThemeMeta.fonts { heading, body }`, but the field is not consumed anywhere outside `lib/theme.ts`.
- `tailwind.config.ts:12-15` maps `fontFamily.heading`/`fontFamily.body` to `var(--font-heading)`/`var(--font-body)`.
- `--font-body` is applied to `body`, `--font-heading` to `h1..h6` (`app/globals.css:117,123`); the `font-heading` class is used on page and card headings.
- `Bricolage_Grotesque` and `Fraunces` are declared with `subsets: ['latin']` (`app/layout.tsx:17-22,31-36`), that is, Cyrillic headings are already substituted with a system font.
- The synchronized `performance` requirement mandates requesting only the active theme's fonts on the first load.

## Goals / Non-Goals

**Goals:**

- A single `Manrope` family for headings and text in all themes.
- One source of font inclusion instead of three pairs in `globals.css`.
- Correct Cyrillic without substitution with a system font.
- Minimum changes in consumers: the token names `--font-heading`/`--font-body` and the `font-heading`/`font-body` utilities are preserved.

**Non-Goals:**

- Revisiting the palettes, radii, and decoration of the themes — they still distinguish the themes.
- Changing the `performance`, `hydration`, `ui-consistency` requirements — their wording remains valid.
- The second part of the original request (separate highlight colors for the header and buttons) — outside this change.

## Decisions

### 1. A single family — `Manrope`

`Manrope` is declared with `subsets: ['latin', 'cyrillic']` (`app/layout.tsx:24-29`), that is, it covers Cyrillic, and it is the only family of the festival suitable as a single font.

Alternatives: `Nunito` (warm theme) and `Inter` (premium) also support Cyrillic, but a font specifically from the festival was requested; `Bricolage_Grotesque` and `Fraunces` are rejected as latin-only — they would reproduce the current font substitution on Cyrillic for all themes now.

### 2. The font token is declared once, the `--font-*` names are preserved

`--font-heading` and `--font-body` are moved into the common `:root`/`[data-theme='warm']` block as the single value `var(--font-manrope)` and removed from the `festival` and `premium` blocks. The names are kept so as not to touch `h1..h6`, `body`, and the `font-heading`/`font-body` classes.

Alternative — keep the override in each theme, specifying `Manrope` everywhere: three copies of the same value that will drift apart on the next edit. Rejected.

### 3. The `ThemeMeta.fonts` field is removed

The field is not read by any consumer and describes variability that no longer exists. The type and the `THEMES` entries lose `fonts`.

Alternative — replace with `family: 'Manrope'`: preserves in the metadata a value that is not used anywhere and may diverge from `globals.css`. Rejected.

### 4. `Manrope` gets `preload: true`

Since the family is single and always used, preloading stops pulling in other themes and stops being a fork from the previous change. The remaining families are removed together with the imports.

Alternative — keep `preload: false`: an extra font-substitution cycle on the first load with no benefit, since there are no competing families anymore.

### 5. `tailwind.config.ts` does not change

The mapping of `fontFamily.heading`/`body` to the variables remains correct. No changes are required.

## Risks / Trade-offs

- **Visual rollback of the `festival`/`premium` themes** (loss of display headings) → a deliberate trade-off, recorded as breaking in `proposal.md`.
- **The heading and text stop being distinguished by family** → the distinction remains through sizes, weight, and case; if necessary it is adjusted with `Manrope` weights without a new family.
- **Change of font metrics** → `display: 'swap'` and the `performance` requirement about non-shifting layout are preserved; CLS is checked in the tasks.
- **Residual references to the removed families** → the build and type checking catch unused imports; `--font-nunito`/`--font-bricolage`/`--font-fraunces`/`--font-inter` do not remain in `globals.css`.

## Migration Plan

1. `app/layout.tsx`: keep only the `Manrope` import and config (`subsets: ['latin','cyrillic']`, `variable: '--font-manrope'`, `preload: true`); `fontVariables` = the `Manrope` variable.
2. `lib/theme.ts`: remove `fonts` from `ThemeMeta` and from the three `THEMES` entries.
3. `app/globals.css`: set `--font-heading`/`--font-body` once, remove the overrides in `[data-theme='festival']` and `[data-theme='premium']`.
4. Check: `npm run build`, type checking, `npm test`; switching all three themes, Cyrillic headings, absence of requests for the removed families.

Rollback — restoring the former `--font-*` values and imports in a single commit; data and localStorage are not affected.
