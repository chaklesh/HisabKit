# Engineering Standards

**Last Updated:** 2026-04-14  
**Owner:** Architecture  
**Authority:** This file is the primary engineering policy for the project.

## Purpose

Define the minimum acceptable standard for code quality, architecture, testing, documentation, and delivery across backend, web, and mobile.

## Non-Negotiable Principles

- correctness before speed
- readability before cleverness
- clear ownership before shared ambiguity
- explicit contracts before tribal knowledge
- progressive modularity before overengineering
- security and tenancy before convenience

## Clean Code Rules

- functions and methods should have one clear reason to change
- avoid misleading names, hidden side effects, and implicit coupling
- prefer explicit dependencies over global reach-through
- use composition before inheritance in application code
- comments should explain intent, invariants, or risk, not restate code
- code duplication may be accepted briefly during refactoring, but not as a resting state

## Architecture Rules

- backend business rules must not depend on UI behavior
- server state and local UI state must be separated in clients
- cross-module access must happen through public module interfaces or shared layers
- financial calculations must have one authoritative implementation path
- no new framework, runtime, or critical library is allowed without an ADR entry

## Approved Core Stack

### Backend Baseline

- Java 21
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- Liquibase
- MariaDB-compatible relational storage
- OpenAPI via springdoc

### Web Baseline

- React 18
- TypeScript
- Vite
- React Router
- Axios
- TanStack Query
- Tailwind CSS
- shadcn/ui with Radix-based primitives
- i18next
- sonner

### Mobile Baseline

- Expo / React Native
- TypeScript
- React Navigation
- Axios
- Expo platform modules

## Approved Target Additions

These are approved because they are widely used, practical, and improve delivery quality without forcing unnecessary complexity.

### Backend

- Testcontainers for integration testing
- ArchUnit for architecture boundary tests
- Micrometer plus OpenTelemetry-compatible export for metrics and tracing
- Resilience4j for external-provider reliability where needed

### Web

- React Hook Form for scalable form handling
- Zod for runtime-safe schema validation at form and client boundaries
- React Testing Library for component behavior tests
- Playwright for end-to-end smoke and regression coverage
- TanStack Table for data-heavy workflows

### Mobile

- TanStack Query for server-state management parity with web
- React Hook Form for complex form flows
- Zod for validation
- Expo SecureStore for sensitive client-side token storage
- Maestro for pragmatic mobile smoke automation

## Default Technology Decision Rule

- keep the current platform if it meets the need cleanly
- add a library only when it materially reduces risk or duplication
- choose boring, widely adopted tools before niche tools
- do not add a second tool for a job already solved well enough by the first

## Testing Standard

Minimum target baseline:

- backend: unit tests, integration tests, security tests, tenancy tests
- web: unit tests, component tests, route-level smoke tests, accessibility checks
- mobile: unit tests, screen behavior tests, critical-path smoke tests

No customer-facing capability is considered production ready unless:

- the happy path is automated
- the key failure path is exercised
- the relevant contract and data rules are tested

## Documentation Standard

Required updates in the same change set:

- architecture or stack change: ADR plus affected standards docs
- API change: `standards/api-governance.md`
- schema or migration change: `standards/data-governance.md`
- new operational risk or release change: `delivery/release-and-operations.md`
- roadmap or sequencing change: `delivery/roadmap.md` and `delivery/progress-tracker.md`

## Review And Merge Gates

A change must not merge unless all applicable checks pass:

- lint
- typecheck or compile
- tests required for the scope
- build or packaging step
- docs updated if behavior, contracts, architecture, or process changed
- reviewer confirms maintainability and boundary compliance

## Current Gap Statement

The current repository has a usable base, but it is not yet at the full target standard. Known gaps are tracked in [../delivery/progress-tracker.md](../delivery/progress-tracker.md). This document defines where the project must go, not only where it stands today.
