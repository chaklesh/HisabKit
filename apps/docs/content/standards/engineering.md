# Core Engineering Standards

**Last Updated:** 2026-04-26 | **Status:** Canonical | **Owner:** Engineering

This document defines the non-negotiable quality bar and architectural principles for all HisabKit work — across backend, web, and mobile. Platform-specific rules live in their respective standards files.

---

## The HisabKit Way (Core Principles)

1. **Modular Monolith.** Strong internal module boundaries within a single deployable unit. No microservices until the monolith shows clear, painful reasons to split.
2. **Vertical Slices.** Organize code by business capability (ledger, identity, analytics) — not by technical layer (service, repository, component).
3. **Thin Layers.** Controllers/routers validate and delegate. Business logic lives in services. Repositories access data only.
4. **Explicit Contracts.** DTOs for all API boundaries. Never expose persistence models (JPA entities, Prisma models) to clients.
5. **No Silent State.** Financial correctness outranks delivery speed. Every edge case in a financial workflow must be handled — not deferred.
6. **Explain Why.** Code comments explain intent and invariants — not what the code obviously does.

---

## Architectural Standards

### Module Boundaries

Every module owns its business capability end-to-end:
- Backend: `com.nayag.hisabkit.modules.<module-name>`
- Web: `src/modules/<module-name>`
- Mobile: `src/modules/<module-name>`

**Rules:**
- Modules may only interact through public service interfaces or shared models
- No circular dependencies between modules
- Shared logic that spans multiple modules goes to `src/shared` (Web/Mobile) or `packages/` (Monorepo level)
- Never import private internals from another module

### Layering Rules (all platforms)

| Layer | Responsibility | What it Must NOT do |
|---|---|---|
| Controller / Router | HTTP mapping, input validation, delegation | Implement business logic |
| Service / Use Case | Business logic, transactional boundaries | Access DB directly |
| Repository / Data Layer | Database access | Make business decisions |
| Domain | Business rules, value objects | Know about HTTP or UI |

---

## Quality Gates

Every change must pass all gates before merge. No exceptions.

### Minimum (every change)

| Gate | Tool | Command |
|---|---|---|
| Type check | TypeScript / Java | `npm run typecheck` / `mvn compile` |
| Lint | Biome / Checkstyle | `npm run lint` |
| Unit tests | Vitest / JUnit 5 | `npm run test` |
| Build | Vite / Maven | `npm run build` |

### Business-Critical Changes (additional)

| Gate | Applies To |
|---|---|
| Contract validation | Any API change |
| Tenant isolation test | Any new protected endpoint |
| Authorization test | Any new role-restricted feature |
| Regression smoke | Critical user-facing workflows |
| Release note / rollout impact review | Breaking changes |

See [Delivery → Quality Gates](/delivery/quality-gates) for the per-change-type checklists.

---

## File & Component Size Rules

| Context | Rule |
|---|---|
| Any file (web/mobile) | Max 300 lines; decompose beyond this |
| Page/screen component | Assemble sections; no inline queries + modals + business logic |
| Backend service method | One clear responsibility; extract helpers if cyclomatic complexity > 10 |
| Backend controller method | Should be < 20 lines; validate, delegate, return |

---

## Testing Requirements

| Level | When Required | Tooling |
|---|---|---|
| Unit | All complex business logic; 80%+ coverage target | JUnit 5 / Vitest |
| Integration | All API controllers; all DB repositories | Spring Boot Test / React Testing Library |
| E2E | Critical golden paths (ledger creation, transaction, auth) | Playwright |
| Tenant isolation | Every new protected endpoint family | Spring Boot Test |
| Authorization | Every role-restricted feature | Spring Boot Test / Vitest |

---

## Dependency Rules

- New dependencies require a clear architectural reason
- No library added solely because it's "trending"
- Dependencies that own critical business concerns (auth, DB, crypto) must be evaluated for security posture
- Prefer platform-native patterns before reaching for a library

---

## Source of Truth Priority

When standards appear to conflict, follow this order:

1. `decisions/adr-register.md` — Architecture decisions override all others
2. This file — Core engineering standards
3. Platform-specific standards (backend, frontend, mobile)
4. `overview/architecture.md` — System architecture principles
5. `delivery/` docs — Delivery and process rules
