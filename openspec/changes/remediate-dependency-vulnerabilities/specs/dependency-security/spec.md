## Purpose

Defines the acceptance policy for a dependency tree that is free of known critical and high
vulnerabilities, reproducible from its lockfile, and buildable after the toolchain changes
needed to remove unfixable packages.

## ADDED Requirements

### Requirement: No known critical or high vulnerabilities

The installed dependency tree SHALL NOT contain any package version inside a known
critical or high security advisory range. The total reported advisory count SHALL be zero
for both production and development dependencies.

#### Scenario: Clean install reports no findings

- **WHEN** dependencies are installed from the committed lockfile with `npm ci` and a
  vulnerability scan is run
- **THEN** the report contains zero critical findings and zero high findings

#### Scenario: Scan is not suppressed

- **WHEN** the vulnerability scan runs
- **THEN** it evaluates production and development dependencies with no configured
  ignore-list or advisory suppression

### Requirement: Patched versions are enforced for vulnerable transitive packages

Packages that remain in the tree but have no safe consumer upgrade SHALL be constrained to
a patched version for their consumed major line, so that no lockfile entry resolves into an
advisory range.

#### Scenario: Transitive packages resolve to patched versions

- **WHEN** the lockfile is generated
- **THEN** every entry for `brace-expansion`, `minimatch`, `js-yaml`, `lodash`, `ajv`,
  `flatted`, `picomatch`, `cross-spawn`, and `@babel/runtime` resolves to at least the
  patched version for its major line

#### Scenario: Coexisting majors stay isolated

- **WHEN** two dependents consume different major lines of the same package (for example
  `minimatch@3` and `minimatch@9`, or `brace-expansion@1` and `brace-expansion@2`)
- **THEN** each major resolves to its own patched version and neither major is forced onto
  a version whose API it does not accept

### Requirement: Unfixable dependency chains are removed rather than suppressed

When a package has no patched release within the range that is consumed, the project SHALL
remove the toolchain that pulls it instead of relying on suppression or ignore rules.

#### Scenario: Unpatchable package is eliminated

- **WHEN** the dependency tree is inspected
- **THEN** no package with zero patched releases in its consumed range is present as a
  resolved node

#### Scenario: Derived glob chains disappear

- **WHEN** the toolchains that consumed the unpatchable package are removed
- **THEN** the dependent nodes that only existed to serve those toolchains are also absent
  from the resolved tree

### Requirement: Dependency installation is reproducible

The application SHALL install deterministically from the committed lockfile, and the image
build and continuous integration SHALL use the same locked resolution as the local
development tree.

#### Scenario: Locked install does not mutate the lockfile

- **WHEN** `npm ci` runs from a clean checkout
- **THEN** the install succeeds, the lockfile is unchanged, and the resolved versions match
  the committed tree

### Requirement: Upgraded toolchain preserves build and behavior

The production build and the existing test suite SHALL pass on the upgraded toolchain, and
the application's observable behavior SHALL be unchanged by the dependency and styling
migration.

#### Scenario: Production build succeeds

- **WHEN** the production build runs
- **THEN** it completes successfully and produces the standalone output used by the image

#### Scenario: Existing tests pass

- **WHEN** the test suite runs
- **THEN** all existing tests pass on the upgraded test toolchain

#### Scenario: Styling and animations are preserved

- **WHEN** the application renders after the styling toolchain migration
- **THEN** the previously used utility classes and custom animations resolve as before

### Requirement: Lint is executed and gates the build

The lint step SHALL execute an actual linter and SHALL fail the pipeline on a lint error
before the production image is built.

#### Scenario: Lint runs the linter

- **WHEN** the lint script is invoked
- **THEN** the linter analyzes the project and reports findings, rather than the script
  being an unchanged no-op

#### Scenario: Lint error blocks the image

- **WHEN** a lint error is present
- **THEN** the checks stage fails and the image build does not start
