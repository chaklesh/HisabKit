# Rule 04: Vertical Slices & Feature Boundaries

## Overview
HisabKit follows the "Vertical Slice" architecture. Instead of organizing code by technical layer (controllers, services, repositories), organize it by business feature (ledger, onboarding, billing).

## Principles
1. **Locality**: Code that changes together should live together.
2. **Encapsulation**: Each feature should expose a clean public API and hide its internal implementation details.
3. **Cross-Package Boundaries**: 
   - Feature logic should be moved to `packages/features/<feature-name>` when shared between Web and Mobile.
   - For backend (Spring Boot), use package-level visibility to enforce boundaries. Avoid large, flat `service` packages.

## Implementation (Spring Boot)
- **Bad**: `com.hisabkit.service.LedgerService`
- **Good**: `com.hisabkit.ledger.LedgerService` (where `repository`, `domain`, and `controller` for ledger also reside in sub-packages of `com.hisabkit.ledger`).

## Implementation (React)
- Use `src/modules/<feature-name>` as the primary landing zone.
- Barrel imports (index.ts) should only exist at the module root to export what is public.
- Avoid circular dependencies between modules.
