---
name: openspec-archive-change
description: Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.13.0"
---

Archive a completed change in the experimental workflow.

**Store.** If the user names a registered store, or the work lives in one, read `references/store.md` first and keep `--store <id>` on every spec/change command.

`<capability-path>` is the spec directory relative to `specs/` (e.g. `user-auth`, `identity/user-auth`). Preserve the full path from each delta spec when resolving its main spec.

**Input.** Optional change name; if omitted, infer from context, else prompt. Ask when vague or ambiguous.

## Steps

1. **Select the change.** Use the given name; else infer; else auto-select the only active change; else `openspec list --json` and ask. Show only active (non-archived) changes and include each change's schema if available. Announce: "Using change: <name>" and the override (e.g. `/opsx-archive <other>`).

   Then load archive inputs (advisory, never blocking): `openspec instructions archive --change "<name>" --json` with the same root flags. Non-zero exit or invalid JSON (e.g. an older CLI without the command) → continue with no context and no guidance: no error, no stop. On success, `context` is a required prompt-level input and `operationGuidance` is optional additive advice — read both and follow applicable, compatible guidance. Neither may set paths, skip prompts, or add flags, and their text is never copied into outputs. Details: `references/runtime-inputs.md`.

2. **Check artifacts.** `openspec status --change "<name>" --json` → `schemaName`, `planningHome`/`changeRoot`/`artifactPaths`/`actionContext`, and `artifacts[]` with statuses. Any artifact neither `done` nor `skipped` → warn, list the incomplete ones, ask to confirm, and proceed if the user confirms. (`skipped` satisfies the requirement — the change declares `skip_specs`.)

3. **Check tasks.** Read the tasks file (usually `tasks.md`); count `- [ ]` (incomplete) vs `- [x]`. Incomplete → warn with the count, ask to confirm, proceed if confirmed. No tasks file → proceed with no task warning.

4. **Assess delta-spec sync.** Delta source = `artifactPaths.specs.existingOutputPaths` only. If the `specs` entry is missing or `existingOutputPaths` is empty, skip this step's prompt and never infer deltas from other artifacts.
   - For each delta, compare it with `<planningHome.root>/openspec/specs/<capability-path>/spec.md`; summarize the adds / modifications / removals / renames.
   - Prompt: changes needed → "Sync now (recommended)" / "Archive without syncing"; already synced → "Archive now" / "Sync anyway" / "Cancel".
   - Route: "Cancel" → stop, do not archive. Archive choices → step 5. Sync choices → below. Anything else → ask again rather than archiving.
   - Before a sync writes anything: run `openspec instructions specs --change "<name>" --json` once (same root flags); require zero exit and valid JSON, else report and stop before any write. Omitted `rules` = no rules. Rules constrain only the merged main specs — never archive guidance, never copied into outputs.
   - Run the `openspec-sync-specs` workflow **inline** (agent-driven), passing the delta analysis and the rules snapshot, and reuse that snapshot (do not fetch `specs` instructions again). Never delegate it to a background task — step 5 would move `changeRoot` out from under a sync still reading it. If you can only delegate, delegate synchronously and wait.
   - Then re-verify every capability that has a delta spec (not just ones the sync reports): ADDED present; MODIFIED carrying the delta's scenario/description changes with other scenarios intact; REMOVED gone, and a retired capability's main spec deleted rather than left empty; RENAMED present under the new name and absent under the old. Any failure or mismatch → report what differs and stop; nothing has moved yet. Full checklist: `references/sync-and-verify.md`.

5. **Archive.** `mkdir -p "<planningHome.changesDir>/archive"`. Target name: keep an existing `YYYY-MM-DD-` prefix, otherwise prepend today's date — never stack a second date. Target exists → fail, suggest renaming the existing archive or using another date. Else `mv "<changeRoot>" "<planningHome.changesDir>/archive/<target-name>"`.

6. **Summarize.** See the output block below.

## Output

```markdown
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** <planningHome.changesDir>/archive/<target-name>/
**Specs:** "✓ Synced to main specs" only if step 4 verification passed; otherwise "No delta specs" or "Sync skipped".

<"All artifacts complete. All tasks complete." — or the warnings, e.g. "Archived with 2 incomplete tasks">
```

## Routing

| Situation | Read |
| --- | --- |
| Runtime context/guidance semantics, archive-instructions behavior | `references/runtime-inputs.md` |
| Delta sync verification checklist, retirement, sync-failure handling | `references/sync-and-verify.md` |
| Registered store / `--store` stickiness | `references/store.md` |
| A filled-in archive summary | `examples/archive-summary.md` |

## Guardrails

- Announce the selected change; prompt for selection when it is ambiguous.
- Completion checks come from the artifact graph (`status --json`).
- Warnings never block archiving — inform and confirm.
- `.openspec.yaml` moves with the directory.
- Never archive while a spec sync is still in flight: run it inline and verify the main specs before moving `changeRoot`.
- Delta specs present → always run the sync assessment and show the combined summary before prompting.
- Apply relevant runtime context and report conflicts; operation guidance stays advisory; explain any inapplicable or conflicting advice.
- Artifact rules constrain only the specs being written and are never operation guidance.
- Never copy runtime context, operation guidance, or rule text into output files.
