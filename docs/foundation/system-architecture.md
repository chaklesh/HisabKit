# System Architecture

**Last Updated:** 2026-04-14  
**Owner:** Architecture

## Target Architecture

HisabKit should operate as a three-application platform with shared domain rules:

- Backend: Spring Boot service for auth, tenancy, business logic, data access, and integrations
- Web: React application for tenant admin and operational workflows
- Mobile: Expo/React Native application for operator-first mobility and field usage

This is a modular monolith strategy across each client application and a layered modular backend. It is intentionally not a microservices architecture.

## Why Modular Monolith

For a product of this size and maturity, a modular monolith is the best tradeoff:

- simpler deployment and debugging
- lower operational overhead
- stronger internal boundaries than page-led growth
- avoids premature distributed-system complexity

## Architectural Principles

- backend owns business rules and data integrity
- clients own interaction design and local presentation state
- contracts are explicit and versioned
- shared concerns belong in platform layers, not repeated in product modules
- modules can depend on shared infrastructure but not on each other’s private internals
- financial data must have a durable server-side source of truth

## Runtime Context

- `hisabkit-backend`: backend service
- `hisabkit-frontend`: web client
- `hisabkit-mobile`: mobile client

## Target Internal Structure

### Backend

- `api` or `controller`: request handling only
- `application`: orchestration and use-case services
- `domain`: business rules, aggregates, policies, value objects
- `infrastructure`: persistence, external providers, security adapters, background jobs
- `shared`: cross-cutting concerns

Practical note:
The current backend is layered and acceptable as a starting point. It should evolve toward stronger domain and application boundaries over time rather than a disruptive rewrite.

### Web

- `src/app`: bootstrap, providers, routing, shared shell
- `src/modules/<module>`: module-owned pages, components, hooks, services, types
- `src/shared`: cross-module UI, utilities, configuration, API client, hooks

### Mobile

- `src/app`: bootstrap, navigation, providers, global concerns
- `src/modules/<module>`: screens, hooks, services, view models, types
- `src/shared`: config, API client, theme tokens, device adapters, utilities

## Product Module Model

The common module vocabulary should be:

- dashboard
- ledger
- reports
- reminders
- profile
- settings
- admin

New modules should only be introduced when they represent a real business capability, not a UI convenience split.

## Data And Tenancy

- shared database with shared schema and explicit tenant scoping
- every tenant-scoped record must contain `tenant_id`
- cross-tenant operations require explicit privileged workflow
- audit records are mandatory for privileged or financially sensitive mutations

## Integration Boundaries

External integrations should sit behind adapters. No feature module should directly own vendor-specific behavior.

Likely adapter categories:

- SMS or WhatsApp providers
- file storage
- authentication providers
- analytics and error monitoring

## Deployment Shape

Target production baseline:

- containerized backend
- containerized web frontend
- managed relational database
- reverse proxy or ingress
- centralized logs and metrics
- automated backups
- CI/CD with environment promotion and rollback capability

## Architecture Anti-Patterns

- giant page components controlling business logic
- browser-local storage as the only source of truth for finance data
- client-specific domain models drifting from backend contracts
- uncontrolled addition of libraries without a clear architectural reason
- splitting into services before a monolith has clear pain signals

## Current-State Notes

- Backend already uses a Spring layered structure and is a valid base.
- Web is transitioning toward a modular monolith with `src/app` and `src/modules`.
- Mobile still needs stronger module ownership and a more explicit shared-app layer.
- The desired standard is defined here even when the current repository is not fully aligned yet.
