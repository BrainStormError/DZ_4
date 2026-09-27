---
name: openspec-sync-specs
description: Sync delta specs from a change to main specs. Use when the user wants to update main specs with changes from a delta spec, without archiving the change.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.13.0"
---

Sync delta specs from a change to main specs.

This is an **agent-driven** operation — you read delta specs and directly edit main specs to apply the changes, enabling intelligent merging (e.g. adding one scenario without copying the whole requirement).

**Store.** If the user names a registered store, or the work lives in one, read `references/store.md` first and keep `--store <id>` on every spec/change command.

`<capability-path>` is the spec directory relative to `specs/` (e.g. `user-auth`, `identity/user-auth`). Preserve the full path from each delta spec when resolving its main spec.

**Input.** Optional change name; if omitted, infer from context, else prompt. Ask when vague or ambiguous.

## Steps

1. **Select the change.** Use the given name; else infer; else auto-select the only active change; else `openspec list --json` and ask. When prompting, show changes that have delta specs (under `specs/`). Announce: "Using change: <name>" and the override (e.g. `/opsx-sync <other>`).

2. **Resolve context.** `openspec status --change "<name>" --json` → `planningHome.root`. Main specs live under `<planningHome.root>/openspec/specs/` — use that store-aware root for every main-spec path below, never a hardcoded repo path.

3. **Find delta specs.** Use `artifactPaths.specs.existingOutputPaths` as the **only** source. If the `specs` entry is missing or empty, report that there are no delta specs, do not infer them from other artifacts, and stop without requesting artifact instructions or writing a main spec.
   - Sync every path unless the caller (archive, or a user naming a complete entry) narrowed the set. Copy named entries verbatim; sync only those, and never widen back to the full list. A named path not in `existingOutputPaths` → report it and stop, do not sync it. An empty named list → nothing to sync, stop.
   - Delta sections: `## ADDED`, `## MODIFIED`, `## REMOVED`, `## RENAMED Requirements` (FROM:/TO:). Formats: `references/spec-format.md`.

4. **Snapshot specs rules.** Before the first main-spec write, obtain one current `openspec instructions specs --change "<name>" --json` snapshot: reuse the snapshot archive supplied when it invoked this workflow inline, otherwise run the command once now with the same root flags.
   - Non-zero exit or invalid artifact-instruction JSON → report and stop before writing any main spec; do not treat it as an absent rule set.
   - Omitted `rules` = no artifact rules; the normal semantic merge continues.
   - Apply `rules` only to the content and form of the main specs this merge produces. They are not operation guidance: they cannot change roots, delta paths, CLI checks, or steps, and their text is never copied into a main spec or summary.

5. **For each selected capability, apply changes to its main spec.** Read the delta, then read the main spec at `<planningHome.root>/openspec/specs/<capability-path>/spec.md` (it may not exist yet), then merge:
   - **ADDED** — add the requirement; if it already exists, update it to match (implicit MODIFIED).
   - **MODIFIED** — find the requirement and apply added/modified scenarios and description changes; preserve every scenario the delta does not mention.
   - **REMOVED** — delete the requirement block. Deleting the whole `spec.md` requires the strict retirement conditions; otherwise stop that capability's sync and report the blocker. See `references/retirement.md`. Never leave an empty `## Requirements` section.
   - **RENAMED** — find the FROM requirement, rename to TO.
   - **`## Purpose` in the delta** — a main spec's existing Purpose is authoritative; leave it alone (this is what `openspec archive` does: warn and move on).
   - **New capability** — create `<planningHome.root>/openspec/specs/<capability-path>/spec.md`; copy the delta's `## Purpose` body verbatim when present, else a brief TBD placeholder; put ADDED requirements under one `## Requirements` section; follow the main-spec format in `references/spec-format.md`.
   - Merge rules in full: `references/merge-rules.md`.

6. **Validate.** `openspec validate --specs` with the same root flags. On failure, report the problems and do not claim the sync succeeded.

7. **Summarize.** Which capabilities were updated and what changed (added/modified/removed/renamed); any new main spec left with a TBD Purpose placeholder; any capability retired (name the deleted `spec.md`, its Purpose, and a pasteable `git checkout` only when it lived in the caller's checkout — otherwise checkout-scoped recovery guidance). Sample output: `examples/delta-and-main.md`.

## Routing

| Situation | Read |
| --- | --- |
| Exact delta / main spec formats and headers | `references/spec-format.md` |
| ADDED/MODIFIED/RENAMED semantics, preservation, idempotence | `references/merge-rules.md` |
| Deleting a retired capability's `spec.md` | `references/retirement.md` |
| Registered store / `--store` stickiness | `references/store.md` |
| Worked delta-to-main merge | `examples/delta-and-main.md` |

## Guardrails

- Read both delta and main spec before changing anything; preserve content the delta does not mention.
- Never copy a delta file into a main spec as-is: merge so the main spec keeps main-spec structure with no delta operation headers.
- Delta specs come only from `artifactPaths.specs.existingOutputPaths`; never infer them from unrelated artifacts and never widen a caller-supplied subset.
- Fetch specs instructions once for a direct sync, or reuse the archive-supplied snapshot inline; always stop before a write on a non-zero or invalid-JSON response.
- Artifact rules constrain only the specs being written and are never copied into output files.
- The operation is idempotent — running twice yields the same result.
- Show what you are changing as you go; ask when something is unclear.
