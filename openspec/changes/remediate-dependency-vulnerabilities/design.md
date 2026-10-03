## Context

See `proposal.md` - Why. Constraints that shape the approach:

- `next` is already `16.3.8` and its peer range accepts `react@^18.2.0`, so React stays at
  `18.2.0`; `next@16.3.8` already vendors `postcss@8.5.23`.
- The project installs with `npm ci` in both the Docker image (`Dockerfile:5`) and CI
  (`.github/workflows/ci-cd.yml:23`), so every change must land in `package-lock.json`.
- Current vulnerable leaves and their only consumers (verified against the installed tree):

```
vitest 2.1.9  -> vite 5.4.21 -> esbuild 0.21.5          (direct, dev)
postcss 8.4.30                                           (direct)
@testing-library/jest-dom -> lodash 4.17.21              (dev)
next-auth / @testing-library -> @babel/runtime 7.25.7    (prod + dev)
tailwindcss 3.3.3
   -> chokidar 3.6.0 -> braces 3.0.3                     (NO PATCHED RELEASE EXISTS)
   -> micromatch 4.0.8 -> braces 3.0.3
   -> fast-glob 3.3.2 -> micromatch -> braces
   -> picomatch 2.3.1, yaml 2.5.1, postcss-selector-parser 6.1.2
   -> sucrase -> glob 10.4.5 -> minimatch 9.0.5 -> brace-expansion 2.0.1
   -> sucrase -> glob -> foreground-child -> cross-spawn 7.0.3
eslint 8.49.0 -> ajv 6.12.6, js-yaml 4.1.0, flatted 3.3.1,
                 minimatch 3.1.2 -> brace-expansion 1.1.11
eslint-config-next 13.5.1 -> @typescript-eslint 6.21 -> globby -> fast-glob -> braces
                          -> eslint-import-resolver-typescript 3.6.3 -> fast-glob
autoprefixer 10.4.15 -> browserslist 4.24.0
jsdom 24.1.3 -> ws 8.18.3
```

- `braces` is the pivot: no published version is outside the advisory (max `3.0.3`), so it
  cannot be overridden to safety. It is removed only by retiring its consumers.
- `eslint-config-next@16.3.8` requires `eslint >=9.0.0` and pulls `typescript-eslint@8`,
  which uses `minimatch@10` + `tinyglobby` (no `fast-glob`/`globby`/`micromatch`).
  `eslint-import-resolver-typescript@4` likewise uses `tinyglobby`.
- `tailwindcss@4.3.3` has no runtime dependencies at all; the `@tailwindcss/oxide` native
  binaries are optional platform packages.

## Goals / Non-Goals

**Goals:**

- Zero critical and zero high findings from the vulnerability scan; ideally zero overall.
- Keep the application buildable and the existing tests green after the migration.
- Keep `npm ci` deterministic in Docker and CI.

**Non-Goals:**

- No application feature or runtime API changes; React stays on 18.2.0.
- No dependency upgrades beyond what the advisories require (no gratuitous major bumps).
- No change to the deployment pipeline topology; only the lockfile and lint invocation are
  affected.

## Decisions

### D1: Two-phase remediation - constraint first, toolchain second

Apply pure version bumps and version-scoped overrides first (cheap, reversible), then the
toolchain migrations that remove `braces`. This isolates the high-churn changes so a
failure in the Tailwind or ESLint migration does not hide the effect of the overrides.
Alternative considered: do everything in one commit - rejected because it makes the
audit delta and any regression impossible to attribute.

### D2: Migrate Tailwind 3 to 4 via the `@config` bridge

`tailwindcss` 3.3.3 is the sole remaining `braces` consumer. Upgrading to `4.3.3` removes
`chokidar`/`micromatch`/`braces`/`fast-glob`/`picomatch`/`yaml`/`postcss-selector-parser`/
`glob`/`sucrase`. To minimize churn, keep `tailwind.config.ts` (including
`tailwindcss-animate` and the custom `hoverable` variant and accordion keyframes) and load
it from CSS with `@config "./tailwind.config.ts"`, replacing the three `@tailwind` directives
in `app/globals.css` with `@import "tailwindcss"`. `tailwindcss-animate`'s peer range
(`>=3.0.0 || insiders`) is satisfied by 4.3.3, so it can stay.

Alternatives considered:
- Keep Tailwind 3 and override `braces` - impossible, no patched `braces` exists.
- Patch/fork `braces` - rejected: unmaintainable, and the advisory has no upstream fix.
- Full CSS-first rewrite (`@theme` inline, drop the JS config) - deferred; higher churn for
  no additional security gain.

### D3: Standalone ESLint 10 flat config (drop `eslint-config-next`)

`eslint-config-next@13.5` pulls the `@typescript-eslint@6 -> globby -> fast-glob -> braces`
chain. Upgrading to 16.3.8 does NOT remove `braces`: `@next/eslint-plugin-next@16.3.8`
hard-depends on `fast-glob@3.3.1 -> micromatch -> braces@3.0.3`, and `braces` has no
patched release (advisory range `<=3.0.3`). Since the `braces` node is unfixable, the
consuming toolchain is dropped: `eslint-config-next` (and `@next/eslint-plugin-next`) are
removed, and `eslint@10` is configured with a flat `eslint.config.mjs` composed from
`@eslint/js` recommended, `typescript-eslint` recommended, and `eslint-plugin-react-hooks`
recommended. This also resolves the `eslint@10` invalid-peer clash with
`eslint-config-next@16`'s bundled plugins. Trade-off: the `next/core-web-vitals` preset
(Next-specific rules) is no longer applied; the React hooks and general JS/TS rules are
retained.

Alternatives considered: keep `eslint-config-next@16` and accept the dev-only `braces`
high finding - rejected because the spec requires zero high findings and no unpatchable
node; use `eslint-config-next@14.2.35` (glob-based, no `braces`) - rejected because it only
supports `eslint ^7.23 || ^8` and is not matched to Next 16.

### D4: Drop `autoprefixer`

Tailwind 4 performs vendor prefixing through its own pipeline, so `autoprefixer` is
redundant and is the only source of the `browserslist` finding. Remove it and its config
entry. If any remaining dependency still pulls `browserslist`, constrain it to `>=4.28.7`.

### D5: `jsdom` 30 for the `ws` finding

`jsdom` 30 no longer depends on `ws`. If the installed test stack cannot accept jsdom 30,
fall back to keeping jsdom 24 and constraining `ws` to `>=8.21.0`. Both satisfy the spec;
the choice is verified by running the suite.

### D6: Version-scoped overrides for the remaining leaves

Override only packages with no safer consumer upgrade, and scope each override to its major
line so incompatible majors are not forced together:

```json
"overrides": {
  "minimatch@3":  { ".": "3.1.4", "brace-expansion": "1.1.21" },
  "minimatch@9":  { ".": "9.0.7", "brace-expansion": "2.1.7" },
  "ajv@6":        "6.14.0",
  "js-yaml@4":    "4.3.2",
  "lodash":       "4.18.1",
  "flatted":      "3.4.2",
  "picomatch@2":  "2.3.2",
  "cross-spawn":  "7.0.6",
  "@babel/runtime": "7.26.10",
  "ws":           "8.21.0"
}
```

After the Tailwind/ESLint migrations, several entries become unnecessary (for example the
`glob`/`sucrase`/`micromatch` paths disappear); the final set is whatever the post-migration
scan still reports. In the implemented tree that set is empty: after the Tailwind 4,
standalone ESLint 10, and `jsdom` 30 migrations, every remaining consumer resolves to a
patched version naturally, so `package.json` carries no `overrides`. A blanket single-version
override for `minimatch`/`brace-expansion` is explicitly rejected: `minimatch@3` and
`minimatch@9` have different APIs, as do the two `brace-expansion` majors.

### D7: Restore the lint gate in the script, keep CI ordering

Change `"lint": "next lint"` to `"lint": "eslint ."`. Because `next build` no longer runs
ESLint, the CI `checks` job remains the gate and the `build` job keeps `needs: checks`, so a
lint error fails the pipeline before the image is built - satisfying the deployment
requirement without changing its text.

## Risks / Trade-offs

- Tailwind utility or animation regressions after the v4 migration -> keep `@config` + the
  animate plugin, run the production build, and smoke-check the rendered pages; revert the
  styling commit independently of the overrides commit if needed.
- ESLint 10 standalone flat-config wiring (parser/plugin resolution) breaks lint ->
  verify `npm run lint` reports real findings and exits non-zero on an injected error before
  finishing.
- `vitest@4` is a major jump from 2.1.9 (jsdom environment, setup file, config) -> run the
  suite and adjust config only as needed; do not change test semantics.
- Override selector syntax resolves differently than expected -> confirm with `npm ls
  <pkg> --all` that each leaf is at/above the patched version and that both `minimatch`
  majors still coexist.
- Dropping `autoprefixer` changes CSS prefixing -> Tailwind 4 prefixes via lightningcss;
  verify the built stylesheet still contains needed prefixes.
- Dev/build-time advisories (`braces`, `chokidar`, glob DoS) are low real-world risk, but
  they are still Dependabot high findings and are removed for scan cleanliness, not urgency.

## Migration Plan

1. Baseline the current state: capture `npm audit --json`, `npm test`, and `npm run build`.
2. Phase 1 - bump `vitest` and `postcss`, add the override block, regenerate
   `package-lock.json` with `npm install`, re-scan, and run tests/build.
3. Phase 2 - Tailwind 4: swap the PostCSS plugin, update `app/globals.css`, drop
   `autoprefixer`; build and visually check.
4. Phase 3 - ESLint 10 + `eslint-config-next` 16 flat config; switch the `lint` script to
   `eslint .`; run lint and fix config.
5. Phase 4 - `jsdom` 30, cleanup of now-unused overrides, final scan at zero, and verify a
   clean `npm ci` plus production build (matching Docker/CI).
6. Rollback: revert the change commit and run `npm ci` to restore the previous locked tree.

## Open Questions

- The exact flat-config export name/shape for `eslint-config-next` 16 - confirmed during
  implementation, does not affect the approach or specs.
- Whether the test stack accepts `jsdom` 30 or needs the `ws` override fallback (D5) -
  resolved by running the suite.
