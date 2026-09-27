# CLI commands

All commands accept `--store <id>` when a registered store is selected (sticky). Only the commands listed in `references/store.md` take the flag.

| Command | Purpose |
| --- | --- |
| `openspec store list --json` | Discover registered store ids. |
| `openspec context --json` | Resolve the OpenSpec root; reports `no_openspec_root` when absent. |
| `openspec schemas --json` | List workflow schemas (run from the resolved root). |
| `openspec new change "<name>"` | Create a change (`--schema <name>` to override the default). |
| `openspec status --change "<name>" [--json]` | Artifact build order and status; `--json` for `applyRequires`, `artifacts[].status`, `artifacts[].requires`, `planningHome`, `changeRoot`, `artifactPaths`, `actionContext`. |
| `openspec instructions <artifact-id> --change "<name>" --json` | Per-artifact `template`, `instruction`, `resolvedOutputPath`, `dependencies`, `context`, `rules`, `skipped`/`warning`. |
| `openspec list [--json]` | Active changes. |
| `openspec list --specs [--json]` | Durable capabilities. |
| `openspec show "<spec-id>" --type spec [--json] [--no-scenarios]` | One capability's purpose and requirement texts. |
| `openspec validate --specs` | Validate main specs. |
| `openspec view` | Interactive viewer. |
| `openspec archive ...` | Native archive command (the archive workflow reimplements it deliberately). |
| `openspec init` | Initialize OpenSpec — only ever *offered*, never run automatically by this workflow. |

Treat any non-zero exit or invalid JSON from a required lookup as a failure, not as an empty result set.
