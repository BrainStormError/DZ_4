## 1. Extend the Content-Security-Policy

- [x] 1.1 In `middleware.ts`, change `connect-src 'self'` to `connect-src 'self' https://mc.yandex.ru https://yastatic.net https://yandex.ru` and verify `npm run typecheck` passes
- [x] 1.2 Verify with `npm run lint` that the policy string change introduces no lint error

## 2. Add the counter to the root layout

- [x] 2.1 In `app/layout.tsx`, add the provided Metrika snippet as an inline `<script nonce={nonce} dangerouslySetInnerHTML={{ __html: metrikaScript }} />` in `<head>` after the theme bootstrap, keeping the counter id `113274971` and `ssr:true`, and verify the file typechecks
- [x] 2.2 Add the `<noscript>` fallback `<img src="https://mc.yandex.ru/watch/113274971" style={{ position: 'absolute', left: -9999 }} alt="" />` in `<head>` and verify the file typechecks
- [x] 2.3 Verify `npm run lint` passes with the new layout markup

## 3. Validate the built application

- [x] 3.1 Run `npm run build` and verify the build succeeds with the extended CSP and the counter markup
- [ ] 3.2 Start the built application, load a page, and verify the browser console shows no Content-Security-Policy violation, the Metrika `tag.js` request is not blocked, and no analytics UI is visible on the page
- [ ] 3.3 Verify the page still cannot be framed while the counter is active by loading it inside an embedding page and confirming it does not render

## 4. Run the full checks

- [x] 4.1 Run `npm test` and verify the existing suite still passes
- [x] 4.2 Run `openspec validate add-yandex-metrika` and verify the change validates
