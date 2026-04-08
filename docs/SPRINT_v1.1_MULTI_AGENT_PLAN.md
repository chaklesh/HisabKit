# Sprint Plan: v1.1 (Multi-Agent Execution)

## Sprint Goal
Ship a polished, product-grade v1.1 with stronger UX, faster workflows, and operational reliability.

## Agent Backlog

### Product Manager Agent
- Finalize v1.1 scope and acceptance criteria.
- Prioritize top 3 customer pain points from MVP usage.
- Maintain release scope lock by mid-sprint.

### Frontend Agent
- Redesign dashboard information hierarchy and mobile behavior.
- Improve ledger form ergonomics (fewer clicks, clearer states).
- Add accessibility pass: keyboard flow, labels, contrast checks.
- Add skeleton/loading states for main pages.

### Backend Agent
- Harden API validation and error consistency.
- Add attachment quota and retention controls per tenant.
- Expand audit logging for admin mutations.
- Add statement/export endpoints for ledger summaries.

### QA Agent
- Create regression checklist for auth, tenant isolation, ledger CRUD, attachments, reminders.
- Verify role-based route protections and negative-path behavior.
- Execute pre-release smoke on desktop + mobile viewport set.

### DevOps/Release Agent
- Prepare release notes template and rollback checklist.
- Validate env templates and deployment docs.
- Cut release candidate tag and final v1.1 tag.

## Definition of Done
- Frontend quality gates pass: npm run lint and npm run build.
- Backend quality gate passes: mvn test.
- QA checklist passed with no critical severity defects.
- Release notes and migration notes updated.

## Suggested Branches
- feat/frontend-dashboard-revamp
- feat/frontend-ledger-ux
- feat/backend-audit-and-exports
- feat/backend-attachment-policy
- chore/qa-regression-suite
- chore/release-v1.1
