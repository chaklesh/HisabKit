# Agent Communication Protocol

**Owner:** Architect  
**Last Updated:** 2026-04-10

## Purpose

Define how all roles/agents communicate, request approvals, hand off work, and escalate blockers.

## Official Communication Artifacts

- `docs/roadmap.md`: task sequencing, dependencies, and phase status.
- `docs/agent-context.md`: current architecture/domain deltas.
- `docs/agent-handoff-log.md`: role-to-role delivery and validation evidence.
- `docs/architecture-decisions.md`: architect approval requests and outcomes.

No decision is considered official unless it appears in one of these docs.

## Role Communication Matrix

- Architect -> All Roles: standards, boundaries, approvals, sequence updates.
- Backend <-> Frontend: API contract alignment through `api-spec.md` + handoff entry.
- Backend <-> Mobile: contract and auth behavior parity through handoff.
- Frontend <-> Mobile: UX parity notes via handoff/context docs.
- Reviewer -> All Roles: quality feedback, regression/blocker decisions.

## Handoff Minimum Contract

Each handoff entry must include:
- Date
- From Agent
- To Agent
- Scope Completed
- Files Changed
- Validation Run
- Known Risks
- Next Action

If branch/worktree is dirty, also include:
- Prior state summary
- Reconciliation decision (accepted/fixed/deferred)
- Architecture compliance note

## Architect Approval Request Flow

1. Agent creates `PROPOSED` entry in `docs/architecture-decisions.md`.
2. Agent adds handoff line: From [Role] -> To Architect with decision ID.
3. Architect reviews and marks APPROVED/REJECTED with rationale.
4. Agent proceeds only after APPROVED status is present.

## Escalation Path

- Level 1: Source role resolves within same role pair handoff cycle.
- Level 2: Escalate to Architect for boundary/decision conflicts.
- Level 3: Escalate to Reviewer for quality/risk arbitration before merge.

## Communication Timing Rules

- Update `agent-context.md` immediately when domain behavior changes.
- Update `agent-handoff-log.md` at every completed package.
- Update roadmap status after phase/task completion.
- Never batch multiple hidden changes without corresponding handoff evidence.
