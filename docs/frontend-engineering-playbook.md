# Frontend Engineering Playbook

**Owner:** Frontend Engineering
**Scope:** hisabkit-frontend
**Last Updated:** 2026-04-12
**Purpose:** Keep frontend development scalable, readable, and safe as team size grows.

This playbook is frontend-specific implementation guidance under shared standards in:
- docs/engineering-standards.md
- docs/development-guide.md
- docs/agent-playbook.md

Equivalent playbooks should be added for backend and mobile with the same structure to keep governance consistent across stacks.

## 1) What This Work Is Called

- Refactoring: Improving internal code structure without changing user-visible behavior.
- Standardization: Enforcing one way of doing things across the codebase.
- Hardening: Adding reliability and quality gates (lint, typecheck, build, CI checks).

## 2) Non-Negotiable Rules

- Do not merge code that fails lint, typecheck, or build.
- Keep components focused and small. Avoid mega components.
- Keep one source of truth for domain types.
- Keep all network calls behind the API layer or feature service layer.
- Avoid any and avoid disabling lint rules unless justified in code review.
- No hardcoded user-facing strings on multilingual surfaces.

## 3) Preferred Frontend Structure

Use feature-first organization:

- src/app: app bootstrap, providers, routing setup
- src/features/<feature-name>:
  - api
  - hooks
  - components
  - pages
  - types
- src/shared:
  - ui
  - lib
  - types
  - config

Current code does not fully follow this yet. Migration should be incremental.

## 4) File Size Guidance

- Soft limit: 300 lines per component/page file.
- Hard limit: 500 lines. If exceeded, split immediately.

## 5) State And Data Rules

- Server state: React Query (queries, mutations, cache, retries).
- UI state: useState/useReducer local to the feature/component.
- Do not mix server orchestration and heavy presentation in one file.

## 6) Type Rules

- Domain types live in one place per feature.
- Shared cross-feature types live in src/shared/types.
- API response normalization should happen at the boundary.

## 7) i18n Rules

- All user-visible text must use i18n keys.
- Keep keys grouped by feature/page.
- English and Hindi entries must be added in the same change.

## 8) Git Workflow (Simple And Safe)

- Branch naming:
  - feat/frontend-<topic>
  - refactor/frontend-<topic>
  - fix/frontend-<topic>
- Keep PRs small and focused.
- Use Conventional Commits:
  - feat:
  - fix:
  - refactor:
  - chore:
  - docs:
  - test:

## 9) Pull Request Checklist

- Behavior unchanged (for refactors) or clearly documented (for features).
- Lint passes.
- Typecheck passes.
- Build passes.
- i18n keys added for new UI strings.
- No duplicate domain types introduced.

## 10) Incremental Migration Plan

- Phase 1: Add guardrails (docs + scripts + CI).
- Phase 2: Extract shared types and API services.
- Phase 3: Split large pages into feature modules.
- Phase 4: Adopt React Query for server state flows.
- Phase 5: Full i18n coverage across pages.

## 11) Document Lifecycle Rule

- Update this playbook in place; do not create duplicate frontend policy docs.
- Add short addenda sections instead of creating many small policy files.
- If a section becomes obsolete, move details to docs/archive and keep this file concise.

## 12) Status & Handoffs

- Keep this playbook focused on policy and short status. Do not maintain per-change deltas here.
- Per-package/delta handoffs and detailed refactor logs belong in `docs/agent-handoff-log.md` (one entry per completed package).
- Short status: frontend refactor work is ongoing; current active work is focused on safely extracting feature services and tests.

For full change history and per-package validation records, see `docs/agent-handoff-log.md`.

If you need to include a short progress note here, add a one-line bullet and link to the corresponding handoff-log entry.
