---
name: openspec-update-change
description: Update an OpenSpec change by revising its existing planning artifacts and keeping them coherent with one another. Use when the user wants to revise a change's plan, fold new decisions into it, or reconcile its artifacts after an edit. Never edits code.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.13.0"
---

Revise a change's existing planning artifacts and keep them coherent. Never edit code.

**Store.** If the user names a registered store, or the work lives in one, read `references/store.md` first and keep `--store <id>` on every spec/change command.

**Input.** Optional change name; if omitted, infer from context, else prompt. Ask when vague or ambiguous.

`/opsx-continue` is an optional workflow that may not be installed. Before suggesting it, verify it is available. If it is unavailable, `openspec status --change "<name>" --json` shows the next artifact and `openspec instructions "<artifact-id>" --change "<name>" --json` explains how to create it.

## Steps

1. **Select the change.** Use the given name; else infer; else auto-select the only active change; else `openspec list --json` (sorted by most recently modified) and ask. When prompting, present the top 3–4 most recently modified changes with name, schema (`schema` field else `spec-driven`), status (e.g. "0/5 tasks", "complete", "no tasks"), and recency (`lastModified`); mark the most recent "(Recommended)". Announce: "Using change: <name>" and the override (e.g. `/opsx-update <other>`).

2. **Get the change's artifacts.** `openspec status --change "<name>" --json` → `schemaName`, `artifacts[]` (statuses `done`/`skipped`/`ready`/`blocked`), `isPlanningComplete` (older CLIs: `isComplete`), and `planningHome`/`changeRoot`/`artifactPaths`/`actionContext`. Use these paths; never assume repo-local ones, never assume artifact ids, and never branch on hardcoded artifact names — custom schemas must work unchanged.
   - The files to edit are `artifactPaths.<id>.existingOutputPaths` — the concrete files on disk, already glob-expanded. Do NOT write to `resolvedOutputPath`: for a glob artifact it is still the pattern, not a real file.

3. **Understand the request.** A specific revision ("the design now uses X") is the starting edit. A bare "update" / "make this coherent" means a coherence review: read the existing artifacts and check them against each other for contradictions, gaps, and duplication.

4. **Read and reconcile.** Read the artifact(s) the request touches plus the change's other existing artifacts. Apply the requested edit, then check every other existing artifact against it **in any direction** — an edit to a later artifact may require revising an earlier one, not only the reverse. Build order is a useful reading order, not a constraint on what may be revised. Note everything now inconsistent, missing, or contradictory.
   - Revise only files that already exist (`existingOutputPaths`). Do not create artifacts that do not exist, and do not invent new files under a glob artifact — note them and point the user to `/opsx-continue`.
   - If the change is already coherent, say so and make no edits. Details: `references/reconcile.md`.

5. **Confirm and apply, one artifact at a time.** Show each proposed revision and why; write only after the user confirms. If the user rejects a revision, do not write it. For a substantial rewrite, first get that artifact's rules and template: `openspec instructions "<artifact-id>" --change "<name>" --json`.

6. **Point to the next step (guidance only — NEVER act on it).** Missing artifacts → suggest `/opsx-continue`. Change already implemented (tasks checked off) → the code may no longer match the revised plan; suggest `/opsx-apply`. Everything done and implemented → suggest `/opsx-archive`.

## Output

After each invocation show: which artifacts were revised (and which proposed revisions were rejected); anything deferred to `/opsx-continue` (not-yet-created artifacts or files); where the change stands and the recommended next command.

## Routing

| Situation | Read |
| --- | --- |
| Coherence review, any-direction reconciliation, `existingOutputPaths` vs globs | `references/reconcile.md` |
| Registered store / `--store` stickiness | `references/store.md` |
| A worked coherence review | `examples/coherence-review.md` |

## Guardrails

- Planning artifacts only — NEVER edit implementation code. If the revised plan implies code changes, stop and point to `/opsx-apply`.
- Use artifact ids and paths reported by `openspec status`; never branch on hardcoded artifact names.
- Edit only concrete files in `existingOutputPaths`; never write to a glob `resolvedOutputPath`.
- Do not advance the build frontier: no new artifacts, no new files under glob artifacts — that is `/opsx-continue`'s job.
- Confirm every edit with the user before writing.
- If the request changes the change's *intent* rather than refining it, first verify whether the optional `/opsx-new` workflow is available. If it is, recommend starting fresh with `/opsx-new` ("Update vs. Start Fresh" heuristic). If not, ask for a distinct unused change name and recommend `openspec new change "<new-change-name>"`.
