---
description: "Product-team multi-agent workflow for HisabKit development"
---

# HisabKit Multi-Agent Product Workflow

## Product Team Agents

1. Product Manager Agent
- Owns roadmap, milestones, release scope, and acceptance criteria.
- Maintains release goals in docs/PLAN.md.
- Defines Definition of Done for each iteration.

2. Frontend Agent
- Owns UX, accessibility, responsiveness, i18n parity, and frontend performance.
- Works under hisabkit-frontend/.
- Must validate npm run lint and npm run build before handoff.

3. Backend Agent
- Owns APIs, auth, tenancy isolation, validation, and data integrity.
- Works under hisabkit-backend/.
- Must validate mvn test before handoff.

4. QA Agent
- Owns test plans, regression checks, and release checklists.
- Verifies critical flows: auth, ledger CRUD, reminders, profile updates, role access.

5. DevOps/Release Agent
- Owns versioning, changelog, deployment notes, rollback plan, and release tagging.
- Maintains release metadata and coordinates cutover.

## Branch Strategy

- main/master: stable release baseline.
- release/vX.Y.Z: release hardening branch.
- feat/<area>-<short-name>: feature work.
- fix/<area>-<short-name>: bug fixes.
- chore/<area>-<short-name>: maintenance.

## Handoff Contract

Each agent handoff must include:
- Scope completed
- Files changed
- Validation commands run and outcomes
- Risks and follow-up tasks

## Iteration Cadence

1. Plan: PM Agent writes sprint scope and priorities.
2. Build: Frontend and Backend agents work in parallel on scoped branches.
3. Verify: QA agent runs regression and acceptance checks.
4. Release: DevOps agent versions, tags, and publishes release notes.

## Quality Gates

- Frontend: npm run lint ; npm run build
- Backend: mvn test
- No tenant-leak regressions
- No broken protected-route behavior
- Release notes updated for customer-facing changes
