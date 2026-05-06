# Mobile Development Standards

Developing for HisabKit Mobile requires strict adherence to React Native and Expo best practices, while maintaining parity with the Web experience.

## UI Foundation

-   **Shared Primitives**: Use components from `@hisabkit/ui` whenever they are cross-platform compatible.
-   **Native Alternatives**: For components that rely on DOM-specific APIs (like `@radix-ui`), use `react-native-paper` or custom native implementations in `apps/mobile/src/shared/components`.

## Code Sharing

-   **Business Logic**: Hooks and business logic MUST be shared via `@hisabkit/features`.
-   **Types**: DTOs and state interfaces MUST be shared via `@hisabkit/types`.

## Build & Resolution (Metro)

-   Always run `npm install` from the root to ensure workspace hoisting.
-   If you add a new package dependency, ensure it's listed in `apps/mobile/package.json` to help Metro resolve it correctly.
-   Use `expo start --clear` if you encounter resolution errors after package changes.

## Best Practices

-   **Early Returns**: Use early returns for conditional rendering in components.
-   **Strict Typing**: Avoid `any`. Use interfaces from `@hisabkit/types`.
-   **Performance**: Use `useMemo` and `useCallback` for expensive operations passed to native list components.
