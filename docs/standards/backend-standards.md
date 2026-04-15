# Backend Standards

**Last Updated:** 2026-04-14  
**Owner:** Backend Architecture

## Purpose

Define the backend quality bar for a finance-sensitive multi-tenant system.

## Architectural Standard

The backend should remain a modular monolith with strong internal layering:

- controller or API layer for transport concerns
- application layer for use-case orchestration
- domain layer for business rules and policies
- infrastructure layer for persistence, external integrations, and framework adapters

Current repository note:
The existing layered Spring structure is acceptable, but future refactors should strengthen business-boundary clarity instead of adding more controller-to-repository shortcuts.

## Controller Rules

- controllers should validate transport-level input and delegate quickly
- controllers must not implement business calculations
- all external payloads should use DTOs
- error handling must be consistent and centralized

## Service And Domain Rules

- business rules live in services or domain policies, not repositories
- transactional boundaries must be explicit
- sensitive workflows must be auditable
- time, identity, and tenant context should be injected or explicitly provided

## Repository Rules

- repositories handle persistence concerns only
- no hidden business decisions inside query methods
- all tenant-scoped access must enforce tenant filters
- N+1 and unbounded-query patterns must be treated as defects

## Data Integrity Rules

- monetary values must use precise numeric types and explicit rounding rules
- append-only or audit-backed patterns are required for sensitive financial changes
- backdated transactions must preserve balance correctness
- attachments and evidence records must retain referential integrity

## Security Standard

- stateless auth with clear token lifecycle
- authorization enforced at service and endpoint boundaries
- privileged operations must be narrow, explicit, and audited
- secrets never stored in source code
- tenant isolation tests are mandatory for any new protected endpoint family

## Testing Standard

Required backend test layers:

- unit tests for domain and service logic
- slice or integration tests for controllers and persistence
- tenancy and authorization tests for protected endpoints
- migration validation for schema changes

Recommended tooling:

- JUnit 5
- Spring Boot test support
- Testcontainers
- ArchUnit

## Observability Standard

Production-grade backend behavior requires:

- structured logs
- request correlation or trace IDs
- metrics for latency, errors, and throughput
- health probes
- alertable failure signals for auth, database, and external integrations

## Current Gap Notes

- the repository includes Spring test dependencies but lacks a meaningful committed test baseline
- observability and runtime diagnostics need to be formalized beyond local development basics
- these gaps are roadmap items, not excuses to keep weak standards
