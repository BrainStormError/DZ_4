## 1. Shared loading placeholder

- [x] 1.1 Create a shared presentational skeleton (stable minimum height, `aria-busy`, visually hidden "Загрузка…") inside the standard `max-w-7xl px-4 sm:px-6 lg:px-8 py-8` container, and verify it renders with `npm run typecheck`.
- [x] 1.2 Add `app/(app)/loading.tsx` rendering the shared skeleton, and verify the new file exists and `npm run typecheck` passes.
- [x] 1.3 Reuse the same skeleton in the FAQ inner Suspense fallback (`app/(app)/faq/page.tsx`) so both loading surfaces match, and verify `app/(app)/faq/page.tsx` has no duplicated skeleton markup.

## 2. Optimistic header selection

- [x] 2.1 In `components/layout/Header.tsx`, mark a nav item selected immediately on a plain left-click (a local pending state), ignoring modified clicks (Ctrl/Cmd/Shift/middle button), and verify by activating a section and observing the highlight in the same interaction.
- [x] 2.2 Clear the pending state on any `usePathname()` change so back/forward and interrupted transitions converge to the URL, and verify the selected item matches the URL after using browser back and forward.
- [x] 2.3 Verify the shell stays interactive during a switch: with the placeholder visible, scrolling and clicks on the header, theme toggle, and user menu still work without a reload.

## 3. Verification

- [x] 3.1 Run `npm run lint`, `npm run typecheck`, and `npm run test`, and verify all three succeed.
- [x] 3.2 Verify on a production build (`npm run build` then `npm start`) that switching "Главная" / "Календарь ДР" / "FAQ" shows the loading placeholder before the section content appears and that no full page reload occurs.
- [x] 3.3 Measure the INP (does not exceed 200 ms) of activating a header item and the CLS (does not exceed 0.1) of replacing the placeholder with content, and record the results.
