# HisabKit Documentation System

**Last Updated:** 2026-04-14  
**Purpose:** This directory is the single source of truth for how HisabKit should be designed, built, reviewed, released, and evolved.

## What This Documentation Is For

This docs system does two jobs:

1. It defines the target standard for a practical enterprise-grade MSME finance product.
2. It records where the current repository still falls short so the team can close those gaps deliberately.

These docs are not meant to simply describe whatever exists in the code today. They define the standard the code must converge toward.

## Documentation Principles

- One topic, one owner, one source of truth.
- Policy documents define standards, not temporary habits.
- Current-state gaps are allowed, but they must be made explicit.
- If a change affects architecture, contracts, data, UX standards, quality gates, or release behavior, the docs must be updated in the same change set.
- Historical, agent-specific, and superseded material belongs in `docs/archive`, not in the active navigation path.

## Documentation Map

### Foundation

- [foundation/product-foundation.md](foundation/product-foundation.md): product vision, user model, operating principles, and target experience.
- [foundation/system-architecture.md](foundation/system-architecture.md): target platform architecture, boundaries, module strategy, and deployment shape.

### Standards

- [standards/engineering-standards.md](standards/engineering-standards.md): stack policy, clean-code rules, mandatory quality gates, and approved engineering patterns.
- [standards/backend-standards.md](standards/backend-standards.md): backend architecture, testing, persistence, security, and observability standards.
- [standards/frontend-standards.md](standards/frontend-standards.md): web architecture, state boundaries, routing, testing, performance, and accessibility standards.
- [standards/mobile-standards.md](standards/mobile-standards.md): mobile architecture, offline posture, device integrations, and parity rules.
- [standards/design-system-standards.md](standards/design-system-standards.md): shared UI language, tokens, content standards, and component governance.
- [standards/api-governance.md](standards/api-governance.md): API ownership, versioning, error model, compatibility rules, and consumer expectations.
- [standards/data-governance.md](standards/data-governance.md): schema, migration, tenancy, retention, audit, and financial data integrity rules.
- [standards/configuration-and-secrets.md](standards/configuration-and-secrets.md): runtime config, secrets, environment separation, and key rotation policy.

### Delivery

- [delivery/delivery-operating-model.md](delivery/delivery-operating-model.md): planning, design, execution flow, definition of ready, definition of done, and merge discipline.
- [delivery/roadmap.md](delivery/roadmap.md): target delivery phases, sequencing, outcomes, and timeline.
- [delivery/progress-tracker.md](delivery/progress-tracker.md): current progress, current gaps, and standards adoption status.
- [delivery/release-and-operations.md](delivery/release-and-operations.md): CI/CD expectations, environments, deployment, rollback, support, and incident handling.

### Governance

- [governance/architecture-decisions.md](governance/architecture-decisions.md): ADR register for major technical and product-delivery decisions.

## Read Order

### New Team Member

1. [foundation/product-foundation.md](foundation/product-foundation.md)
2. [foundation/system-architecture.md](foundation/system-architecture.md)
3. [standards/engineering-standards.md](standards/engineering-standards.md)
4. [delivery/delivery-operating-model.md](delivery/delivery-operating-model.md)
5. Relevant platform standard doc
6. [delivery/progress-tracker.md](delivery/progress-tracker.md)

### Backend Work

1. [foundation/system-architecture.md](foundation/system-architecture.md)
2. [standards/engineering-standards.md](standards/engineering-standards.md)
3. [standards/backend-standards.md](standards/backend-standards.md)
4. [standards/api-governance.md](standards/api-governance.md)
5. [standards/data-governance.md](standards/data-governance.md)
6. [delivery/delivery-operating-model.md](delivery/delivery-operating-model.md)

### Frontend Work

1. [foundation/system-architecture.md](foundation/system-architecture.md)
2. [standards/engineering-standards.md](standards/engineering-standards.md)
3. [standards/frontend-standards.md](standards/frontend-standards.md)
4. [standards/design-system-standards.md](standards/design-system-standards.md)
5. [standards/api-governance.md](standards/api-governance.md)
6. [delivery/delivery-operating-model.md](delivery/delivery-operating-model.md)

### Mobile Work

1. [foundation/system-architecture.md](foundation/system-architecture.md)
2. [standards/engineering-standards.md](standards/engineering-standards.md)
3. [standards/mobile-standards.md](standards/mobile-standards.md)
4. [standards/design-system-standards.md](standards/design-system-standards.md)
5. [standards/api-governance.md](standards/api-governance.md)
6. [delivery/delivery-operating-model.md](delivery/delivery-operating-model.md)

## Source Of Truth Hierarchy

If two docs appear to disagree, follow this order:

1. `governance/architecture-decisions.md`
2. `standards/engineering-standards.md`
3. Platform-specific standards
4. `foundation/system-architecture.md`
5. Delivery and progress docs

## Document Lifecycle

- Active policy belongs in the files listed above.
- Temporary notes, handoffs, and superseded plans must be moved to `docs/archive`.
- When a document is replaced, archive the old version rather than keeping two active versions with overlapping authority.
- Every active standards and governance doc must include a `Last Updated` line.
