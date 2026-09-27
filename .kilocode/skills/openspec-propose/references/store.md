# Store selection

A store is a standalone OpenSpec repo registered on this machine.

- If the user names a store, or the work lives in one, run `openspec store list --json` to discover registered store ids.
- Pass `--store <id>` on every command that reads or writes specs and changes: `new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`, `schemas`, `view`.
- Once selected, `--store <id>` is **sticky** for the rest of the workflow. Every unscoped command example in `SKILL.md` is shorthand: append the flag before running it. Example: run `openspec status --change "<name>" --json --store "<id>"`, not the unscoped form.
- No other command takes the flag.
- Hints printed by commands already carry the flag; keep it on follow-ups.
- Without a store, commands act on the nearest local `openspec/` root.
