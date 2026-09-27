# Retiring a capability (REMOVED deletes the whole spec)

Delete the whole `spec.md` — and the directory once nothing else is left in it — only when **all** of these hold:

1. removing the requirements *this run* left no requirement blocks;
2. the rest of the spec is well-formed (it still has a `## Purpose`);
3. the main spec was not already empty before this sync — if you removed nothing, change nothing;
4. every other nonblank line in the whole file is accounted for as the title, Purpose, Requirements header, or a canonical requirement's statement, scenarios, or fenced examples;
5. the change's `.openspec.yaml` declares `retire_capabilities: true`;
6. the `spec.md` resolves inside the real specs root (do not follow a capability-directory symlink to delete an external file).

If removing the selected requirements would leave no requirement blocks and any retirement condition is not satisfied, **do not modify the main spec**. Stop the sync for that capability, report the blocking condition, and tell the user how to resolve it. Never write or leave an empty `## Requirements` section. When only the marker is missing, say so — it is the one thing the user can add to make retirement go through.

Deleting the file also deletes its `## Purpose`; any other section blocks retirement. Name Purpose when reporting the retirement. Include a pasteable `git checkout` only when the spec lived in the caller's checkout; otherwise give checkout-scoped recovery guidance.
