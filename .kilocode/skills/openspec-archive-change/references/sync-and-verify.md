# Delta sync assessment and verification

## Sources and comparison

- Delta specs come **only** from `artifactPaths.specs.existingOutputPaths` in the status JSON. If the `specs` entry is missing or the list is empty, proceed without a sync prompt and never infer delta specs from other artifacts.
- Compare each delta with its main spec at `<planningHome.root>/openspec/specs/<capability-path>/spec.md`, using the store-aware `planningHome.root` — not a hardcoded repo path.
- Determine the changes that would be applied (adds, modifications, removals, renames) and show a combined summary before prompting.

## Pre-sync requirements snapshot

Before a selected sync writes any main spec, run `openspec instructions specs --change "<name>" --json` once with the same selected-root flags. Require a zero exit status and valid artifact-instruction JSON. If it fails or returns invalid JSON, report the error and stop before writing any main spec or moving the change. A valid response with omitted `rules` is the no-rules case. Apply returned `rules` only to the content and form of the main specs produced by this merge; never use them as archive guidance, never change CLI behavior, and never copy the rule text into any output.

## Running the sync

Run the `openspec-sync-specs` workflow inline (agent-driven intelligent merge) for change `<name>`, passing the delta spec analysis and the fetched specs-rule snapshot, and wait for it to finish. The inline sync must reuse that snapshot without fetching `specs` instructions again.

Do **not** delegate it to a background task — the archive step would move `changeRoot` out from under a sync still reading it, leaving the change archived and the main specs never updated. If your agent can only run it by delegation, delegate synchronously and wait for the result.

## Post-sync verification

Re-run the comparison from the top of the assessment against **every** capability that has a delta spec in `artifactPaths.specs.existingOutputPaths` — not only the ones the sync reports it touched. A successful sync leaves nothing left to apply, so each capability must now read as already synced:

- **ADDED** requirements present.
- **MODIFIED** requirements carrying the scenario and description changes named in the delta, with their other scenarios intact.
- **REMOVED** requirements gone — and where this sync retired a capability (removed its last requirement, leaving `## Requirements` empty), its main spec deleted rather than left empty. A spec the sync deliberately kept and reported is also a match.
- **RENAMED** requirements present under the new name and absent under the old one.

If the sync failed, or any capability does not match, report what differs and stop — do not archive. Nothing has moved and `changeRoot` is intact, so the user can fix the mismatch or re-run the sync and start the archive again.
