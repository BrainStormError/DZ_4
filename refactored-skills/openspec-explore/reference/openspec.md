# OpenSpec command flow (detail)

## Store selection

A store is a standalone OpenSpec repo registered on this machine. If named or if the work lives in one:
1. `openspec store list --json` -> discover ids.
2. Pass `--store <id>` on commands that read/write specs and changes: `new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `schemas`, `view`.
3. Treat `--store <id>` as **sticky** for the rest of the workflow. Other commands do not take it. Follow-up hints already carry it.

Without a store, commands act on the nearest local `openspec/` root.

## Context check

- `openspec list --json` -> active changes (work in flight): names, schemas, status.
- `openspec list --specs` -> durable capabilities (not shown by `openspec list` alone). Add `--json` for ids/counts.
- `openspec show "<spec-id>" --type spec --json --no-scenarios` -> capability purpose + requirement texts, lightweight.
  The filtered read is only an overview. Before judging coverage, read the full spec including scenarios: `openspec show "<spec-id>" --type spec`.
  `--type spec` disambiguates from a same-named change.
- `<root.path>/openspec/config.yaml` (or `.yml`), skip if absent:
  - `context`: tech stack, conventions, constraints.
  - `rules`: keyed by artifact id - apply only when writing that artifact.

## Capturing a NEW change

1. `openspec new change "<name>"` (with `--store <id>`) **before** any artifact. Never hand-create the change dir - CLI scaffolds `.openspec.yaml` and required metadata.
2. `openspec status --change "<name>" --json`; process requested artifacts in dependency order.
3. For each requested artifact that is `ready`: `openspec instructions "<artifact-id>" --change "<name>" --json`.
   - If its `instruction` states a condition that does not apply -> record a deliberate skip.
   - If blocked by an **unrequested** direct prerequisite: run `instructions` for it (ready or blocked); evaluate its condition; if non-conditional or applicable, ask before expanding capture. Never create an unrequested prerequisite without approval.
4. Follow returned `template`/`instruction`. Read `dependencies` files. Apply `context`/`rules` as constraints, don't copy them. If instruction delegates to a skill/command, invoke it; else write to `resolvedOutputPath` (resolve globs to a concrete path). Verify it exists.
5. After each artifact re-run `openspec status --change "<name>" --json`; continue until every requested artifact is `done`, `skipped`, or deliberately skipped.
   - Dependencies are enablers, not gates: if a requested artifact is `blocked` **only** by a deliberately-skipped conditional prerequisite, run `instructions` for it, then create it (step 3) when those skips are its sole missing deps.
   - Tell the user about deliberate conditional skips; remember them; do not reconsider.

Capture the requested artifacts without making the user invoke another command. If they only asked to start a change, stop after scaffolding and show status.

## Working with an EXISTING change

1. `openspec status --change "<name>" --json`; use `changeRoot`, `artifactPaths`, `actionContext`. Read `artifactPaths.<artifact>.existingOutputPaths`.
2. Reference artifacts naturally in conversation (e.g. "Your design says Redis, but SQLite now fits...").
3. Offer where to capture (user decides, no pressure, no auto-capture):

   `<capability-path>` = spec dir relative to `specs/` (e.g. `user-auth` or `identity/user-auth`). Preserve an existing capability's full path; follow project organization for new ones.

   | Insight | Capture in |
   |---------|-----------|
   | New requirement discovered | `specs/<capability-path>/spec.md` |
   | Requirement changed | `specs/<capability-path>/spec.md` |
   | Design decision made | `design.md` |
   | Scope changed | `proposal.md` |
   | New work identified | `tasks.md` |
   | Assumption invalidated | Relevant artifact |
