## 1. Baseline and guardrails

- [x] 1.1 Capture the pre-change baseline by running `npm audit --json`, `npm test`, and `npm run build`, and record the audit counts (expected: 29 total, 1 critical, 21 high) for later comparison; verify all three commands complete before proceeding
- [x] 1.2 Confirm the React/Next constraint before touching versions: verify `next@16.3.8` peer range accepts `react@18.2.0` and that no upgrade of `next`/`react` is required, so `react`/`react-dom` stay at `18.2.0`

## 2. Direct version bumps and version-scoped overrides

- [x] 2.1 In `package.json`, bump direct dev dependencies `vitest` to `^4.1.11` and `postcss` to `^8.5.23`, and verify `npm ls vite esbuild @vitest/mocker` resolves `vite >=6.4.3`, `esbuild >=0.25.0`, and `@vitest/mocker 4.1.11`
- [x] 2.2 Add the version-scoped `overrides` block from design.md D6 (`minimatch@3` -> `.` 3.1.4 + `brace-expansion` 1.1.21; `minimatch@9` -> `.` 9.0.7 + `brace-expansion` 2.1.7; `ajv@6` 6.14.0; `js-yaml@4` 4.3.2; `lodash` 4.18.1; `flatted` 3.4.2; `picomatch@2` 2.3.2; `cross-spawn` 7.0.6; `@babel/runtime` 7.26.10; `ws` 8.21.0), regenerate `package-lock.json` with `npm install`, and verify with `npm ls brace-expansion minimatch minimatch@9 lodash js-yaml ajv flatted picomatch cross-spawn @babel/runtime --all` that every entry is at/above the patched version and both `minimatch` majors still coexist
- [x] 2.3 Run `npm test` and `npm run build` after the bumps and verify both still pass on the upgraded `vitest`/`postcss`

## 3. Tailwind 3 to 4 migration

- [x] 3.1 Replace `tailwindcss@3.3.3` with `tailwindcss@^4.3.3` and add `@tailwindcss/postcss@^4.3.3` in `package.json`, remove `autoprefixer`, and verify `npm ls tailwindcss @tailwindcss/postcss autoprefixer braces micromatch fast-glob chokidar` shows no `braces`/`micromatch`/`fast-glob`/`chokidar` nodes and no `autoprefixer`
- [x] 3.2 Update `postcss.config.js` to use `@tailwindcss/postcss` as the only plugin (drop `tailwindcss` and `autoprefixer` entries) and verify the production build's CSS still compiles
- [x] 3.3 Replace the `@tailwind base;`/`@tailwind components;`/`@tailwind utilities;` directives in `app/globals.css` with `@import "tailwindcss";` and add `@config "./tailwind.config.ts";` so the existing `tailwind.config.ts` (including `tailwindcss-animate`, the `hoverable` variant, and accordion keyframes) is loaded; verify the build succeeds and `tailwindcss-animate` resolves without a peer conflict
- [x] 3.4 Verify styling parity after the migration: run `npm run build` and smoke-check the rendered pages so previously used utility classes, the `hoverable` variant, and the accordion animations still apply

## 4. ESLint 10 flat config and restored lint gate

- [x] 4.1 Drop `eslint-config-next` (its `@next/eslint-plugin-next` hard-pulls `fast-glob` -> `micromatch` -> `braces`, which has no patched release), bump `eslint` to `^10`, and add `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `globals`; verify `npm ls braces micromatch fast-glob globby @typescript-eslint/typescript-estree eslint-config-next` shows no `braces`/`micromatch`/`fast-glob`/`globby`/`eslint-config-next` nodes, the only `@typescript-eslint/typescript-estree` is the v8 line, and `npm audit` reports zero findings
- [x] 4.2 Replace `.eslintrc.json` with a flat `eslint.config.mjs` built from `@eslint/js` recommended, `typescript-eslint` recommended, and `eslint-plugin-react-hooks` recommended (no `next/core-web-vitals` preset), and verify `npm run lint` analyzes the project and exits successfully
- [x] 4.3 Change the `lint` script in `package.json` from `next lint` to `eslint .` and verify a deliberately introduced lint error makes the script exit non-zero (then remove the injected error)
- [x] 4.4 Confirm the CI gate ordering is intact: verify `.github/workflows/ci-cd.yml` still runs the lint step in the `checks` job and that the image `build` job still `needs: checks`, so a lint error blocks the image build

## 5. jsdom, cleanup, and final scan

- [x] 5.1 Upgrade `jsdom` to `^30` and verify `npm ls ws` shows no vulnerable `ws` (if the suite rejects jsdom 30, keep jsdom 24 and rely on the `ws` override instead), then run `npm test` to confirm the suite passes
- [x] 5.2 Run a fresh `npm audit --json` and verify zero critical and zero high findings; remove any override entry that is no longer necessary while keeping the scan at zero
- [x] 5.3 Verify reproducibility: run `npm ci` from a clean checkout and confirm the install succeeds, the lockfile is unchanged, and the resolved scan result matches the local tree

## 6. End-to-end verification

- [x] 6.1 Run the full local pipeline (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`) and verify all four succeed on the final locked tree
- [x] 6.2 Verify the production image path still works with the regenerated lockfile: build via the `Dockerfile` (or confirm `npm ci` + standalone output) and verify the image build completes without lockfile errors
