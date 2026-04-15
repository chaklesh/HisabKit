# Agent Playbook

## Purpose

Define a single execution protocol for all AI tools working in this repository.
Tool choice does not change policy obligations.

## Roadmap Reference

Use docs/roadmap.md for the product sequence and the order in which agents should hand work off to each other.

## Role Discipline

Allowed execution roles per task:
- Architect
- Backend
- Frontend
- Mobile
- Reviewer

Agents may perform any role when assigned, but must stay inside role boundaries for the task.

## Mandatory Pre-Implementation Gates

- A linked task plan must exist.
- Required API/DB documentation updates must be completed first when scope impacts contracts or schema.
- If scope is unclear, refine requirements before coding.
- Architect-approved standards from `docs/engineering-standards.md` must be applied for design, libraries, and patterns.
- For dirty or inherited branches, agents must perform a source checkup and handoff-gap review before adding new feature scope.
- If the task needs a new framework/library/pattern/major system change, Architect approval must be requested and recorded in `docs/architecture-decisions.md` before coding.

## Required Task Lifecycle

1. Intake and scope confirmation.
2. Discovery in existing code and docs.
3. Design and contract/schema impact note.
4. Documentation update.
5. Implementation.
6. Validation.
7. Handoff log update.
8. Reviewer pass.

## Handoff Contract

Each handoff entry in agent-handoff-log.md must include:
- Date
- From agent role
- To agent role
- Scope completed
- Files changed
- Validation run
- Known risks
- Next action

Additional mandatory fields for dirty or reconciled work:
- Prior state summary (what was already dirty/in-progress before this agent started)
- Reconciliation decision (accepted/fixed/deferred)
- Architecture compliance note (SOLID/LLD/pattern or explicit reason not needed)

## Quality Rules

- Keep code maintainable and readable.
- Do not introduce conflicting structures.
- Preserve single source of truth for contracts and schema.
- Avoid shortcuts that bypass tenant safety or validation boundaries.
- Apply SOLID principles for all non-trivial classes/services/components.
- Use LLD artifacts (module boundaries, interfaces, responsibilities) for medium/large tasks.
- Use explicit design patterns where they reduce coupling or increase extensibility; document pattern choice briefly.
- Require system design notes for cross-module or cross-service changes (data flow, failure handling, scaling impact).
- Do not adopt new frameworks/libraries without Architect approval recorded in docs.

## Conflict Resolution

- If two parallel tasks touch same contracts/schema, pause implementation and align docs first.
- Resolve with architect + reviewer decision before merge.

## Architect Approval Workflow

Use this flow whenever the change introduces or alters:
- Framework or library choices.
- Core architectural pattern.
- Cross-module or cross-service system design.
- Security model or tenancy boundary behavior.

Required steps:
1. Create a `PROPOSED` decision entry in `docs/architecture-decisions.md`.
2. Add a handoff item in `docs/agent-handoff-log.md` from current role to Architect.
3. Architect marks decision `APPROVED` or `REJECTED` with rationale.
4. Only approved decisions can move to implementation.

## Communication Protocol

- Follow `docs/agent-communication-protocol.md` for role-to-role communication rules.
- No direct assumptions between agents; all non-trivial context must be logged in docs.
- If a blocker is unresolved for one handoff cycle, escalate to Architect then Reviewer.

## Release Discipline

- Use the shared product release version across backend, frontend, and mobile.
- Use `develop` as integration branch and `master` (or `main`) as stable release branch.
- Cut `release/<version>` branches from `develop` when a coordinated freeze is needed.
- Merge release branches to `master`, then back-merge into `develop`.
- Cut `hotfix/<version>` branches from `master` for production defects.
- Merge hotfixes to `master` first, then back-merge to `develop` immediately.
- Keep branch names short, descriptive, and aligned to the task package.
- The repo does not keep a separate customer release changelog file; operational change history is tracked in agent-handoff-log.md.

## Parallel Session Rule

- Parallel AI sessions must use separate Git worktrees (or separate clones).
- No two sessions may actively edit the same checked-out folder.

## Source Checkup Protocol (Required When Worktree Is Dirty)

1. Generate changed-file inventory and classify by area (backend/frontend/mobile/docs).
2. Verify whether each package has a matching handoff entry.
3. If handoff is missing, create reconciliation entry before new feature implementation.
4. Run minimum baseline validation per stack impacted (compile/lint/type-check).
5. Escalate unknown or contradictory deltas to Architect + Reviewer before merge.

No agent may mark a package complete if changed-file inventory and handoff log are out of sync.
