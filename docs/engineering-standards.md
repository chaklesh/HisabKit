# Engineering Standards And Approved Stack

**Owner:** Architect  
**Last Updated:** 2026-04-10  
**Authority:** This document is the single source of truth for engineering standards, framework/library approvals, and architecture implementation policies.

## Purpose

Define mandatory coding and architecture standards for all agents and contributors.
No agent may choose or introduce new core frameworks/libraries or architecture patterns outside this document without Architect approval recorded here first.

## Mandatory Engineering Principles

- SOLID principles are required for non-trivial services/components/classes.
- LLD discipline is required for medium/large scope work:
  - clear responsibilities
  - explicit interfaces/contracts
  - low coupling and high cohesion
  - dependency direction from high-level policies to abstractions
- Design patterns must be intentional and justified by problem context.
- System design notes are mandatory for cross-service or cross-module changes.

## Approved Core Stack

### Backend

- Java 21
- Spring Boot 3.x
- Spring Security (JWT-based stateless auth)
- Spring Data JPA
- Liquibase for schema migrations
- H2 for local development
- MariaDB JDBC driver for production connectivity
- OpenAPI via springdoc

### Frontend (Web)

- React 18 + TypeScript
- Vite 5
- React Router
- Axios
- React Query (`@tanstack/react-query`)
- Tailwind CSS
- i18next + react-i18next

### Mobile

- React Native + Expo SDK 51
- TypeScript
- React Navigation
- Axios
- Expo modules (auth session, document picker, image picker, local auth, etc.)

## Approved Architectural Patterns

Use these patterns where appropriate:

- Layered architecture for backend (controller -> service -> repository).
- DTO boundary pattern for API contracts.
- Strategy pattern for variable business rules (e.g., reminder channel handling, balance policy variants).
- Factory pattern for module/plugin instantiation.
- Adapter pattern for third-party integrations (SMS/WhatsApp providers).
- Observer/event-style pattern for audit and side-effect workflows.

## Required Architecture Artifacts By Scope

### Small Scope (single module, low risk)

- Brief design note in PR/task description.
- Contract/schema note if API or DB impacted.

### Medium Scope (multiple files/modules)

- LLD note in docs or handoff log:
  - responsibilities
  - interfaces
  - dependency boundaries
- Validation strategy listed before implementation.

### Large Scope (cross-stack/cross-service)

- System design note before implementation:
  - request/data flow
  - tenancy/security implications
  - failure modes and rollback plan
  - performance/scaling considerations

## Library And Framework Approval Workflow

1. Propose in docs first:
   - problem statement
   - alternatives considered
   - security and maintenance impact
   - migration/rollback strategy
2. Architect reviews and approves/rejects.
3. On approval, update this file and relevant docs.
4. Only then start implementation.

## Prohibited Practices

- Introducing new framework/library without Architect approval in docs.
- Bypassing tenant isolation constraints for convenience.
- Reusing UI-layer logic as business-source-of-truth.
- Silent API/schema drift without docs updates.
- Pattern overengineering when simpler design satisfies requirements.

## Active Improvement Notes (Current)

- Frontend lint currently reports TypeScript-eslint support drift (TS 5.9.3 vs supported <5.4 for current eslint plugin set).
- Mobile editor diagnostics report deprecated tsconfig options that should be migrated before TypeScript 7.

These are tracked as governance cleanup items and must be addressed before major feature expansion.
