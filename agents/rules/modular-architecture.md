# Modular Architecture Rules

HisabKit follows a "Shared-First" modular architecture. All logic, components, and types should be placed in the appropriate workspace package before being used in an app.

## Package Responsibilities

-   **`@hisabkit/ui`**: Atomic UI components (Buttons, Inputs, etc.) and shared layout primitives. No business logic.
-   **`@hisabkit/lib`**: Pure utility functions, constants, and shared helpers (formatting, validation logic).
-   **`@hisabkit/types`**: Unified TypeScript interfaces and DTOs shared between API, Web, and Mobile.
-   **`@hisabkit/features`**: Domain-specific logic, hooks, and complex components (e.g., `ledger`, `auth`).

## Dependency Direction

-   Apps (`web`, `mobile`, `docs`) $\rightarrow$ `@hisabkit/*`
-   `@hisabkit/features` $\rightarrow$ `@hisabkit/ui`, `@hisabkit/lib`, `@hisabkit/types`
-   `@hisabkit/ui` $\rightarrow$ `@hisabkit/lib`, `@hisabkit/types`
-   `@hisabkit/lib` $\rightarrow$ `@hisabkit/types`

## Enforcement

-   **No Barrel Imports**: Always import directly from the subpath (e.g., `@hisabkit/ui/components/Button`).
-   **No Cross-Feature Imports**: Features should not depend on other features directly. Shared logic between features belongs in `lib` or a common feature.
-   **Zero Relative Imports to Packages**: Never use `../../packages/ui` from an app. Use `@hisabkit/ui`.
