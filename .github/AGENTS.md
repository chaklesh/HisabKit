---
description: "Default agent onboarding and mandatory execution gates for HisabKit"
---

# HisabKit Agent Entry Point

This file is intentionally minimal so every agent starts from the same baseline.

## Mandatory First Read Order

1. docs/README.md
2. docs/architecture.md
3. docs/api-spec.md
4. docs/db-schema.md
5. docs/development-guide.md
6. docs/agent-playbook.md
7. docs/agent-context.md
8. docs/agent-handoff-log.md

## Hard Gates (No Exceptions)

- No coding without a linked task plan.
- No coding for API/schema-impacting tasks until docs/api-spec.md and docs/db-schema.md are updated.
- No role mixing inside a task package.
- No undocumented contract or response-format changes.

## Role-Constrained Execution

Use one explicit role per task package:
- Architect
- Backend
- Frontend
- Mobile
- Reviewer

## Required Handoff

Every completed package must append one entry in docs/agent-handoff-log.md and add relevant context delta in docs/agent-context.md.

## Historical Docs

Time-bound or superseded docs are under docs/archive and are reference-only.

## Release Versioning

Use the shared product release version across backend, frontend, and mobile for coordinated releases. See docs/development-guide.md and docs/agent-playbook.md for branch and merge rules.
