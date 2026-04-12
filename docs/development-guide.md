# Development Guide

## Repository Layout

- hisabkit-backend: Spring Boot backend service.
- hisabkit-frontend: React + Vite web app.
- hisabkit-mobile: React Native (Expo) app.
- docs: active project documentation and archived history.

## Setup Notes

- Use per-project .env files based on each .env.example.
- Keep secrets out of git.
- Start services from their own project roots.
- Keep URLs, keys, and feature flags centralized in config/env modules; avoid scattered literals.

## Configuration And Secrets Discipline

- Follow `docs/config-and-secrets-governance.md` as the mandatory policy.
- No hardcoded secrets in source, docs examples, or default runtime config.
- Use only these central config access points:
	- Backend: Spring environment variables / profile config.
	- Frontend: `src/config/env.ts`.
	- Mobile: `src/config/env.ts`.
- Any new runtime variable must be added in the relevant `.env.example` and documented before use.
- Public client variables must use platform-safe prefixes only (`VITE_*`, `EXPO_PUBLIC_*`).

## Build And Run Commands

Backend:
- mvn spring-boot:run -Dspring-boot.run.profiles=dev
- mvn test

Frontend:
- npm install
- npm run dev
- npm run build
- npm run lint

Mobile:
- npm install
- npx expo start
- npx expo run:android

## Engineering Standards

- Follow SOLID and modular boundaries.
- Prefer clear naming and low coupling.
- Do not duplicate business logic across layers.
- Keep i18n discipline: no hardcoded user-facing strings in multilingual surfaces.
- Follow LLD discipline for medium/large scope: clear interfaces, ownership boundaries, and dependency direction.
- Use design patterns intentionally (strategy/factory/adapter/observer where appropriate), not as decoration.
- Add system design notes for cross-service or cross-module changes before implementation.
- Use only Architect-approved frameworks/libraries listed in `docs/engineering-standards.md`.
- If a new library is required, document the decision and approval first; code changes come after docs update.

## Quality Gates

- No coding without a linked task plan.
- No coding when API/DB impact is undocumented.
- Handoff requires validation evidence relevant to changed scope.
- Release requires full stack validation gates defined in agent-playbook.md.
- For dirty repository states, source checkup + handoff reconciliation is required before net-new feature development.

## Baseline Health Check Commands

Run these after pulling latest changes and before starting feature work:

Backend:
- mvn -q -DskipTests compile

Frontend:
- npm run lint
- npm run build

Mobile:
- npx tsc --noEmit

If any baseline check fails, resolve or document the blocker in `docs/agent-handoff-log.md` before continuing.

## Versioning And Git

- Use one shared product release version across backend, frontend, and mobile for coordinated releases.
- Treat the product version as MAJOR.MINOR.PATCH; keep platform build numbers separate only when a store or packaging system requires them.
- Use a two-branch baseline:
	- `master` (or `main`): stable release branch only.
	- `develop`: integration branch for ongoing work.
- Branch from `develop` using short-lived `feat/`, `fix/`, `refactor/`, and `chore/` branches.
- Use `release/<version>` branches from `develop` when preparing a coordinated release.
- Use `hotfix/<version>` branches from `master` for production fixes.
- Rebase or merge `develop` frequently in active branches.
- Keep version bumps and docs updates in the same work package when contracts, schema, or workflow policy changes.

### Parallel AI Sessions (Safe Branching Model)

- Never run multiple AI sessions in the same checked-out folder.
- For parallel sessions, use one worktree per session.
- Use one branch per task and per session.
- Recommended naming:
	- feat/frontend-<task>-<session-id>
	- refactor/backend-<task>-<session-id>
	- fix/mobile-<task>-<session-id>
- Keep each branch scoped to one stack when possible.
- If one task touches multiple stacks, either:
	- use one integration branch and merge stack-specific PRs into it, or
	- sequence merges stack-by-stack into `develop` with small PRs.
- Before opening PR, sync latest develop:
	- `git fetch origin`
	- `git rebase origin/develop` (or merge develop if preferred)
- Resolve conflicts locally, rerun quality checks, then open PR.
- Do not force-push over another contributor's work unless branch ownership is explicit.

#### Worktree Quick Start (Recommended)

- First session keeps base repo in the original folder.
- Each additional parallel session should run:
	- `git fetch origin`
	- `git worktree add ../HisabKit-<task>-<session> -b <branch-name> develop`
- Example:
	- `git worktree add ../HisabKit-frontend-refactor-s1 -b refactor/frontend-modularize-ledger-s1 develop`
- After merge, clean up:
	- `git worktree remove ../HisabKit-<task>-<session>`
	- `git branch -d <branch-name>`

### Release, Beta, And Hotfix Flow

- Feature flow:
	- `feature branch -> PR -> develop`
- Beta flow:
	- cut `release/1.3.0` from develop
	- publish beta builds from release branch (for example `1.3.0-beta.1`)
	- accept only release-critical fixes in release branch
- Stable release flow:
	- merge `release/<version>` into `master`
	- tag stable release on `master`
	- merge release branch back into `develop`
- Production hotfix flow:
	- cut `hotfix/<version>` from `master`
	- merge hotfix to `master` and tag patch release
	- merge hotfix back into `develop` so branches do not drift

### Pull Request Merge Rules

- PR title should reflect scope and stack.
- PR description must include:
	- scope
	- files touched
	- validation run
	- risks
- Require passing CI for changed stack(s).
- Prefer squash merge for small/medium tasks to keep history readable.
- Tag release only from `master` after coordinated validation.

## Full-Stack Testing Baseline

Frontend:
- Required per PR: `npm run lint`, `npm run typecheck`, `npm run build`
- Target for next phase: unit/component tests and coverage threshold.

Backend:
- Required per PR: `mvn -q -DskipTests compile`
- Required before release: `mvn test`
- Target for next phase: service/controller tests and Jacoco coverage gate.

Mobile:
- Required per PR: `npx tsc --noEmit`
- Target for next phase: Jest + React Native Testing Library smoke coverage.

## UX Notes

- See architecture.md for the task-first layout direction and module navigation pattern.
- Keep planned modules discoverable with clear status labels instead of dead links.

## Product Sequence

- Use docs/roadmap.md as the dependency-based product and agent sequence reference.
- Use Khatabook and OkCredit as market-pattern references only, not as copy targets.
