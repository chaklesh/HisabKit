# Agent Context Notes

## Architecture Snapshot
- Backend: Spring Boot + JWT + tenant isolation context.
- Frontend: React + Vite + role-aware dashboards.
- Frontend shell now uses a shared desktop app layout (`src/layout/AppShell.tsx`) with module-driven navigation.
- Frontend modules are registry-driven (`src/modules/moduleRegistry.ts`) for extensibility.
- Auth:
  - Password login (`/api/auth/login`)
  - Google/OneTap social login (`/api/auth/social/google`) for registered users only.

## Key Domain Rules
- `SUPER_ADMIN` can manage all tenants and cross-tenant data.
- Tenant users (e.g. `ADMIN`) can only manage data within their own tenant.
- Ledger balances are recomputed from transactions to support backdated entries.

## Data Model Highlights
- `users`: includes `email`, `mobile`, `google_subject`, `full_name`, `avatar_url`.
- `customers`: tenant-scoped customer accounts.
- `transactions`: dated ledger entries (`SALE`/`PAYMENT`).
- `attachments`: optional proof files linked to transactions.

## API Surfaces
- Tenant-scoped operations: `/api/ledger/**`
- Super-admin operations: `/api/admin/**`
- Module catalog operations: `/api/modules` (authenticated, used for future dynamic navigation)
- Auth: `/api/auth/login`, `/api/auth/social/google`, `/api/auth/register` (super-admin only)
- Attachment content streaming: `/api/ledger/attachments/{attachmentId}/content`
- User profile APIs: `/api/profile`, `/api/profile/password`, `/api/profile/tenant`

## Plugin Direction
- Planned plugin catalog managed by super admin per tenant.
- First target plugin: reminders (SMS/WhatsApp deeplink with prefilled balance text).
- Ledger UI now includes customer-level SMS/WhatsApp deeplink actions from the selected customer header.
- Tenant-managed message templates support variables:
  - `{{customerName}}`
  - `{{balance}}`
  - `{{balanceType}}`
  - `{{businessName}}`
  - `{{customerPhone}}`

## Desktop UX Direction
- Adaptation target is pattern-level alignment with popular MSME ledger desktop workflows.
- Standard structure: left module rail + sticky workspace header + task-first content.
- Reference doc: docs/KHATABOOK_UI_UX_ADAPTATION.md
- Frontend shell now prefers the live `/api/modules` catalog and falls back to static module definitions if the API is unavailable.
- Ledger dashboard now includes a compact top status strip for visible customer count, current focus, and selected balance so the operator can orient quickly before editing.

## Operational Notes
- Use `.env` and `.env.example` for runtime configuration.
- Keep crash logs/build artifacts out of git (`.gitignore`).
- Frontend dev server must be launched from the frontend root and verified at `http://127.0.0.1:5173/`; a wrong launch root can still start Vite but return 404 for `/` and `/src/main.tsx`.
- Development mode now uses fast inner-loop execution:
  - Minimize frequent full compile/build/test runs.
  - Use targeted validation at critical boundaries.
  - Reserve full validation for handoff/release gates.
- All agents should maintain context continuity via:
  - docs/AGENT_CONTEXT.md (architecture/domain deltas)
  - docs/AGENT_HANDOFF_LOG.md (package handoffs)
