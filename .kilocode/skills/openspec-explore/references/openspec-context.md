# OpenSpec awareness details

## Change list (work in flight)

```bash
openspec list --json
```

Tells you if there are active changes, their names, schemas, and status, and what the user might be working on. This does **not** include the project's durable capabilities.

## Capability inventory

```bash
openspec list --specs
```

Add `--json` for ids and requirement counts. Append `--store "<id>"` only for a registered standalone store. This is the inventory of what the project already claims to do.

To inspect one capability without pulling the whole spec file into context:

```bash
openspec show "<spec-id>" --type spec --json --no-scenarios
```

Returns that capability's purpose and requirement texts. `--type spec` stops a change of the same name from making it ambiguous.

The filtered read is only an overview. Before deciding what is already covered or what should change, read each relevant spec in full, including scenarios:

```bash
openspec show "<spec-id>" --type spec
```

## Project context

Read from the resolved root — `<root.path>/openspec/config.yaml` (or `config.yml`); skip if neither exists:

- `context` — project background: tech stack, conventions, constraints.
- `rules` — keyed by artifact id; the entries for an artifact apply only when you write that artifact.

Ground your thinking in these. They are constraints for you to follow, not content to reproduce: do NOT copy them into the conversation or into any artifact you create.
