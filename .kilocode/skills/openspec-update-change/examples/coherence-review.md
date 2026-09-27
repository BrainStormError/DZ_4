# Worked coherence review

User: "update add-user-auth — we decided sessions live in Redis, not cookies."

```text
Using change: add-user-auth

Reading existing artifacts:
  proposal.md   — "session cookies"
  design.md     — "signed cookie, 7-day TTL"
  specs/user-auth/spec.md — scenario asserts a Set-Cookie header
  tasks.md      — 2.2 "issue session cookie"

Proposed revisions (confirmation required):
  1. proposal.md — "session cookies" -> "server-side sessions in Redis"
  2. design.md   — replace cookie mechanism with Redis session store + TTL
  3. specs/user-auth/spec.md — MODIFIED "Session creation": scenario
     asserts a session id returned, not Set-Cookie
  4. tasks.md    — 2.2 reworded to "write session to Redis"
  5. tasks.md    — add 1.3 "provision Redis" (was only implied by design)

Deferred to /opsx-continue: none

Status: 0/6 tasks. Recommended next: /opsx-apply
```
