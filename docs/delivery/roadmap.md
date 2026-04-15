# Roadmap

**Last Updated:** 2026-04-14  
**Owner:** Product + Architecture  
**Planning Horizon:** 2 quarters

## Roadmap Intent

This roadmap defines the target sequence to bring HisabKit from a partially aligned codebase to a practical enterprise-grade product foundation.

## Phase 0: Documentation And Governance Reset

**Window:** Completed on 2026-04-14  
**Goal:** Establish a reliable operating model and central source of truth.

Outcomes:

- active docs structure simplified
- standards rewritten around target quality, not repository habit
- roadmap, progress tracking, and operations guidance established

## Phase 1: Baseline Quality Hardening

**Window:** 2026-04-15 to 2026-04-28  
**Goal:** Make the product safe to evolve without silent drift.

Key outcomes:

- backend test baseline introduced
- web critical workflow smoke coverage established
- mobile test and verification baseline established
- tenancy and authorization checks formalized
- configuration and secret handling tightened

Exit criteria:

- all three apps have defined validation commands
- critical-path workflows have automated smoke coverage
- no critical tenant-isolation gap remains untracked

## Phase 2: Modular Monolith Alignment

**Window:** 2026-04-22 to 2026-05-12  
**Goal:** Reduce structural risk and make the product easier to extend.

Key outcomes:

- web oversized route files split into module-owned boundaries
- mobile module structure aligned with product vocabulary
- backend boundaries strengthened around domain, application, and infrastructure concerns
- shared settings model aligned across web and mobile

Exit criteria:

- dashboard, ledger, settings, and admin boundaries are explicit
- cross-module leakage is reduced
- app-level providers and shared layers are stable

## Phase 3: Product Experience And Operational Trust

**Window:** 2026-05-06 to 2026-05-27  
**Goal:** Raise usability and confidence in daily financial workflows.

Key outcomes:

- settings becomes a real control center
- loading, empty, error, and confirmation states are standardized
- audit visibility and data recovery posture improve
- business profile, reminders, and notification preferences are formalized

Exit criteria:

- no critical workflow ends in a dead state
- user preferences are centralized and documented
- destructive actions are visibly safer

## Phase 4: Reporting, Reminders, And Admin Maturity

**Window:** 2026-05-20 to 2026-06-24  
**Goal:** Expand controlled business capabilities on top of a hardened core.

Key outcomes:

- reminder workflows become operational
- reporting and export paths mature
- admin and audit workflows strengthen
- release and support motions become repeatable

## Phase 5: Production Operations Excellence

**Window:** 2026-06-10 onward  
**Goal:** Make the system easier to observe, release, and support in production.

Key outcomes:

- observability baseline in place
- rollback playbooks tested
- environment promotion and release discipline stabilized
- support and incident processes documented

## Sequencing Rules

- quality hardening comes before major feature expansion
- architecture cleanup must be pragmatic and tied to product value
- web and mobile should converge on shared product behavior, not on identical code
- backend contract and data rules must lead cross-platform work
