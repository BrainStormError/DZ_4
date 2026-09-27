---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.13.0"
---

Implement tasks from an OpenSpec change.

**Store.** If the user names a registered store, or the work lives in one, read `references/store.md` first and keep `--store <id>` on every spec/change command.

**Input.** Optional change name (e.g. `/opsx-apply add-auth`). If omitted, infer from conversation context; if vague or ambiguous, you MUST prompt with available changes.

## Steps

1. **Select the change.** Use the given name; else infer from context; else auto-select the only active change; else run `openspec list --json` and ask. Always announce: "Using change: <name>" and the override (e.g. `/opsx-apply <other>`).

2. **Read schema/state.** `openspec status --change "<name>" --json` → `schemaName`, `planningHome`, `changeRoot`, `actionContext`, and which artifact holds the tasks (spec-driven: `tasks`; otherwise read it from status).

3. **Get apply instructions.** `openspec instructions apply --change "<name>" --json` → `contextFiles` (artifact id → concrete file paths), progress (total/complete/remaining), the task list with status, a state-dependent `instruction`, and optional `context` + `operationGuidance`.
   - `state: "blocked"` (missing artifacts) → show the message and suggest `/opsx-continue`; if that workflow is not installed, run `openspec status --change "<name>" --json` for the next artifact and `openspec instructions <artifact-id> --change "<name>" --json` for how to create it.
   - `state: "all_done"` → congratulate and suggest archive.
   - Otherwise → implement.
   - `context` is a **required** prompt-level input; `operationGuidance` is **optional additive** advice. Read both and follow applicable, compatible guidance. They are not evidence of completion, do not replace `instruction`, and cannot bypass `blocked`. On conflict with the built-in instruction, a user choice, or a CLI value, report the conflict and keep the controlling value; skip inapplicable/conflicting guidance and say why. Details: `references/runtime-inputs.md`.

4. **Read context files.** Read every path listed under `contextFiles`. spec-driven: proposal, specs, design, tasks; other schemas: whatever the CLI lists. Do not copy `context` or `operationGuidance` into files unless the user separately asks.

5. **Show progress.** Schema in use, "N/M tasks complete", remaining tasks, the dynamic instruction.

6. **Implement tasks (loop until done or blocked).** For each pending task: show which task you are on, make minimal focused changes, then immediately flip `- [ ]` → `- [x]`. Mark done only when the specified behavior is fully implemented — never for partial or deferred work.

   **Pause when:**
   - the task is unclear → ask for clarification;
   - implementation reveals a design issue → suggest updating the artifacts;
   - a task needs work beyond the spec/tasks, or you are tempted to drop, narrow, defer, or accept exceptions to specified behavior → surface the added scope and ask; never absorb it silently;
   - an error or blocker occurs → report and wait for guidance;
   - the user interrupts.

7. **Report on completion or pause.** Tasks completed this session, overall "N/M tasks complete", then either the archive suggestion (all done) or the reason for the pause. Output shapes: `examples/output-formats.md`.

## Routing

| Situation | Read |
| --- | --- |
| `context`/`operationGuidance` semantics, apply-instructions fields, state handling | `references/runtime-inputs.md` |
| Registered store / `--store` stickiness | `references/store.md` |
| Output templates (progress / complete / paused) | `examples/output-formats.md` |

## Guardrails

- Read context files before starting; take file names from `contextFiles`, never assume them.
- Keep code changes minimal and scoped to one task; update the checkbox immediately.
- Pause on errors, blockers, or unclear requirements — do not guess.
- Never silently narrow, defer, or simplify away specified behavior; surface added scope.
- Do not treat context or operation guidance as proof that a task is complete.
- Preserve CLI-controlled blocked/ready/all-done behavior and completion criteria.
- **Fluid workflow.** Invocable at any time — before all artifacts exist (if tasks exist), after partial work, or interleaved with other actions. If implementation reveals design issues, suggest updating the artifacts; do not treat phases as locked.
