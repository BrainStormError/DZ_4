# Reconciliation details

## Which files may be edited

- The editable set is `artifactPaths.<id>.existingOutputPaths` from `openspec status --change "<name>" --json` — concrete on-disk files, already glob-expanded (e.g. `specs/**/*.md`).
- `resolvedOutputPath` is off limits: for a glob artifact it is still the pattern, not a real path.
- Never create a file that does not exist, and never add a new file under a glob artifact — that advances the build frontier and belongs to `/opsx-continue`. Note what is missing and point the user there.

## Any-direction coherence

- Build order (proposal → specs → design → tasks) is a useful reading order, not a constraint on which artifacts may be revised.
- An edit to a later artifact may force a revision of an earlier one, and vice versa. After applying the requested edit, re-check every other existing artifact against it.
- Look for three failure modes: contradictions (two artifacts disagree), gaps (a decision implies work no artifact records), and duplication (the same decision restated inconsistently).

## Applying revisions

- Show each proposed revision and why, then write only after the user confirms. Rejected revisions are left unwritten.
- For a substantial rewrite, fetch the artifact's authoritative rules and template first:
  ```bash
  openspec instructions "<artifact-id>" --change "<name>" --json
  ```
- If nothing is inconsistent, report that and make no edits.
