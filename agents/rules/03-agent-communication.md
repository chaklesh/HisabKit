# Rule 03: Agent Communication & Handoffs

## Overview
To ensure continuity between different AI sessions, this repository maintains a living history of decisions.

## Requirements
1. **Handoff Logs**: After every major architectural change, update `docs/agent-handoff-log.md` with:
   - What was changed.
   - Why it was changed.
   - Any technical debt introduced.
2. **Commit Messages**: Use Conventional Commits.
3. **Audit First**: Always run `npm run check` (lint, typecheck, test) before declaring a task done. If it fails, fix the regression immediately.
4. **Don't Assume**: If an API endpoint is not documented, search the Spring Boot `Controller` files in `apps/api` first before mocking it incorrectly.
