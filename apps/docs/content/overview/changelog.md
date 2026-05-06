# Changelog

**Owner:** Engineering Team | **Format:** Most recent first

This is the single rolling record of all changes across the HisabKit platform — features, fixes, refactors, and configuration changes — with the quality gates applied to each. Use this to understand what's been done, why, and whether it met the quality bar.

---

## How to Add a Changelog Entry

Copy this template and fill it in when merging any change:

```md
## [YYYY-MM-DD] — Short Title

**Type:** Feature | Fix | Refactor | Config | Docs  
**Area:** Backend | Web | Mobile | Docs | Infra  
**Phase:** Phase 1 | Phase 2 | Phase 3 | ...

### What Changed
- Bullet list of concrete changes

### Why
One or two sentences on the motivation.

### Quality Gates
- [x] Typecheck
- [x] Lint (Biome / ESLint / Checkstyle)
- [ ] Tests
- [x] Build
- [ ] Smoke test
```

---

## [2026-05-02] — Docs Accuracy Audit & Deep Fix

**Type:** Docs | **Area:** Docs | **Phase:** Ongoing

### What Changed
- Fixed backend port throughout all docs: `8080` → `8010` (actual configured port)
- Fixed database model: was incorrectly documented as PostgreSQL; actual is **H2 (dev)** / **MariaDB (prod)**
- Fixed backend package names: `modules.auth` → `modules.identity`, `modules.admin` → `modules.tenant`; added missing `core/` layer (`config`, `exception`, `security`)
- Added `lending` module to capability map and architecture — was missing from all docs
- Rewrote `api-reference/auth.md` to include complete **Profile API** (`/api/profile`) which was entirely undocumented
- Fixed all ledger API endpoint paths: transactions are at `/api/ledger/customers/{id}/transactions`, attachments at `/api/ledger/transactions/{id}/attachments` and `/api/ledger/attachments/{id}/content`
- Fixed analytics API: uses `X-Tenant-Id` header (lowercase d), paths are `/api/analytics/portfolio-kpis`, `/api/analytics/portfolio-distribution`, `/api/analytics/export-portfolio`, `/api/analytics/export-audit`
- Fixed admin API: response is a plain array (not paginated), includes full cross-tenant CRUD for customers and transactions with `tenantId` as query param
- Fixed bootstrap credentials: username `admin` / password `password123` (not `admin@hisabkit.com`)
- Fixed quickstart: no Docker/PostgreSQL needed for dev (H2 is embedded), added H2 console URL
- Updated project structure with correct `layout/` folder, all web modules including `customers`, correct web dependencies (Tailwind v4, RRD v6, ExcelJS, JSZip, Recharts, Framer Motion, i18next)

### Why
Deep audit of actual source code vs. documentation revealed multiple factual errors in port numbers, database technology, package names, API endpoint paths, and missing APIs. All docs must reflect reality, not assumptions.

### Quality Gates
- [x] All file paths verified against actual filesystem
- [x] All API endpoints verified against actual Java controllers
- [x] All module names verified against `moduleRegistry.ts`
- [x] All env variables verified against `application.yml`
- [x] Docs app continues to build

---

## [2026-04-26] — Customers & CRM Module

**Type:** Feature | **Area:** Web | **Phase:** Phase 2

### What Changed
- Added `CustomersPage` to the web app with bulk actions, search, filter, Excel import/export (with ZIP for transaction attachments)
- Registered `customers` module in `moduleRegistry.ts` and sidebar navigation
- Added `/customers` route to the app router with lazy loading
- Backend already has `/api/ledger/customers` endpoints used by this module

### Why
The Customers module provides CRM-level management on top of the ledger-first data model, enabling bulk operations and data portability via Excel/ZIP exports.

### Quality Gates
- [x] Typecheck
- [x] Lint (Biome)
- [ ] Unit tests (pending)
- [x] Build

---

## [2026-04-26] — Docs Full Refactor

**Type:** Docs | **Area:** Docs | **Phase:** Ongoing

### What Changed
- Restructured entire docs content tree: `foundation/` → `overview/`, `engineering/` → `standards/`, `governance/` → `decisions/`
- Created `getting-started/` section with Quickstart, Project Structure, Environments
- Created `api-reference/` with full endpoint docs split by domain
- Created `delivery/quality-gates.md` as an explicit per-change-type checklist
- Added this `changelog.md` as the living change tracking document
- Removed duplication across all engineering standards files
- Fixed broken nav links in old `index.md`

### Why
Old docs had broken links, content duplication, no onboarding path, and no change tracking. The goal is a single source of truth readable in minutes.

### Quality Gates
- [x] All nav links verified
- [x] No duplicate content
- [x] Docs app continues to build

---

## [2026-04-25] — Tenant Deletion Fix (Cascade Cleanup)

**Type:** Fix | **Area:** Backend | **Phase:** Phase 1

### What Changed
- Fixed 500 error when deleting tenants from the Admin Console
- Backend now performs full hierarchical cascade deletion: audit logs → transactions → customers → tenant record
- Ensures no foreign key constraint violations during tenant deletion

### Why
Tenant deletion was failing with a 500 Internal Server Error due to foreign key constraint violations. The backend needed explicit ordered cleanup before removing the primary tenant record.

### Quality Gates
- [x] Typecheck (Java Checkstyle)
- [x] Build (Maven)
- [x] Manual smoke test — tenant deletion verified end-to-end

---

## [2026-04-25] — System Stability Pass

**Type:** Fix | **Area:** Backend, Web, Mobile | **Phase:** Phase 1

### What Changed
- Fixed `useCallback` ReferenceError in admin dashboard
- Resolved `TypeError` during static path generation in docs app
- Corrected API endpoint paths in web analytics service to match `/api/v1` prefix
- Enabled Inventory and Suppliers modules in web sidebar
- Verified system integrity across all services

### Why
Multiple runtime errors were blocking the development environment from running cleanly. This was a systematic stability pass.

### Quality Gates
- [x] Typecheck (web + mobile)
- [x] Lint (Biome)
- [x] Build (all apps)
- [x] Manual verification of all three services running

---

## [2026-04-25] — Brand Identity & Logo System

**Type:** Feature | **Area:** Web, Mobile | **Phase:** Phase 3

### What Changed
- Created professional SVG logo for HisabKit (vector-based, mathematically precise)
- Created mobile app icon in Expo-compatible format
- Created favicon for web dashboard
- All assets maintain fintech-grade premium aesthetic

### Why
A cohesive brand identity was missing. Assets needed to be consistent across web dashboard, mobile app, and favicon.

### Quality Gates
- [x] SVG renders correctly at all sizes
- [x] Mobile icon verified in Expo
- [x] Web favicon verified in browser

---

## [2026-04-20] — Backend Quality Hardening

**Type:** Refactor | **Area:** Backend | **Phase:** Phase 1

### What Changed
- `AdminController` decoupled from repositories — all access now goes through service layer
- `AuditService` created for centralized event logging — all ledger mutations delegate to it
- `GlobalExceptionHandler` expanded for consistent business/resource error contracts
- ArchUnit implemented and enforced to prevent cross-module violations and direct controller→repository access

### Why
Backend was violating layering rules — controllers calling repositories directly, audit logging scattered across services. ArchUnit makes these violations build failures.

### Quality Gates
- [x] ArchUnit tests pass (enforced in CI)
- [x] All existing tests pass
- [x] Build

---

## [2026-04-20] — Frontend Modular Monolith Migration

**Type:** Refactor | **Area:** Web | **Phase:** Phase 2

### What Changed
- App routing now lazy-loads all module entry pages
- Dashboard, Ledger, Admin, Profile, Settings moved into proper `src/modules/` boundaries
- `useDashboardHomeState`, `useLedgerPageState`, `useAdminDashboardState`, `useProfilePageState` created as module-owned behavior hooks
- Frontend API client modularized: API calls moved from `shared/api/client.ts` to module-owned services (Auth, Admin, Ledger, Profile)
- Settings page tabs now use responsive multi-breakpoint grid

### Why
The web app was growing through page-level sprawl. This migration created proper module ownership, clear data flow boundaries, and testable behavior hooks.

### Quality Gates
- [x] Typecheck (100% compliance verified)
- [x] Lint (Biome)
- [x] Build

---

## [2026-04-20] — Analytics Intelligence Hub

**Type:** Feature | **Area:** Web, Backend | **Phase:** Phase 4

### What Changed
- Reports module transformed into "Intelligence Hub" with high-density analytics layout
- Server-side CSV exports implemented
- Dedicated backend Analytics module with aging analysis logic
- New aging analysis endpoints and portfolio exposure metrics

### Why
The previous reports view was minimal and not useful for business operators. The Intelligence Hub provides actionable financial intelligence.

### Quality Gates
- [x] Typecheck
- [x] Build
- [x] Manual UX verification

---

## Status Summary

| Platform | Overall Health | Weakest Area |
|---|---|---|
| Backend | 🟡 Amber | Test coverage below target |
| Web | 🟡 Amber | Large module pages still need decomposition |
| Mobile | 🟡 Amber | Module structure alignment incomplete |
| Docs | 🟢 Green | Newly restructured |
| CI/CD | 🔴 Red | No formal pipeline yet |
| Observability | 🔴 Red | Not production-grade |
