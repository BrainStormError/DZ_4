## Why

The dependency tree currently carries 29 Dependabot findings: 1 critical and 21 high,
including a critical arbitrary-file-read/execute in `vitest`, and remotely triggerable
denial-of-service or code-execution advisories across build and runtime tooling
(`postcss`, `brace-expansion`, `minimatch`, `js-yaml`, `lodash`, `vite`, `esbuild`,
`browserslist`, `flatted`, `picomatch`, `ws`, `ajv`, `@babel/runtime`, and the
`braces`/`micromatch`/`fast-glob`/`chokidar`/`@typescript-eslint` chains). The goal is to
remove the critical and high tier entirely without regressing the running application.
One of the findings (`braces`) has no patched release at all, so it can only be removed by
retiring the toolchains that pull it.

Separately, `next@16.3.8` no longer ships a `lint` command, so the repository's
`"lint": "next lint"` script is a silent no-op and the deployment requirement that a lint
error must block the build is currently unmet. This change restores that gate as part of
the same toolchain work.

## What Changes

- Upgrade direct dependencies to their patched versions: `postcss` to `>=8.5.23` and
  `vitest` to `>=4.1.11` (which brings `vite` `>=6.4.3`, `esbuild` `>=0.25.0`, and
  `@vitest/mocker` `4.1.11` with it).
- **BREAKING** Migrate `tailwindcss` from 3.3.3 to 4.3.3 with a CSS-first config and the
  `@tailwindcss/postcss` plugin. Tailwind 4 has no runtime dependencies, so this removes
  the entire `chokidar`/`micromatch`/`braces`/`fast-glob`/`picomatch`/`yaml`/
  `postcss-selector-parser`/`glob`/`sucrase` cluster, including the unfixable `braces`
  advisory.
- **BREAKING** Migrate the lint toolchain to a standalone `eslint` 10.x flat config
  (`@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks`). `eslint-config-next`
  is dropped because its `@next/eslint-plugin-next` hard-depends on the unfixable
  `fast-glob` -> `micromatch` -> `braces` chain. This removes the `@typescript-eslint@6`/
  `globby`/`fast-glob`/`micromatch`/`minimatch@9`/`brace-expansion@2` cluster. The `lint`
  script becomes an explicit ESLint CLI invocation (`eslint .`) because `next lint` no
  longer exists.
- Drop `autoprefixer`, which Tailwind 4 makes redundant and which is the sole source of
  the `browserslist` finding.
- Keep `jsdom` at 24 and constrain `ws` to `>=8.21.0`: `jsdom` 30 removes the `ws`
  dependency but its `undici` requires a newer Node than the CI/Docker Node 20 runtime, so
  the locked install stays on `jsdom` 24 with `ws` overridden to a patched release.
- Evaluate version-scoped `overrides` for transitive packages with no safe consumer
  upgrade. After the Tailwind 4 and standalone ESLint 10 migrations, every remaining
  consumer resolves to a patched version naturally (`lodash` 4.18.1, `@babel/runtime`
  7.26.10, `ajv` 6.14.0, `cross-spawn` 7.0.6, `flatted` 3.4.2, `minimatch` 10.2.6,
  `brace-expansion` 5.0.12), so the only retained override is `ws` `8.21.0` for
  `jsdom` 24.
- Regenerate `package-lock.json` so `npm ci` stays reproducible in the Docker image and
  CI, and keep the lint step as a hard gate before the image build.

## Capabilities

### New Capabilities

- `dependency-security`: the acceptance policy for a dependency tree free of known
  critical/high vulnerabilities, the rules for pinning and overriding transitive
  dependencies, and the requirement that the installed tree stays reproducible and builds.

### Modified Capabilities

<!-- None: existing capability requirements are not changing. The deployment requirement
     that a lint error must block the build is restored by this change, not redefined. -->

## Impact

- `package.json`, `package-lock.json`: version bumps, a retained `ws` `8.21.0` override,
  dropped/added dependencies (`tailwindcss`, `@tailwindcss/postcss`, `autoprefixer`,
  `eslint`, `eslint-config-next`, `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, `globals`, `vitest`, `jsdom`).
- `tailwind.config.ts` (migrated to CSS-first), `postcss.config.js` (plugin swap), and
  `app/globals.css` (`@tailwind` directives replaced by Tailwind 4 import), plus any
  `tailwindcss-animate` replacement needed by Tailwind 4.
- `.eslintrc.json` replaced by a flat `eslint.config.mjs`; `package.json` `lint` script
  changed from `next lint` to the ESLint CLI.
- `Dockerfile` and `.github/workflows/ci-cd.yml` are unchanged except that they consume the
  regenerated lockfile; the CI lint step is retained as the build gate.
- Application runtime APIs are untouched: `react`/`react-dom` stay `18.2.0` (Next 16.3.8
  accepts `^18.2.0`), and `next` is already `16.3.8`.
