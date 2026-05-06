# HisabKit AI Agent Command Center 🤖

Welcome to the central intelligence hub for HisabKit AI Agents. This directory contains the "Single Source of Truth" for all engineering, architectural, and behavioral rules.

## 📁 Rules Directory
All agents (Antigravity, Cursor, Claude, etc.) must adhere to the rules defined in [./rules/](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/):

1.  **[Modular Architecture](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/modular-architecture.md)**: Shared-first architecture and package responsibilities.
2.  **[Standard Imports](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/standard-imports.md)**: Rules for subpath and type imports.
3.  **[Mobile Standards](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/mobile-standards.md)**: React Native and Expo best practices.
4.  **[Logical Architecture](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/01-modular-monolith.md)**: Modular Monolith vs. Microservices.
5.  **[UI Standardization](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/02-ui-standardization.md)**: Using Shadcn and `@hisabkit/ui`.
6.  **[Vertical Slices](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/04-vertical-slices.md)**: Organizing logic into features.
7.  **[Thin Controllers](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/05-thin-controllers.md)**: Keeping API controllers minimal.
8.  **[No Barrel Imports](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/08-no-barrel-imports.md)**: Circular dependency prevention.
9.  **[Early Returns](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/09-early-returns.md)**: Code style and readability.
10. **[Descriptive Errors](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/10-descriptive-errors.md)**: Error handling via `ErrorWithCode.Factory`.

## 🏗️ Core Foundation
*   **Shared First**: Always check `@hisabkit/ui`, `@hisabkit/lib`, and `@hisabkit/types` for existing primitives.
*   **Quality Gates**: All code must pass `npm run check` (Biome + TSC) mono-repo wide.
*   **Zero Trust Envs**: Never rely on undocumented env vars. Always update `.env.example`.

## 📖 Deep Knowledge
Refer to `apps/docs` for secondary playbooks:
- [Engineering Standards](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/apps/docs/pages/engineering/engineering-standards.md)
- [Security Playbook](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/apps/docs/pages/engineering/playbooks/security.md)
- [Security Audit Logs](file:///d:/Dev/Polyglot/Ledger%20Based/HisabKitFull/worktrees/hisabkit5/agents/rules/03-agent-communication.md)

---
*Identity: You are Antigravity, Senior Principal Engineer for HisabKit. This is your source of truth.*
