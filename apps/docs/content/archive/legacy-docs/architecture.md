# Architecture

## System Overview

HisabKit is a multi-tenant ledger platform composed of three runtime applications:
- Backend: Spring Boot service for auth, tenancy enforcement, ledger logic, and APIs.
- Frontend: React (Vite) web client for admin and ledger workflows.
- Mobile: React Native (Expo) app for operator-facing flows.

## Codebase Organization Snapshot

The repository is intentionally multi-app rather than a monorepo with shared package tooling:
- `hisabkit-backend`: Spring Boot backend
- `hisabkit-frontend`: web client
- `hisabkit-mobile`: Expo mobile client
- `docs`: project governance, architecture, and workflow documentation

Current implementation patterns by app:
- Backend: layered package structure with controller/service/repository boundaries
- Frontend: migrating toward a modular monolith with `src/app`, `src/modules`, and shared UI infrastructure
- Mobile: screen/service/theme organization with centralized context and config layers

## Architectural Principles

- Ledger-first domain model with append-friendly transaction history.
- Strict tenant isolation in all data access paths.
- Shared API contracts across backend, frontend, and mobile.
- Modular UI and feature growth without breaking core ledger workflows.
- Frontend and mobile clients should evolve as modular monoliths: one deployable app per platform with clear internal module boundaries and shared cross-cutting infrastructure.

## Multi-Tenancy

- Strategy: shared database, shared schema with tenant scoping.
- Rule: tenant-scoped tables must include tenant_id.
- Enforcement: backend tenant context + request filtering on protected endpoints.
- Exception: SUPER_ADMIN capabilities are explicit and limited to admin surfaces.

## Core Domains

- Identity and Access: login, JWT session, social auth for pre-registered users.
- Ledger: customers, transactions, balances, and attachments.
- Tenant Management: tenant profile/config and super-admin operations.
- Module Catalog: controlled enablement of planned features.

## Cross-Stack Boundaries

- Backend owns source contracts and validation rules.
- Frontend/mobile consume contracts and must not invent conflicting fields.
- Any contract or schema change requires synchronized updates to api-spec.md and db-schema.md before implementation proceeds.

## Client Architecture Direction

- Web and mobile should share the same product module language: dashboard, ledger, reports, profile, settings, admin.
- Each client should keep a single application runtime while organizing code by internal modules rather than page sprawl.
- Shared concerns such as auth, theming, localization, navigation shells, and API normalization belong in app/shared layers.
- Modules may depend on shared infrastructure, but should not reach sideways into unrelated modules for source-of-truth business logic.
- Modularization should stay pragmatic: avoid both page-sprawl and over-fragmentation into tiny files with no clear ownership.

## UX Direction

- Use a task-first layout: summary metrics first, then actions, then detailed tables/forms.
- Keep primary navigation persistent and module-driven rather than hardcoded page links.
- Keep planned modules visible with status labels so users do not hit dead ends.

## Runtime Environments

- Local development: backend with H2 profile, frontend Vite dev server, mobile Expo/dev builds.
- Production target: docker-compose deployment with backend, frontend (nginx), and database.
