# Copilot Handoff

Last updated: 2026-04-14
Workspace: `d:\Dev\Polyglot\Ledger Based\HisabKitFull\worktrees\hisabkit1`
Primary app focus: `hisabkit-frontend`

## What This Project Is

HisabKit is a production-aspiring MSME finance and ledger platform with:
- Backend: Spring Boot / Java 21
- Web frontend: React 18 + TypeScript + Vite
- Mobile: React Native + Expo

The current focus is the web frontend modernization and cross-platform streamlining plan.

## Core Product Direction

The current agreed direction is:
- Move the client architecture toward a `modular monolith`, not feature-first.
- Keep a single deployable web app and a single deployable mobile app, but create strong internal module boundaries.
- Align web and mobile product vocabulary around the same business modules:
  - dashboard
  - ledger
  - reports
  - profile
  - settings
  - admin
- Use an industry-grade prebuilt UI foundation instead of ad-hoc page markup.
- Keep docs updated whenever stack or architecture changes.
- Maintain production-grade quality gates and avoid drifting into prototype-style page sprawl.

## High-Level Decisions Already Made

These are not tentative; they were discussed and explicitly approved:

1. Client architecture:
- Use a modular monolith structure for web and mobile.
- `src/app` should hold app bootstrap, providers, and routing.
- `src/modules/<module>` should hold module-specific pages/components/hooks/services/selectors/types.
- `src/shared` should hold cross-module UI, utilities, and shared types.

2. UI modernization:
- Approved libraries on web:
  - `shadcn/ui`
  - `Radix UI primitives`
  - `TanStack Table` (approved, not yet integrated into a screen)
  - `next-themes`
  - `sonner`
  - `class-variance-authority`
- Goal: stop building one-off UI surfaces and instead compose from shared primitives.

3. Settings:
- A proper Settings page is considered a product requirement, not a nice-to-have.
- It should become the cross-platform control center for:
  - theme
  - language
  - business profile
  - reminder preferences
  - security/session controls
  - dashboard/layout preferences

4. Product priorities:
- Stability first
- Production-safe architecture second
- Shared UI/theming third
- Settings and cross-platform streamlining next
- Large page decomposition after the shared foundation exists

## Important Docs To Read First

Read these before making architecture changes:

- `docs/engineering-standards.md`
- `docs/frontend-engineering-playbook.md`
- `docs/architecture.md`
- `docs/architecture-decisions.md`
- `docs/agent-handoff-log.md`

These docs were already updated to reflect the modular monolith direction and approved UI stack additions.

## What Was Wrong Before This Handoff

Before the current work:
- The frontend had no clean `src/app` bootstrap boundary.
- Large page files were doing too much:
  - `LedgerDashboard.tsx` is still extremely large
  - `AdminDashboard.tsx` is still extremely large
  - `ProfilePage.tsx` still contains too much inline UI/state logic
- The app mixed prototype-style page composition with production-like service layers.
- The frontend quality gate was failing because `profileService.test.ts` mocked the wrong API shape.
- The codebase did not yet have an approved shared UI component foundation for the next refactor phases.

## What Has Already Been Implemented

### 1. Frontend stability recovery

Completed:
- Fixed the failing frontend test in:
  - `hisabkit-frontend/src/features/profile/profileService.test.ts`
- Confirmed the frontend quality gate passes:
  - `npm run check`

This means:
- lint passes
- typecheck passes
- tests pass
- build passes

### 2. App bootstrap extraction

Added a real app-layer scaffold:
- `hisabkit-frontend/src/app/AppProviders.tsx`
- `hisabkit-frontend/src/app/AppRouter.tsx`
- `hisabkit-frontend/src/app/AppRoot.tsx`
- `hisabkit-frontend/src/app/ThemeProvider.tsx`

Updated:
- `hisabkit-frontend/src/App.tsx`
- `hisabkit-frontend/src/main.tsx`

Purpose:
- Move providers/routing/bootstrap out of the old flat entrypoint setup.
- Create a stable place to grow shared app concerns.

### 3. shadcn/ui initialization and shared UI foundation

Initialized shadcn in the existing Vite app.

Key generated/added files:
- `hisabkit-frontend/components.json`
- `hisabkit-frontend/src/components/ui/button.tsx`
- `hisabkit-frontend/src/components/ui/card.tsx`
- `hisabkit-frontend/src/components/ui/input.tsx`
- `hisabkit-frontend/src/components/ui/table.tsx`
- `hisabkit-frontend/src/components/ui/tabs.tsx`
- `hisabkit-frontend/src/components/ui/badge.tsx`
- `hisabkit-frontend/src/components/ui/alert.tsx`
- `hisabkit-frontend/src/components/ui/dialog.tsx`
- `hisabkit-frontend/src/components/ui/sheet.tsx`
- `hisabkit-frontend/src/components/ui/separator.tsx`
- `hisabkit-frontend/src/components/ui/skeleton.tsx`
- `hisabkit-frontend/src/components/ui/dropdown-menu.tsx`
- `hisabkit-frontend/src/components/ui/sonner.tsx`
- `hisabkit-frontend/src/lib/utils.ts`

Supporting config changes:
- Added import alias `@/*`
- Updated:
  - `hisabkit-frontend/tsconfig.json`
  - `hisabkit-frontend/vite.config.ts`
  - `hisabkit-frontend/tailwind.config.js`
  - `hisabkit-frontend/src/index.css`

Notes:
- Some generated shadcn code had to be adjusted for:
  - this repo's existing `lucide-react` version
  - Tailwind v3 compatibility
- These adjustments have already been made and validated by `npm run check`.

### 4. Theme + toast infrastructure

Implemented app-level theme support:
- `next-themes` integrated through `src/app/ThemeProvider.tsx`

Implemented app-level toaster:
- `sonner` integrated through `src/app/AppProviders.tsx`
- toaster component:
  - `src/components/ui/sonner.tsx`

### 5. First modular-monolith settings screen

Added the first real module-scoped page:
- `hisabkit-frontend/src/modules/settings/pages/SettingsPage.tsx`

Route added:
- `/settings`

Navigation updated:
- `hisabkit-frontend/src/layout/AppShell.tsx`

Current settings behavior:
- Theme preference works:
  - light
  - dark
  - system
- Language preference works:
  - English
  - Hindi
- Toast feedback is shown when theme/language changes

### 6. i18n updates

Updated:
- `hisabkit-frontend/public/locales/en.json`
- `hisabkit-frontend/public/locales/hi.json`

The Hindi locale file was rewritten cleanly in UTF-8 because the previous console rendering was garbled.

### 7. Architecture/documentation updates

Updated docs:
- `docs/engineering-standards.md`
- `docs/frontend-engineering-playbook.md`
- `docs/architecture.md`
- `docs/architecture-decisions.md`

These now reflect:
- modular monolith direction
- approved UI modernization stack
- current app/bootstrap foundation
- shadcn/next-themes/sonner additions

## Validation Status

As of this handoff:

Frontend validation command:

```bash
cd hisabkit-frontend
npm run check
```

Latest known result:
- PASS

## Important Current Constraints

1. Do not undo existing user/worktree changes casually.
- The worktree is dirty.
- Treat all current modified files as potentially intentional unless you understand them.

2. The modular monolith migration is started, not finished.
- `src/app` exists now.
- `src/modules/settings` exists now.
- Most legacy screens are still not extracted.

3. Existing page debt is still present.
- `LedgerDashboard.tsx` remains too large.
- `AdminDashboard.tsx` remains too large.
- `ProfilePage.tsx` remains too page-heavy.

4. The shared design system is available, but adoption is still early.
- New UI work should prefer shared primitives first.
- Old pages still use lots of direct Tailwind markup.

## Highest Priority Next Steps

These are the real next tasks in priority order.

### P1. Decompose the ledger screen

Target:
- Start breaking `hisabkit-frontend/src/pages/LedgerDashboard.tsx` into module-owned pieces.

Recommended target structure:
- `src/modules/ledger/pages/...`
- `src/modules/ledger/components/...`
- `src/modules/ledger/hooks/...`
- `src/modules/ledger/selectors/...`
- `src/modules/ledger/services/...`
- `src/modules/ledger/types/...`

Suggested first cuts:
- customer list pane
- ledger header/status strip
- transaction list
- report panel
- customer form drawer
- transaction form drawer
- attachment/lightbox logic

### P2. Add route-level code splitting

There is now a build warning because the JS bundle is large.

Observed warning:
- chunk larger than `500 kB`

Next improvement:
- lazy-load heavy routes such as:
  - ledger
  - admin
  - settings
  - profile

Use:
- `React.lazy`
- `Suspense`
- route-level lazy wrappers in `AppRouter.tsx`

### P3. Expand settings toward real product controls

Current settings page only covers:
- theme
- language
- roadmap placeholders

Next settings sections should become real:
- business profile preferences
- reminder defaults
- notification preferences
- security/session controls
- dashboard/layout preferences

### P4. Start mobile alignment

The user explicitly wants web and mobile streamlining.

What that means practically:
- same module vocabulary
- same settings model
- same theme semantics
- same language behavior
- same shared product concepts

Recommended mobile next steps:
- create a mobile settings screen
- add theme preference model on mobile
- add language switching model on mobile
- align labels/options with web

### P5. Continue replacing ad-hoc markup with shared primitives

On all new/refactored web work:
- prefer `Card`, `Tabs`, `Badge`, `Alert`, `Button`, `Input`, `Dialog`, `Sheet`, `Table`, `Separator`, `Skeleton`, `sonner`
- do not invent raw alert boxes/cards/buttons for reusable surfaces unless necessary

## Suggested Execution Order For Copilot

If continuing from here, this is the recommended implementation sequence:

1. Read the docs listed above
2. Confirm `npm run check` is green locally
3. Refactor `LedgerDashboard` into module-owned slices
4. Add lazy-loaded routes in `AppRouter.tsx`
5. Expand settings into real business/security/layout sections
6. Start matching mobile settings/theme/language architecture
7. Then tackle `AdminDashboard`
8. Then tackle `ProfilePage`

## Current File/Change Summary

The worktree currently shows modified files including:

Docs:
- `docs/architecture-decisions.md`
- `docs/architecture.md`
- `docs/engineering-standards.md`
- `docs/frontend-engineering-playbook.md`

Frontend config/platform:
- `hisabkit-frontend/package.json`
- `hisabkit-frontend/package-lock.json`
- `hisabkit-frontend/tsconfig.json`
- `hisabkit-frontend/vite.config.ts`
- `hisabkit-frontend/tailwind.config.js`
- `hisabkit-frontend/components.json`
- `hisabkit-frontend/src/index.css`

Frontend app structure:
- `hisabkit-frontend/src/App.tsx`
- `hisabkit-frontend/src/main.tsx`
- `hisabkit-frontend/src/app/*`

Frontend UI/system:
- `hisabkit-frontend/src/components/ui/*`
- `hisabkit-frontend/src/lib/utils.ts`

Frontend product/UI:
- `hisabkit-frontend/src/layout/AppShell.tsx`
- `hisabkit-frontend/src/modules/settings/pages/SettingsPage.tsx`
- `hisabkit-frontend/public/locales/en.json`
- `hisabkit-frontend/public/locales/hi.json`

Test fix:
- `hisabkit-frontend/src/features/profile/profileService.test.ts`

Legacy large page still dirty:
- `hisabkit-frontend/src/pages/LedgerDashboard.tsx`

Treat this as an in-progress modernization branch, not a clean baseline branch.

## Exact Prompt To Give Copilot

You can paste this to Copilot Chat:

```md
Read `COPILOT_HANDOFF.md` first and continue from there.

Constraints:
- modular monolith, not feature-first
- preserve docs updates when stack/architecture changes
- do not revert unrelated worktree changes
- prefer shared shadcn/Radix primitives over custom page markup
- keep `npm run check` green

Immediate next task:
- refactor `hisabkit-frontend/src/pages/LedgerDashboard.tsx` into module-owned boundaries under `src/modules/ledger`
- then add route-level lazy loading in `src/app/AppRouter.tsx`
```

## Final Note

This handoff is intended to let Copilot continue as if the previous work and planning context were still present. It is not just a brief summary; it contains:
- what was decided
- what was changed
- what passed validation
- what is still risky
- what should happen next

