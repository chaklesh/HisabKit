# Engineering Standards And Approved Stack

**Owner:** Architect  
**Last Updated:** 2026-04-14  
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
- shadcn/ui
- Radix UI primitives
- next-themes
- sonner
- class-variance-authority

### Mobile

- React Native + Expo SDK 51
- TypeScript
- React Navigation
- Axios
- Expo modules (auth session, document picker, image picker, local auth, etc.)

## Approved Architectural Patterns

Use these patterns where appropriate:

- Layered architecture for backend (controller -> service -> repository).
- Modular monolith structure for web and mobile clients (single deployable app with clear internal module boundaries).
- DTO boundary pattern for API contracts.
- Strategy pattern for variable business rules (e.g., reminder channel handling, balance policy variants).
- Factory pattern for module/plugin instantiation.
- Adapter pattern for third-party integrations (SMS/WhatsApp providers).
- Observer/event-style pattern for audit and side-effect workflows.

## Approved UI Modernization Additions

For the frontend modernization track, the following libraries are approved:

- shadcn/ui as the frontend component composition system
- Radix UI primitives for accessible low-level interaction building blocks
- TanStack Table for production-grade data table composition

Conditions:
- Adoption must preserve centralized tokens and brand governance.
- Reusable UI belongs in shared layers; business behavior stays in modules.
- Documentation must be updated in the same change set when these libraries are introduced or materially expanded.

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

- Backend currently lacks a meaningful committed automated test baseline under `src/test`.
- Mobile currently relies on typechecking as its primary gate; a dedicated Jest/RNTL baseline still needs to be introduced.
- Frontend modernization is in progress; continue moving oversized route files into stable module boundaries without creating overly thin abstractions.

These are tracked as governance cleanup items and must be addressed before major feature expansion.
