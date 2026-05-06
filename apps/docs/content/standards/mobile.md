# Mobile Standards

**Last Updated:** 2026-04-26 | **Owner:** Mobile Architecture  
**Stack:** Expo 52, React Native, TypeScript, Expo Router

See [Core Engineering Standards](/standards/engineering) for universal rules. This file covers mobile-specific standards only.

---

## Application Structure

```
src/
├── app/                 ← Navigation, providers, layout, global concerns
├── modules/<module>/    ← Screens, hooks, services, view models, types
└── shared/
    ├── api/             ← API client (same backend as web, same contracts)
    ├── theme/           ← Centralized theme tokens (colors, spacing, typography)
    └── components/      ← Shared React Native primitives
```

---

## Module Rules

- Each module owns its screens, hooks, and types end-to-end
- Modules share infrastructure through `shared/` — never through cross-module imports
- Screen files assemble views; they do not contain inline API logic and business rules

---

## Cross-Platform Parity Rules

- Mobile and web must use the same **vocabulary** (module names, domain terms)
- Mobile and web must apply the same **business rules** (balance calculation, transaction types, status logic)
- Mobile and web may differ in **layout, navigation pattern, and component implementation**
- Settings and preferences model should be aligned across both platforms

---

## Theme and Design

- All styling must derive from the centralized theme system in `shared/theme/`
- No raw hardcoded hex colors, spacing literals, or font sizes in screen code
- Dark and light mode support is required
- Mobile UI intent must match web intent even when components differ

Common patterns that must be standardized:
- Page headers
- Section cards
- Form rows
- Alert / feedback states
- Empty states

---

## Offline and Sync Posture

- Financial data has a server-side canonical source of truth — always
- Offline caching is acceptable for read-heavy views; it must not allow offline mutations that silently diverge from the server
- Sync logic lives in `shared/` or a dedicated module sync service — not in screens

---

## Testing Requirements

| Level | Scope | Tool |
|---|---|---|
| Unit | Hook logic, utility functions, sync logic | Jest / Vitest |
| Component | Rendering, interactions | React Native Testing Library |
| E2E | Critical golden paths (auth, ledger creation) | Detox or Maestro |

**Current gap:** Mobile automated test baseline does not yet exist. This is a Phase 1 exit criterion.

---

## Navigation Rules

- Use Expo Router (file-based navigation) for all routing
- Screen names and route paths must match product vocabulary
- Navigation guards (auth, tenant) live in the root `app/` layout — not in individual screens

---

## Performance Rules

- Avoid heavy re-renders from deeply nested state — use module-scoped state management
- Long lists use `FlashList` or `FlatList` with proper `keyExtractor`
- Images use `expo-image` with proper caching
- API calls use TanStack Query (same pattern as web) for server state
