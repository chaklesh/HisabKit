# Rule 01: Modular Monolithic Architecture

## Overview
HisabKit uses a "Modular Monolith" approach for both Web and Mobile. This means strong internal boundaries between business modules while maintaining a single deployable unit.

## Directory Structure
All client code (Web/Mobile) MUST follow this structure:

- `src/app/`: Bootstrap, providers, global routing.
- `src/modules/<module-name>/`: The heart of the business logic.
  - `pages/`: Main view components.
  - `components/`: Module-specific UI components.
  - `hooks/`: Business logic hooks.
  - `services/`: API calls and side effects.
  - `selectors/`: Logic to derive state.
  - `types/`: Module-specific interfaces.
- `src/shared/`: Cross-module UI primitives and utilities.

## Laws
1. **No Cross-Module Imports**: A module should never import directly from another module's internal folders. Use `src/shared` for shared concerns.
2. **Page Weight**: No Page component should exceed 300 lines. If it does, decompose it into module-specific components.
3. **Lazy Loading**: All top-level module routes MUST be lazy-loaded.
