# Architecture

## System Overview

HisabKit is a multi-tenant ledger platform composed of three runtime applications:
- Backend: Spring Boot service for auth, tenancy enforcement, ledger logic, and APIs.
- Frontend: React (Vite) web client for admin and ledger workflows.
- Mobile: React Native (Expo) app for operator-facing flows.

## Architectural Principles

- Ledger-first domain model with append-friendly transaction history.
- Strict tenant isolation in all data access paths.
- Shared API contracts across backend, frontend, and mobile.
- Modular UI and feature growth without breaking core ledger workflows.

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

## UX Direction

- Use a task-first layout: summary metrics first, then actions, then detailed tables/forms.
- Keep primary navigation persistent and module-driven rather than hardcoded page links.
- Keep planned modules visible with status labels so users do not hit dead ends.

## Runtime Environments

- Local development: backend with H2 profile, frontend Vite dev server, mobile Expo/dev builds.
- Production target: docker-compose deployment with backend, frontend (nginx), and database.
