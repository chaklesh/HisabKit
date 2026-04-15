# Frontend Standards

**Last Updated:** 2026-04-14  
**Owner:** Frontend Architecture

## Purpose

Define the target structure and quality bar for the web client.

## Architecture Standard

The web app should follow a modular monolith structure:

- `src/app`: app bootstrap, providers, route composition, layout shell
- `src/modules/<module>`: module-owned pages, hooks, services, types, and components
- `src/shared`: reusable UI primitives, utilities, API client, config, and cross-cutting helpers

This is the standard because it scales better than page-led sprawl while remaining simpler than a micro-frontend model.

## Module Rules

- modules own business-facing UI for a capability
- shared is for reusable infrastructure, not business dumping ground
- modules must not import private internals from other modules
- page files should assemble screens, not contain every query, formatter, and modal inline

## State Management Rules

- server state belongs in TanStack Query or the module API layer
- ephemeral UI state stays local to the screen or component
- cross-app preferences belong in app-level providers or a well-scoped shared store
- local storage may cache convenience data but must not become the only source of truth for financial data

## Routing Rules

- route definitions live in `src/app`
- routes should lazy load heavy module entry points
- auth, shell, and layout concerns stay above module pages
- navigation labels must align with product vocabulary

## UI Implementation Standard

- use shared shadcn or Radix-based primitives before building bespoke controls
- avoid raw ad-hoc spacing, color, radius, and motion decisions in module code
- accessibility is required, not optional
- all user-facing copy must be localization-ready

## Form Standard

Preferred approach for non-trivial forms:

- React Hook Form
- schema validation with Zod
- shared field, error, and submission-state patterns

## Testing Standard

Required target baseline:

- Vitest for unit and integration-friendly tests
- React Testing Library for component behavior
- Playwright for critical-path smoke tests

At minimum, each critical workflow should have:

- one automated happy-path test
- one failure-path check
- one authorization or role-visibility check where relevant

## Performance Standard

- use route-level code splitting
- keep bundle growth visible and intentional
- avoid unnecessary client-side recomputation and oversized page components
- long lists and heavy tables should be virtualized or paginated as needed

## Current Gap Notes

- the web app has started the modular-monolith transition but still contains oversized route files
- settings and shared app-layer improvements have started, but broader modular extraction remains unfinished
- the standard in this document should guide the refactor path from here
