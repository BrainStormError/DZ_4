# Runtime inputs and archive instructions

After resolving the selected change and planning root, run:

```bash
openspec instructions archive --change "<name>" --json
```

Keep the same selected-root flags on this command. This lookup is **advisory and optional**: it only supplies extra prompt inputs, so it must never block archiving. If it exits non-zero or returns invalid JSON — for example on an older CLI that does not support this command yet — continue the archive workflow with no context and no operation guidance. Do not report an error and do not stop.

A successful response may omit both optional fields.

- `context` — treat as a **required** prompt-level input. Read and consider it, and apply relevant project facts, conventions, and constraints.
- `operationGuidance` — treat as **optional additive** advice. Read and consider every entry, and follow entries that are applicable and compatible with the built-in archive workflow.

Keep both fields separate from built-in steps, explicit user choices, resolved paths, CLI checks, and command contracts. If `context` conflicts with one of those controlling inputs, report the conflict and preserve the controlling value. If guidance is inapplicable or conflicts with a controlling input, do not follow it and explain why. Do not infer replacement paths, skipped prompts, or flags from either field, and do not copy their text verbatim into specs, change artifacts, or archive summaries unless the user separately asks. These are prompt-level behavior contracts, not enforceable checks.
