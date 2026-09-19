## 1. Single font inclusion

- [x] 1.1 In `app/layout.tsx` keep only the `Manrope` import and config (`subsets: ['latin', 'cyrillic']`, `variable: '--font-manrope'`, `preload: true`), remove `Nunito`, `Bricolage_Grotesque`, `Fraunces`, `Inter` and their variables from `fontVariables` — verification: the file contains no `nunito`, `bricolage`, `fraunces`, `inter` symbols; `npm run typecheck` passes
- [x] 1.2 In `lib/theme.ts` remove the `fonts` field from the `ThemeMeta` interface and from the `warm`, `festival`, `premium` entries — verification: a search for `fonts` in `lib/theme.ts` yields no matches; `npm run typecheck` passes

## 2. Unified typographic tokens

- [x] 2.1 In `app/globals.css` set `--font-heading` and `--font-body` once as `var(--font-manrope), sans-serif`, remove their overrides from `[data-theme='festival']` and `[data-theme='premium']` — verification: the file has exactly one declaration of each variable; there are no references to `--font-nunito`, `--font-bricolage`, `--font-fraunces`, `--font-inter`
- [x] 2.2 Confirm that `tailwind.config.ts` and the `font-heading`/`font-body` classes do not require changes — verification: `npm run build` passes, the `font-heading`/`font-body` utilities are present in the built CSS

## 3. Checking the behavior of the single font

- [x] 3.1 Check that switching all three themes does not change the font family of headings and text — verification: in DevTools Computed the `font-family` of a heading and a paragraph is the same for `warm`, `festival`, `premium` and corresponds to `Manrope`
- [x] 3.2 Check the display of Cyrillic with the single font — verification: the Russian heading and text are rendered with `Manrope`; the list of used fonts contains no fallback system family
- [x] 3.3 Check the set of requested font files — verification: only `Manrope` files (latin + cyrillic) are requested in Network, there are no requests for the removed families
- [x] 3.4 Run the project's automated checks — verification: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` complete without errors

## 4. Regression of critical scenarios

- [x] 4.1 Check that changing the theme and restoring the session do not hide the content and preserve the requirement about server-side content of the first render — verification: the home page and the calendar display content before hydration and after switching the theme without an empty screen
- [x] 4.2 Check that the header interactivity (theme switcher, user menu) remains available after navigating between sections — verification: the menus open and close, and scrolling is not blocked
