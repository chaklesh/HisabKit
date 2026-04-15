# Architecture Decision Record Register

**Last Updated:** 2026-04-14  
**Owner:** Architecture

## Purpose

Record foundational technical and delivery decisions so the team can scale without hidden assumptions.

## When An ADR Is Required

- new framework or core library
- architecture pattern change
- deployment model change
- security or tenancy model change
- design system or major UX-system change
- major testing or release-process change

## Status Values

- Proposed
- Approved
- Rejected
- Superseded

## ADR Template

- ID:
- Status:
- Date:
- Decision:
- Context:
- Options Considered:
- Decision Outcome:
- Consequences:
- Follow-Up Actions:

## Active ADRs

### ADR-20260410-01

- Status: Approved
- Date: 2026-04-10
- Decision: Formalize architecture governance, standards ownership, and change approval through a documented ADR process.
- Context: The project needed a durable decision trail instead of relying on scattered handoff notes.
- Options Considered: Ad-hoc decision notes inside task logs.
- Decision Outcome: Approved. Architecture-facing changes must now be recorded here.
- Consequences: Slower uncontrolled changes, better traceability and lower drift.
- Follow-Up Actions: Keep this register current when major decisions are made.

### ADR-20260414-02

- Status: Approved
- Date: 2026-04-14
- Decision: Standardize web and mobile clients as modular monoliths with clear app, module, and shared layers.
- Context: Page-led growth and mixed concerns were raising maintenance and delivery risk.
- Options Considered: Continue page-led growth, or split into micro-frontend style deployments.
- Decision Outcome: Approved. Modular monolith is the target structure.
- Consequences: Cleaner internal boundaries without extra deployment complexity.
- Follow-Up Actions: Continue extracting oversized pages and align mobile structure with the same module vocabulary.

### ADR-20260414-03

- Status: Approved
- Date: 2026-04-14
- Decision: Use shadcn, Radix-style primitives, and TanStack Table as the approved web UI foundation.
- Context: The web app needed accessible, production-grade primitives instead of repeated one-off UI patterns.
- Options Considered: Continue custom UI assembly for each screen.
- Decision Outcome: Approved. Shared UI primitives are the default path for new interface work.
- Consequences: Better accessibility, consistency, and maintainability.
- Follow-Up Actions: Expand shared components and align design tokens across modules.

### ADR-20260414-04

- Status: Approved
- Date: 2026-04-14
- Decision: Define the docs system as standards-first, with current-state gaps tracked separately instead of treating repository habit as the standard.
- Context: Existing docs mixed current implementation, agent operations, and target policy in ways that created clutter and ambiguity.
- Options Considered: Keep incrementally editing the old structure.
- Decision Outcome: Approved. The active docs tree now defines target standards and tracks gaps explicitly.
- Consequences: Clearer guidance, less overlap, better onboarding, and stronger governance.
- Follow-Up Actions: Keep legacy material archived and maintain the progress tracker as implementation evolves.
