# Frontend Standards

**Last Updated:** 2026-04-26 | **Owner:** Frontend Architecture  
**Stack:** Vite, React 18, TypeScript, TanStack Query, shadcn/ui, Biome

See [Core Engineering Standards](/standards/engineering) for universal rules. This file covers web-specific standards only.

---

## Application Structure

```
src/
├── app/                 ← Bootstrap, providers, route composition, layout shell
├── modules/<module>/    ← Module-owned pages, hooks, services, types, components
├── shared/              ← Reusable infrastructure (not business logic)
│   ├── api/             ← API client, per-module service files
│   ├── components/ui/   ← shadcn/Radix shared primitives
│   ├── hooks/           ← Cross-module utility hooks
│   └── types/           ← Shared TypeScript types
└── i18n/               ← Internationalization resources
```

---

## Module Rules

- A module owns all UI, hooks, services, and types for one business capability
- `shared/` is for reusable infrastructure — not a dumping ground for business logic
- Modules must not import private internals from other modules
- Page files assemble sections; they do not contain every query, formatter, and modal inline
- Page files exceeding 300 lines must be decomposed into module-owned section components

---

## State Management

| State Type | Solution |
|---|---|
| Server state (API data) | TanStack Query (`useQuery`, `useMutation`) |
| Local UI state | `useState` or `useReducer` |
| Cross-app preferences | App-level providers or well-scoped shared store |
| Financial / business data | Never local-storage-only; server is always canonical |

---

## Routing Rules

- Route definitions live in `src/app/`
- All top-level module routes use `React.lazy` for code splitting
- Auth, shell, and layout concerns stay above module pages
- Navigation labels must align with product vocabulary (see [Architecture](/overview/architecture))

---

## UI Implementation

- Use shadcn or Radix-based primitives before building bespoke controls
- Do not use raw spacing, color, radius, or motion literals in module code — use design tokens
- Accessibility is required, not optional (keyboard navigation, screen reader labels)
- All user-facing copy must be localization-ready from day one (no hardcoded English strings in JSX)

---

## Form Standard

For all non-trivial forms:
- **React Hook Form** for form state and submission
- **Zod** for schema validation
- Shared field, error, and submission-state patterns from `shared/components/ui`

---

## Testing Requirements

| Level | Scope | Tool |
|---|---|---|
| Unit | Hook logic, utility functions | Vitest |
| Component | User interactions, rendering | React Testing Library |
| E2E | Critical golden paths | Playwright |

Minimum per critical workflow:
- One happy-path automated test
- One failure-path check
- One authorization / role-visibility check where relevant

**Current gap:** Most modules lack automated test coverage. This is the highest-priority frontend quality debt.

---

## Performance Rules

- Route-level code splitting is mandatory (enforced by `React.lazy` on module entries)
- Keep bundle growth visible and intentional — add a note in the changelog when adding heavy dependencies
- Long lists and heavy tables must be virtualized or paginated
- Avoid unnecessary client-side re-computation in render paths

---

## API Client Rules

- Each module owns its own service file in `shared/api/` (e.g., `ledgerService.ts`, `adminService.ts`)
- Never call `fetch` or `axios` directly from a component
- All API services use the shared `apiClient` base instance with injected auth headers
- API response types must match backend DTOs — no silent `any` casting
