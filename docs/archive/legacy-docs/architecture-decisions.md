# Architecture Decisions Register

**Owner:** Architect  
**Last Updated:** 2026-04-10

## Purpose

This is the official approval register for architectural decisions. Agents request Architect permission here.

## When Architect Approval Is Required

- Adding/replacing a framework or core library.
- Introducing/changing design patterns that affect module boundaries.
- Cross-stack system design changes.
- Security/tenancy/auth model changes.
- Global UI/brand theme shifts.

## Decision States

- PROPOSED: Submitted by an agent, pending Architect review.
- APPROVED: Accepted by Architect; implementation allowed.
- REJECTED: Not approved; implementation blocked.
- SUPERSEDED: Replaced by a newer decision.

## Submission Template

- Decision ID: ADR-YYYYMMDD-XX
- Status: PROPOSED
- Requested By: [Role/Agent]
- Date:
- Scope:
- Problem Statement:
- Proposed Change:
- Alternatives Considered:
- Impact (Security/Performance/Maintainability):
- Rollback Plan:
- Linked Tasks:
- Linked Handoff Entry:

## Architect Response Template

- Status: APPROVED or REJECTED
- Reviewed By: Architect
- Date:
- Rationale:
- Constraints/Conditions:
- Follow-up Actions:

## Active Decisions

- Decision ID: ADR-20260410-01
- Status: APPROVED
- Requested By: Senior Architect / Team Lead
- Date: 2026-04-10
- Scope: Governance baseline for engineering standards, communication protocol, and config centralization.
- Problem Statement: Team needed explicit process for architect approvals and standardized cross-agent communication.
- Proposed Change: Introduce architecture decision register + communication protocol + config and brand standards docs.
- Alternatives Considered: Keep decisions only in ad-hoc handoff notes (rejected for poor traceability).
- Impact (Security/Performance/Maintainability): High maintainability gain; lower drift and decision ambiguity.
- Rollback Plan: Revert to previous lightweight process (not recommended).
- Linked Tasks: P0.2.1, P0.2.2
- Linked Handoff Entry: 2026-04-10 Senior Architect governance package

- Status: APPROVED
- Reviewed By: Architect
- Date: 2026-04-10
- Rationale: Required for reliable multi-agent scaling and auditability.
- Constraints/Conditions: Any future framework changes must use this ADR process.
- Follow-up Actions: Keep this file updated for each major architectural decision.

- Decision ID: ADR-20260414-02
- Status: APPROVED
- Requested By: Product Owner + Codex
- Date: 2026-04-14
- Scope: Frontend and mobile client architecture plus shared UI modernization direction.
- Problem Statement: The current client codebase has grown around large page files, inconsistent boundaries, and repeated ad-hoc UI patterns that increase delivery risk for a production-grade MSME finance product.
- Proposed Change: Standardize web and mobile clients as modular monoliths, add an `app` layer for cross-cutting infrastructure, and approve `shadcn/ui`, `Radix UI`, and `TanStack Table` for production-grade UI composition on the web.
- Alternatives Considered: Continue with page-led growth and custom one-off UI patterns (rejected for maintainability and consistency risk); strict micro-frontend/client decomposition (rejected as unnecessary complexity at current scale).
- Impact (Security/Performance/Maintainability): Strong maintainability gain, lower UI inconsistency, better accessibility posture, and clearer module ownership without introducing multi-app deployment complexity.
- Rollback Plan: Keep the existing runtime and selectively stop new library adoption while preserving extracted module boundaries.
- Linked Tasks: Frontend stabilization, settings implementation, dashboard refactor, cross-platform streamlining
- Linked Handoff Entry: Pending 2026-04-14 frontend modular-monolith modernization batch

- Status: APPROVED
- Reviewed By: Architect
- Date: 2026-04-14
- Rationale: A modular monolith is the right maturity step for this product; it improves internal structure without premature distributed complexity.
- Constraints/Conditions: Shared tokens remain mandatory; API contracts remain backend-owned; web/mobile settings and module vocabulary should be aligned where practical.
- Follow-up Actions: Update playbooks, begin extracting oversized pages into modules, and document additional stack changes as they occur. Initial web rollout now includes shadcn/ui setup, `@/*` aliases, next-themes, and sonner-backed toast infrastructure.
