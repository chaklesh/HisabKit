# Frontend Engineering Playbook

**Owner:** Frontend Engineering
**Scope:** `hisabkit-frontend`
**Last Updated:** 2026-04-14
**Purpose:** Keep the web frontend scalable, readable, and safe as team size grows.

This playbook is frontend-specific implementation guidance under shared standards in:
- `docs/engineering-standards.md`
- `docs/development-guide.md`
- `docs/brand-theme-standards.md`

Related stack docs:
- `docs/backend-engineering-playbook.md`
- `docs/mobile-engineering-playbook.md`

## 1) What This Work Is Called

- Refactoring: improving internal code structure without changing user-visible behavior.
- Standardization: enforcing one way of doing things across the codebase.
- Hardening: adding reliability and quality gates such as lint, typecheck, tests, and build validation.

## 2) Non-Negotiable Rules

- Do not merge frontend code that fails lint, typecheck, test, or build.
- Keep components focused and reasonably small; avoid mega pages and "god components."
- Keep one source of truth for domain types at the correct boundary.
- Keep all network calls behind the API layer or module service layer.
- Avoid `any` and avoid disabling lint rules unless justified in review.
- No hardcoded user-facing strings on multilingual surfaces.
- Reusable UI should be composed from shared primitives before adding bespoke markup.

## 3) Preferred Frontend Structure

Use a modular monolith organization:

- `src/app`: app bootstrap, providers, routing, shell assembly
- `src/modules/<module-name>`:
  - `api`
  - `hooks`
  - `components`
  - `pages`
  - `types`
  - `selectors`
  - `services`
  - `utils`, where justified
- `src/shared`:
  - `ui`
  - `lib`
  - `types`
  - `config`

Rules for the modular monolith:
- Modules own their UI, orchestration, and local domain helpers.
- Cross-module reuse belongs in `src/shared`, not in another module.
- Pages should compose module parts; they should not become the entire module.
- Migration should be incremental and should reduce complexity, not just move files around.
- Avoid over-fragmentation into tiny files with no clear ownership gain.

## 4) File Size Guidance

- Soft limit: 300 lines per component/page file.
- Hard limit: 500 lines. If exceeded, split intentionally.
- Exceptions are allowed only when decomposition would reduce clarity rather than improve it.

## 5) State And Data Rules

- Server state: React Query.
- UI state: `useState` / `useReducer` local to the module/component.
- App-wide concerns: providers in `src/app` or shared context only when truly cross-cutting.
- Do not mix server orchestration and heavy presentation in one file.

## 6) Type Rules

- Domain types live in one place per module.
- Shared cross-module types live in `src/shared/types`.
- API response normalization should happen at the boundary.
- Frontend-only view models should be clearly separate from backend contract types.

## 7) UI And Theming Rules

- Use centralized tokens and shared primitives.
- Prefer shadcn/Radix composition for reusable controls and containers.
- Avoid raw one-off alert, button, badge, dialog, and card markup for reusable surfaces.
- Keep dark/light/system theming centralized through app-level providers.
- Preserve accessible semantics and keyboard behavior when composing primitives.

## 8) i18n Rules

- All user-visible text must use i18n keys on multilingual surfaces.
- Keep keys grouped by module/page.
- English and Hindi entries must be added in the same change.
- Remove stale copy from locale files when a screen or feature changes materially.

## 9) Pull Request Checklist

- Behavior unchanged for refactors, or explicitly documented for product changes.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run build` passes.
- i18n keys added or updated for new UI strings.
- No duplicate domain types introduced.

## 10) Current Direction

Current known direction in the codebase:
- `src/app` is the correct home for bootstrap, providers, and route assembly.
- `src/modules/ledger` and `src/modules/settings` are current modular-monolith reference areas.
- Shared UI infrastructure uses shadcn/Radix primitives and centralized utility helpers.
- Large legacy routes such as admin and profile still need continued decomposition.

## 11) Incremental Migration Plan

- Phase 1: guardrails, docs, and validation gates.
- Phase 2: shared UI and shared config consolidation.
- Phase 3: extract oversized pages into module-owned slices.
- Phase 4: tighten route-level code splitting and data boundaries.
- Phase 5: complete i18n and design-system adoption across legacy screens.

## 12) Document Lifecycle Rule

- Update this playbook in place; do not create parallel frontend policy docs.
- Add short addenda sections instead of many small overlapping docs.
- If a section becomes obsolete, move historical detail to `docs/archive`.
- Keep implementation status truthful; move detailed deltas to `docs/agent-handoff-log.md`.
