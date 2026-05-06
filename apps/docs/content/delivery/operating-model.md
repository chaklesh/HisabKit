# Operating Model

**Last Updated:** 2026-04-26 | **Owner:** Product + Engineering Leadership

This document defines how work moves from idea to merged and deployed code with enough structure to keep quality high and drift low.

---

## Delivery Stages

```
Idea → Discovery → Design → Approval → Implementation → Verification → Release → Review
```

| Stage | Who | Output |
|---|---|---|
| **Discovery** | Product + Engineering | Problem statement, user impact, affected modules |
| **Design** | Engineering + Product | Design note (size-appropriate), API/data impact, test plan |
| **Approval** | Lead / Architecture | Approved scope, sequencing confirmed |
| **Implementation** | Developer | Code, tests, docs updated |
| **Verification** | Developer + Reviewer | Quality gates passed, acceptance evidence provided |
| **Release** | Lead + DevOps | Deployed with release note and rollback plan ready |
| **Review** | Team | Post-release health check, debt tracked |

---

## Definition of Ready

Work is **ready to start** only when:

- [ ] The problem is clearly stated
- [ ] User impact is understood
- [ ] Affected modules are identified
- [ ] API and data contract impacts are understood
- [ ] Non-obvious risks are called out
- [ ] Acceptance criteria are testable and written down

If any of these are missing, the task remains in **Discovery**.

---

## Design Requirement by Change Size

### Small Change
- Short scope note (comment or commit message)
- Impact on existing tests identified
- Docs impact checked (any standard or API doc need updating?)

### Medium Change
- Module boundary note (which modules are affected?)
- API and data impact note
- Validation plan (how will this be tested?)

### Large Change
- System design note with architectural context
- Rollout and rollback plan
- Observability and failure-mode review
- Explicit product acceptance and release plan

---

## Definition of Done

Work is **done** only when:

- [ ] Implementation is complete and working
- [ ] All quality gates pass (see [Quality Gates](/delivery/quality-gates))
- [ ] Docs are updated if the change affects standards, API contracts, or architecture
- [ ] Reviewers have no unresolved high-severity findings
- [ ] Changelog entry is added
- [ ] Release impact is understood
- [ ] Any follow-up debt is either resolved or explicitly tracked

---

## Merge Discipline

A merge is **blocked** when any of the following is true:

- Known broken build or failing mandatory check
- Undocumented contract or schema change
- Unreviewed security or tenancy risk
- Missing acceptance evidence
- Docs and code disagree on intended behavior
- No changelog entry for a user-facing or architectural change

---

## Review Roles

| Reviewer | What They Validate |
|---|---|
| **Engineering review** | Correctness, maintainability, layer rules, test coverage |
| **Product review** | User and workflow fit, vocabulary alignment |
| **Architecture review** | System alignment; required when scope is large or foundational |
| **Release review** | Deployability, rollback safety, release note quality |

---

## AI & Human Collaboration Rule

AI assistance may accelerate work, but it does not weaken standards. All work — whether produced by a human or an AI agent — must satisfy the same architecture, testing, review, and documentation requirements.

---

## Planning Cadence

| Artifact | Updates When |
|---|---|
| [Changelog](/overview/changelog) | Every change merged |
| [Roadmap](/delivery/roadmap) | Phase transitions, major scope changes |
| [ADR Register](/decisions/adr-register) | Major architectural decisions |
| [Release & Ops](/delivery/release-and-ops) | Pipeline or deployment changes |
