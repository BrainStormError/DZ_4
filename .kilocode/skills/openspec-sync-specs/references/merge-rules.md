# Merge rules

## Per-operation semantics

**ADDED Requirements**

- Requirement absent in the main spec → add it.
- Requirement already present → update it to match the delta (treat as implicit MODIFIED).

**MODIFIED Requirements**

- Find the requirement in the main spec and apply the changes: new scenarios the main spec lacks, modifications to existing scenarios, and requirement-description changes.
- Preserve scenarios and content the delta does not mention.

**REMOVED Requirements**

- Remove the entire requirement block from the main spec.
- Retiring the whole capability (deleting `spec.md`) has strict conditions — see `retirement.md`.

**RENAMED Requirements**

- Find the FROM requirement and rename it to TO.

**`## Purpose`**

- The main spec already has one and it is authoritative — leave it alone (this is what `openspec archive` does: it warns and moves on).

## Intelligent merging

Unlike programmatic merging, you merge rather than overwrite:

- A MODIFIED block carries the whole requirement — body plus every scenario that survives the change. `openspec validate` and `openspec archive` both reject one that drops a scenario the main spec still has.
- Keep anything the delta does not mention, in the main spec's existing order.
- Use judgment to merge sensibly; the operation must be idempotent (running twice gives the same result).
- Show what you are changing as you go; ask when something is unclear.

## Creating a new main spec

When the capability does not exist yet:

- Create `<planningHome.root>/openspec/specs/<capability-path>/spec.md`.
- Copy the delta's `## Purpose` body verbatim when it has one (this is what `openspec archive` does); only write a brief TBD placeholder when it does not.
- Add a `## Requirements` section with the ADDED requirements, following the main spec format.
