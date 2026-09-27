# Proposal: retire-legacy-sessions

## Why

The legacy cookie format predates signed tokens and cannot be rotated safely. It must be replaced, not extended.

## What Changes

- **BREAKING**: `Legacy session cookie` is removed; clients presenting it are treated as anonymous.
- `Session creation` is modified to issue a signed, rotating token.
- `Session validation` is renamed to `Session token verification`.

## Impact

- Capability `session-management`: one requirement removed, one modified, one renamed.
- Requires `retire_capabilities: true` in the change's `.openspec.yaml` so the archive/sync can delete the retired spec if it empties the capability.
