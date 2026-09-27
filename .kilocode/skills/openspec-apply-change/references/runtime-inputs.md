# Apply instructions: fields and runtime inputs

`openspec instructions apply --change "<name>" --json` returns:

- `contextFiles` — artifact ID → array of concrete file paths (varies by schema: proposal/specs/design/tasks, or spec/tests/implementation/docs).
- Progress — total, complete, remaining.
- Task list with status.
- A dynamic `instruction` based on current state.
- Optional `context` — current required project instruction input from the selected root.
- Optional `operationGuidance` — current advisory guidance for apply.

## States

- `state: "blocked"` (missing artifacts) → show the message, suggest `/opsx-continue`; if it is not installed, run `openspec status --change "<name>" --json` to see the next artifact and `openspec instructions <artifact-id> --change "<name>" --json` for how to create it.
- `state: "all_done"` → congratulate, suggest archive.
- Otherwise → proceed to implementation.

## context and operationGuidance

Treat `context` as a required prompt-level input. Read and consider it, and apply relevant project facts, conventions, and constraints while implementing.

Treat `operationGuidance` as optional additive advice. Read and consider every entry, and follow entries that are applicable and compatible with the built-in workflow.

Keep both fields separate from CLI-returned state, missing artifacts, tasks, progress, `contextFiles`, and the built-in `instruction`. They are not evidence of task completion, do not replace the built-in instruction, and do not permit bypassing a blocked state. If `context` conflicts with the built-in instruction, an explicit user choice, or a CLI-controlled value, report the conflict and preserve the controlling value. If guidance is inapplicable or conflicts with those controlling inputs, do not follow it and explain why. These are prompt-level behavior contracts, not enforceable checks.

Do not copy `context` or `operationGuidance` verbatim into implementation files or planning artifacts unless the user separately asks for that content.
