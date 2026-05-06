# Architecture Decision Register

**Last Updated:** 2026-04-26 | **Owner:** Architecture

---

## Purpose

Record foundational technical and delivery decisions so the team can scale without hidden assumptions or revisiting resolved debates.

---

## When an ADR is Required

An ADR must be created for:
- New framework or core library introduction
- Architecture pattern change (e.g., adding a new layer, moving to event-driven)
- Deployment model change
- Security or tenancy model change
- Design system or major UX-system change
- Major testing or release-process change
- Any API breaking change or compatibility decision

---

## ADR Status Values

| Status | Meaning |
|---|---|
| `Proposed` | Under discussion, not yet committed |
| `Approved` | Accepted and being implemented |
| `Rejected` | Considered but not adopted (reason recorded) |
| `Superseded` | Was approved, now replaced by a newer ADR |

---

## ADR Template

```md
### ADR-[YYYYMMDD]-[NN]

- **Status:** Proposed | Approved | Rejected | Superseded
- **Date:** YYYY-MM-DD
- **Decision:** One-sentence summary of what was decided
- **Context:** Why this decision was needed; what problem it solves
- **Options Considered:** What alternatives were evaluated
- **Decision Outcome:** Which option was chosen and why
- **Consequences:** Trade-offs, follow-on complexity, or side effects
- **Follow-Up Actions:** What needs to happen next
```

---

## Active ADRs

---

### ADR-20260410-01

- **Status:** Approved
- **Date:** 2026-04-10
- **Decision:** Formalize architecture governance and change approval through a documented ADR process.
- **Context:** The project had scattered decision notes in handoff documents, making it impossible to trace why key architectural choices were made.
- **Options Considered:** Ad-hoc decision notes inside task or agent logs.
- **Decision Outcome:** Approved. Architecture-facing changes must now be recorded in this register.
- **Consequences:** Slower uncontrolled changes; better traceability and lower architectural drift.
- **Follow-Up Actions:** Keep this register current when major decisions are made.

---

### ADR-20260414-02

- **Status:** Approved
- **Date:** 2026-04-14
- **Decision:** Standardize web and mobile clients as modular monoliths with clear app, module, and shared layers.
- **Context:** Page-led growth and mixed concerns were raising maintenance and delivery risk. The codebase was a mix of page-per-route files with no clear module ownership.
- **Options Considered:** Continue page-led growth. Split into micro-frontend style deployments.
- **Decision Outcome:** Approved. Modular monolith is the target structure for both web and mobile.
- **Consequences:** Cleaner internal boundaries without extra deployment complexity. Requires ongoing extraction of oversized pages.
- **Follow-Up Actions:** Continue extracting oversized pages; align mobile module structure with the same vocabulary.

---

### ADR-20260414-03

- **Status:** Approved
- **Date:** 2026-04-14
- **Decision:** Use shadcn/Radix-style primitives and TanStack Table as the approved web UI foundation.
- **Context:** The web app had repeated one-off UI patterns for dialogs, tables, and forms — each built differently, none accessible by default.
- **Options Considered:** Continue custom UI assembly for each screen.
- **Decision Outcome:** Approved. Shared UI primitives (shadcn, Radix) are the default path for all new interface work.
- **Consequences:** Better accessibility, consistency, and maintainability. Initial cost of migrating existing ad-hoc UI patterns.
- **Follow-Up Actions:** Expand shared components and align design tokens across all modules.

---

### ADR-20260414-04

- **Status:** Approved
- **Date:** 2026-04-14
- **Decision:** Define the docs system as standards-first, with current-state gaps tracked separately.
- **Context:** Existing docs mixed current implementation details, agent operation notes, and target policy — creating clutter and ambiguity about what was a standard vs. a temporary workaround.
- **Options Considered:** Keep incrementally editing the old structure.
- **Decision Outcome:** Approved. The active docs tree defines target standards. Gaps are tracked in the Changelog. Legacy material is archived.
- **Consequences:** Clearer guidance, less overlap, better onboarding, and stronger governance.
- **Follow-Up Actions:** Keep legacy material archived; maintain changelog as implementation evolves.

---

### ADR-20260420-05

- **Status:** Approved
- **Date:** 2026-04-20
- **Decision:** Enforce layer boundary rules using ArchUnit as a build-time check in the backend.
- **Context:** Controllers were calling repositories directly, bypassing the service layer. This was creating untestable business logic and data-access leakage.
- **Options Considered:** Code review only (manual enforcement). PR linting rules.
- **Decision Outcome:** Approved. ArchUnit tests are part of the Maven build. A failing ArchUnit test is a build failure.
- **Consequences:** Controllers can no longer access repositories directly. Initial cost: fixing existing violations.
- **Follow-Up Actions:** Expand ArchUnit rule set as module boundaries become more defined.

---

### ADR-20260426-06

- **Status:** Approved
- **Date:** 2026-04-26
- **Decision:** Introduce a rolling Changelog as the primary change-tracking document, replacing the static progress-tracker.
- **Context:** The progress tracker was becoming stale and didn't capture what changed, when, why, or what quality gates were applied. A new reader or AI agent had no reliable way to understand recent work.
- **Options Considered:** Keep updating the progress tracker. Use GitHub Releases only. Use a separate changelog tool.
- **Decision Outcome:** Approved. `overview/changelog.md` is the living rolling log for all changes. Progress tracker is archived.
- **Consequences:** Docs stay more current; every change has an associated quality gate record; easier onboarding and AI context.
- **Follow-Up Actions:** Enforce changelog update as part of the Definition of Done for all changes.
