# Delivery Operating Model

**Last Updated:** 2026-04-14  
**Owner:** Product + Engineering Leadership

## Purpose

Define how work moves from idea to production with enough structure to keep quality high and drift low.

## Delivery Stages

1. discovery
2. product and technical design
3. approval and sequencing
4. implementation
5. verification
6. release
7. post-release review

## Definition Of Ready

Work is ready to start only when:

- the problem is clear
- user impact is understood
- affected modules are identified
- API and data impact are understood
- non-obvious risks are called out
- acceptance criteria are testable

If any of these are missing, the task is still in discovery.

## Design Requirements By Change Size

### Small Change

- short scope note
- impact on tests identified
- docs impact checked

### Medium Change

- module boundary note
- API and data impact note
- validation plan

### Large Change

- system design note
- rollout and rollback plan
- observability and failure-mode review
- explicit product acceptance and release plan

## Definition Of Done

Work is done only when:

- implementation is complete
- tests and checks pass
- docs are updated
- reviewers have no unresolved high-severity findings
- release impact is understood
- next-step debt is either resolved or explicitly tracked

## Merge Discipline

No merge is allowed when any of the following is true:

- known broken build or failing mandatory check
- undocumented contract or schema change
- unreviewed security or tenancy risk
- missing acceptance evidence
- docs and code disagree on intended behavior

## Quality Gates

### Minimum Per Change

- compile or typecheck
- lint
- scope-appropriate tests
- build or packaging

### Required For Business-Critical Changes

- contract validation
- tenancy or authorization checks
- regression smoke coverage
- release note or rollout impact review

## Review Roles

- product review validates user and workflow fit
- engineering review validates maintainability and correctness
- architecture review validates system alignment when scope is large or foundational
- release review validates deployability and rollback safety

## Planning Cadence

- roadmap tracks phase-level delivery
- progress tracker records what is done, in progress, blocked, and below standard
- ADRs capture foundational decisions
- release and operations docs govern deployment and support behavior

## AI And Human Collaboration Rule

AI assistance may accelerate work, but it does not weaken standards. All work, whether produced by a human or an agent, must satisfy the same architecture, testing, review, and documentation rules.
