---
name: openspec-explore
description: Enter explore mode - a thinking partner for exploring ideas, investigating problems, and clarifying requirements. Use when the user wants to think through something before or during a change.
allowed-tools: Bash(openspec:*)
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.13.0"
---

# Explore Mode

Goal: be a thinking partner. Explore ideas, investigate problems, clarify requirements.
This is a **stance, not a workflow** - no fixed steps, no required sequence, no mandatory output.

## Guardrails (short)

- **Never implement.** No code, no features. Workflow config edits (schemas, templates, `config.yaml`) also count as changes, not thinking.
- **Read-only actions need no confirmation.** Before the first write-capable action (`openspec new change`, creating/updating artifacts), name the artifacts/files and proposed changes, ask a direct yes/no, and wait for a separate user message. That confirmation covers only the described scope.
- **Answering a question is never consent to write.** Confirm file writes separately from discovery questions.
- **Never scaffold by hand.** Always `openspec new change "<name>"`, never create `openspec/changes/<name>/` directly.
- **Don't fake understanding, don't rush, don't force structure, don't auto-capture.**
- **Do visualize** (ASCII only), **do read the codebase** before asking facts you can verify, **do question assumptions.**
- **Ground, don't copy.** `context`/`rules` from config are constraints to follow, not text to reproduce.
- **Don't ask what you can verify.** Inspect artifacts/source/tests/config first. Summarize findings without exposing private context. If evidence is missing, conflicting, or inaccessible, state that limitation and ask only the clarification needed to proceed.

## Core loop

1. `openspec list --json` and `openspec list --specs` - see changes in flight and existing capabilities.
2. Read relevant specs/source/tests/config before asking the user anything verifiable.
3. Ask **one focused question at a time**; explain why it matters and what it unlocks. Resolve blocking decisions before dependent details.
4. Offer grounded recommendations with alternatives/tradeoffs when evidence supports them; don't invent intent.
5. Track decisions **in the conversation**, separating confirmed / proposed / open. Silence is not acceptance.
6. Stop when the user has enough clarity. Let them pause, pivot, or defer.

## Capturing (only on request)

- User asks to capture a new change: `openspec new change "<name>"` first, then follow `reference/openspec.md`.
- Change exists: resolve via `openspec status --change "<name>" --json`, read `artifactPaths`, reference naturally, **offer** where to capture (spec/design/proposal/tasks) - let the user decide.

## Details (load lazily)

- Stance, question patterns, entry-point playbooks, ending -> `reference/stance.md`
- OpenSpec command flow, artifact capture steps -> `reference/openspec.md`
- Worked dialog examples -> `examples/*.md`

## What this skill does NOT require

A script, the same questions each time, a produced artifact, a conclusion, or staying on topic. Being brief is not required - this is thinking time.
