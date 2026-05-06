# Mobile Engineering Playbook

**Owner:** Mobile Engineering
**Scope:** `hisabkit-mobile`
**Last Updated:** 2026-04-14
**Purpose:** Keep the mobile app practical for operators, maintainable for engineers, and aligned with the platform's shared product model.

This playbook is mobile-specific implementation guidance under shared standards in:
- `docs/engineering-standards.md`
- `docs/development-guide.md`
- `docs/brand-theme-standards.md`
- `docs/config-and-secrets-governance.md`

## 1) Non-Negotiable Rules

- Mobile must consume backend-owned contracts; it must not invent competing domain shapes.
- Device capability code must be isolated behind services or focused screen/controller logic.
- Keep theme, auth, and navigation concerns centralized rather than duplicated across screens.
- No hardcoded API base URLs or provider IDs outside central config.
- Keep operator workflows fast, legible, and resilient to weak connectivity.

## 2) Current Mobile Shape

The current app is an Expo/React Native application with this structure:

- `src/components`
- `src/config`
- `src/context`
- `src/navigation`
- `src/screens`
- `src/services`
- `src/theme`
- `src/types`
- `src/utils`

This is a reasonable base. Continue toward a modular monolith gradually rather than exploding the file count prematurely.

## 3) Responsibility Boundaries

- `screens`:
  - route-level composition
  - UI orchestration
  - user interaction handling
- `services`:
  - API calls
  - offline/cache helpers
  - auth/session storage
  - device integration wrappers where appropriate
- `context`:
  - app-wide concerns such as theme/auth state only
- `theme`:
  - token definitions and theme-mode behavior
- `types`:
  - shared mobile-facing contract types

## 4) UX And Product Rules

- Optimize for one-handed use and quick operator decision-making.
- Keep primary tasks discoverable within 1-2 taps from home surfaces.
- Treat loading, offline, and sync states as core product behavior, not edge cases.
- Use the same module vocabulary as web where practical:
  - dashboard
  - ledger
  - reports
  - profile
  - settings
  - admin, if mobile support is later approved

## 5) Theme, Settings, And Cross-Platform Alignment

- Mobile already has a `ThemeContext`; continue using centralized theme control rather than ad-hoc screen-level theme logic.
- Settings on mobile should converge with web in intent and vocabulary:
  - appearance
  - language
  - business preferences
  - reminders
  - security/session behavior
- Equivalent intent matters more than identical screen layouts.

## 6) Device Capability Guidance

Use dedicated services or narrow integration points for:
- biometric auth
- document/image picking
- connectivity status
- secure or persistent local storage

Rules:
- keep permissions handling explicit
- degrade gracefully when capability is unavailable
- avoid mixing business logic with native capability branching

## 7) Testing And Quality Gates

Minimum current baseline:
- `npx tsc --noEmit`

Current observed gaps:
- no committed app-level Jest or React Native Testing Library setup yet
- no documented mobile smoke-test checklist yet

Near-term test priorities:
- auth/session restore
- theme/settings behavior
- offline queue behavior
- ledger screen smoke coverage

## 8) Clean Code Rules

- Avoid giant screen components.
- If a screen grows beyond a practical ownership boundary, extract companion components/services first.
- Keep formatting, data transformation, and persistence helpers out of JSX-heavy files.
- Prefer clear names over compact but ambiguous code in operator-critical flows.

## 9) Pull Request Checklist

- Typecheck passes.
- Config changes documented in `.env.example` and docs if needed.
- New strings fit cross-platform terminology.
- Theme and accessibility impact considered.
- Offline and weak-network behavior reviewed when touching data flows.
