# Product Roadmap & Development Plan

**Last Updated:** 2026-04-10  
**Coordinated Platform Version:** 1.2.0  
**Status:** Active Development — Platform Hardening + Early Module Groundwork

---

## Executive Summary

HisabKit is a multi-tenant ledger-first SaaS for MSME shop operations. This roadmap defines the complete product development sequence, dependencies, and agent execution workflow for coordinated delivery across Backend (Spring Boot), Frontend (React+Vite), and Mobile (React Native/Expo) platforms.

**Current State:**
- Core ledger CRUD and transaction entry live on all platforms.
- Multi-tenant isolation and role-safe access in place.
- Module catalog infrastructure scaffolded (API stubs + placeholder UI routes).
- Shared protected app shell with module-driven navigation.
- Latest: Ledger dashboard compact status strip for quick operator orientation.

## Repository Reality Check (2026-04-10)

This checkpoint reflects the current codebase state validated by compile/lint/type-check runs.

**Validation Snapshot:**
- Backend (`mvn -q -DskipTests compile`): PASS.
- Frontend (`npm run lint`, `npm run build`): PASS.
- Mobile (`npx tsc --noEmit`): PASS.

**Detected Risks To Resolve Before Feature Expansion:**
- Dirty repository state with many modified/deleted/untracked files; handoff history is likely incomplete.
- Handoff log may not fully represent currently modified modules, especially mobile surfaces.
- Toolchain drift warning in frontend lint: TypeScript 5.9.3 is above the officially supported range for current `@typescript-eslint`.
- Editor diagnostics indicate deprecated TypeScript options in mobile tsconfig (`moduleResolution=node10`, `baseUrl`) that should be migrated before TypeScript 7.

**Immediate Direction:**
- No major new feature starts until repository normalization and handoff reconciliation are complete.
- Every unlogged change package must be reconstructed and documented in `agent-handoff-log.md`.
- Architectural and framework decisions are controlled only by Architect-owned docs, not ad-hoc agent choices.

---

## Product Architecture & Principles

### Multi-Stack Delivery Model

1. **Backend**: Spring Boot service — Auth, Tenancy, Ledger APIs, Persistence
2. **Frontend**: React+Vite web app — Admin, Ledger, Profile, Module placeholders  
3. **Mobile**: React Native (Expo) app — Operator flows, Ledger, Profile

### Core Architectural Commitments

- **Ledger-First Domain**: All flows rooted in append-friendly transaction history with backdated entry support.
- **Strict Tenant Isolation**: Every tenant-scoped table includes `tenant_id`; all queries filtered by tenant context.
- **Shared API Contracts**: Backend owns the source; Frontend/Mobile consume without inventing fields.
- **Docs-First Gates**: No implementation until relevant `api-spec.md` and `db-schema.md` are updated.
- **Shared Versioning**: One coordinated product version (MAJOR.MINOR.PATCH) across all three apps.

### UX Direction

- Task-first layout: Metrics → Actions → Details.
- Persistent module-driven navigation (via `/api/modules` catalog).
- Planned modules visible with status labels; no dead ends.
- Khatabook/OkCredit patterns inform workflow, not copied wholesale.

---

## Release Version Strategy

| Version Line | Purpose | Scope | Example |
|---|---|---|---|
| **1.2.x** (Patch) | Bug fixes, polish, non-breaking improvements | No new workflows or schema changes | Ledger UI polish, performance fixes |
| **1.3.0** (Minor) | Feature expansion, new workflows, backward-compatible schema | New customer-facing capabilities | Reminders module, batch operations, new role types |
| **2.0.0** (Major) | Breaking changes, schema redesign, model shifts | Only when no backward-compatible path exists | Multi-currency, different ledger model |

---

## Product Development Sequence

### Phase 0: Repository Normalization & Handoff Reconciliation (v1.2.0 -> v1.2.1)

**Duration:** Immediate (first 2-3 days)  
**Goal:** Establish a trustworthy baseline by reconciling dirty changes, updating handoff history, and enforcing architecture governance before additional expansion.

#### 0.1 Source Checkup Completion

**Owner:** Architect + Reviewer  
**Version Target:** 1.2.1 (patch)  
**Status:** In Progress

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P0.1.1** | Dirty Worktree Classification | Reviewer | In Progress | None | Classify all modified/deleted/untracked files as valid, stale, or unknown |
| **P0.1.2** | Handoff Gap Reconstruction | Architect | Not Started | P0.1.1 | Add missing handoff entries for all valid unlogged packages |
| **P0.1.3** | Mobile Surface Delta Review | Mobile + Reviewer | Not Started | P0.1.1 | Confirm intent and quality for all modified mobile screens/services/components |
| **P0.1.4** | Build + Diagnostics Baseline Record | Architect | Not Started | P0.1.1 | Record current build/lint/type-check status and known warnings in docs |

#### 0.2 Engineering Governance Lock

**Owner:** Architect  
**Version Target:** 1.2.1 (patch)  
**Status:** In Progress

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P0.2.1** | Architect-Owned Standards Registry | Architect | In Progress | None | `docs/engineering-standards.md` as the only approved source for patterns/frameworks |
| **P0.2.2** | Agent Quality Policy Upgrade | Architect | In Progress | P0.2.1 | Updated playbook gates for SOLID, LLD, design patterns, system design evidence |
| **P0.2.3** | Toolchain Drift Cleanup Plan | Architect + Frontend + Mobile | Not Started | P0.2.1 | Plan to resolve TypeScript/eslint and tsconfig deprecation drift |
| **P0.2.4** | Centralized Config & Secrets Hardening Plan | Architect + Backend + Frontend + Mobile | Not Started | P0.2.1 | Remove legacy hardcoded/fallback sensitive values and enforce env-only runtime configuration policy |

**Exit Criteria (Phase 0):**
- Every dirty file is classified and either accepted, fixed, or explicitly deferred with owner.
- All accepted prior work packages are represented in `agent-handoff-log.md`.
- Architect-owned standards document is active and referenced by roadmap/playbook/development guide.
- No unknown deltas remain before Phase 1 feature work continues.

---

### Phase 1: Platform Stabilization & Early Module Groundwork (v1.2.0 → v1.2.2)

**Duration:** Current → 2 weeks  
**Goal:** Harden core platform, prevent contract drift, establish module framework for future features.

#### 1.1 Core Platform Guardrails (Critical Path)

**Owner:** Platform/Architect Agent  
**Version Target:** 1.2.1 (patch)  
**Status:** In Progress

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P1.1.1** | Contract Drift Prevention Framework | Backend | Not Started | None | Backend validation middleware for request/response contract matching; docs update on enforcement |
| **P1.1.2** | API Spec Versioning & Release Notes Template | Architect | Not Started | None | Versioned api-spec.md with backward-compat matrix; Template for release notes in docs/ |
| **P1.1.3** | Schema Stability Audit | Backend | Not Started | None | Liquibase changeset audit; identify any drift from current db-schema.md |
| **P1.1.4** | Tenant Isolation Boundary Tests | Backend | Not Started | None | Unit + integration test suite for tenant scoping; >95% coverage of tenant-scoped endpoints |
| **P1.1.5** | Frontend Build & Dependency Audit | Frontend | Not Started | None | Dependencies audit report; identify deprecated or conflicting packages; upgrade if safe |

**Acceptance Criteria:**
- ✅ All core APIs match current api-spec.md; no silent drift.
- ✅ Tenant isolation tests pass on all `/api/ledger/**` endpoints.
- ✅ Build pipelines execute cleanly (backend `mvn compile`, frontend `npm run build`).
- ✅ No ambiguous or undocumented fields in request/response payloads.

**Handoff Criteria (to next phase):**
- All acceptance criteria met.
- Test results logged in agent-handoff-log.md.
- Known risks documented for downstream agents.

---

#### 1.2 Ledger Foundation Hardening (Feature Path)

**Owner:** Ledger Domain Agent  
**Version Target:** 1.2.1–1.2.2 (patch)  
**Status:** Blocked until Platform Guardrails pass

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P1.2.1** | Transaction Edit & Delete with Audit Trail | Backend | Not Started | P1.1.4 | APIs: `PUT /api/ledger/transactions/{id}`, `DELETE /api/ledger/transactions/{id}`; audit log entries for mutations |
| **P1.2.2** | Balance Recalculation & Backdated Entry Safety | Backend | Not Started | P1.2.1 | Balance formula validation; endpoint `/api/ledger/customers/{id}/balance-recalc` for backdated entries |
| **P1.2.3** | Attachment Upload & Proof Handling | Backend | Not Started | P1.2.2 | Multipart upload API `POST /api/ledger/attachments`; content streaming `GET /api/ledger/attachments/{id}/content` |
| **P1.2.4** | Transaction Edit UI + Operators | Frontend | Not Started | P1.2.1 | Edit modal in Ledger Dashboard; confirm balance impact alerts |
| **P1.2.5** | Attachment Upload UI Component | Frontend | Not Started | P1.2.3 | File uploader in transaction form; proof preview |
| **P1.2.6** | Balance Display Clarification (Debit/Credit/Net) | Frontend | Not Started | P1.2.2 | Ledger status strip now shows debit/credit breakdown; clear labels for balance type |
| **P1.2.7** | Mobile Ledger Parity: Edit + Attachments | Mobile | Not Started | P1.2.1, P1.2.3 | Edit screen + file picker integration on mobile; maintain transaction history UI |

**Acceptance Criteria:**
- ✅ Edit/delete operations preserve transaction immutability via append-only audit trail.
- ✅ Backdated entries correctly recompute all downstream balances.
- ✅ Attachments stored securely with referential integrity.
- ✅ Frontend and mobile reflect changes in real time.

**Handoff Criteria:**
- All code merged to main with tests passing.
- Release notes appended to docs/RELEASE_NOTES.md.
- Version bumped to 1.2.1 across backend, frontend, mobile.

---

#### 1.3 Module Catalog Framework (Foundation for v1.3+)

**Owner:** Module Architecture Agent  
**Version Target:** 1.2.2 (patch — infrastructure only, no user-facing features)  
**Status:** Blocked until Platform Guardrails pass

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P1.3.1** | Module DTO & Hook System Design | Architect | Not Started | None | Module Hook interface (enable/disable, config); DTO updates in api-spec.md |
| **P1.3.2** | Backend Module Registry Persistence | Backend | Not Started | P1.3.1 | Table: `module_status` (tenant_id, module_code, enabled, config_json); APIs for fetch/update |
| **P1.3.3** | Frontend Module Registry Dynamic Loading | Frontend | Not Started | P1.3.2 | `useModuleRegistry()` hook; fallback to static definitions if API unavailable |
| **P1.3.4** | Mobile Module Navigation Placeholder | Mobile | Not Started | P1.3.3 | Stub screens for Inventory, Suppliers, Lending; disable nav until modules are live |

**Acceptance Criteria:**
- ✅ Backend persists module status per tenant.
- ✅ Frontend fetches and caches module registry; graceful fallback if service unavailable.
- ✅ Mobile screens navigable but hidden from default tab bar.

**Handoff Criteria:**
- Infrastructure verified with stub module payload responses.
- Documentation updated in docs/MODULE_CATALOG.md.
- Version bumped to 1.2.2.

---

### Phase 2: Operator Workflow Optimization (v1.3.0)

**Duration:** Weeks 3–4  
**Goal:** Enhance operator efficiency via search, filters, batch actions, and state management; improve UX clarity.

#### 2.1 Search & Filter Foundation

**Owner:** Ledger UX Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** Platform Guardrails (P1.1) + Ledger Foundation (P1.2)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P2.1.1** | Customer Search API | Backend | Not Started | P1.1.4 | `GET /api/ledger/customers/search?q=name&limit=20`; case-insensitive, tenant-scoped |
| **P2.1.2** | Transaction Filter API | Backend | Not Started | P1.1.4 | `GET /api/ledger/transactions/filter?customerId=X&type=SALE&dateFrom=&dateTo=&limit=50` |
| **P2.1.3** | Search UI Component | Frontend | Not Started | P2.1.1 | Searchable dropdown for customers; live results as operator types |
| **P2.1.4** | Filter Bar & Saved Filters | Frontend | Not Started | P2.1.2 | Filter panel; option to save/reuse filters; clear indication of active filters |
| **P2.1.5** | Mobile Search & Filter Screens | Mobile | Not Started | P2.1.1, P2.1.2 | Simplified search modal + filter options optimized for mobile gestures |

**Acceptance Criteria:**
- ✅ Search returns results in <200ms on production dataset.
- ✅ Filters are tenant-scoped and validated on backend.
- ✅ All three platforms (web, mobile) offer consistent filter syntax.

---

#### 2.2 Empty States, Loading States, and UX Clarity

**Owner:** Frontend UX Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** Platform Guardrails (P1.1)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P2.2.1** | Empty State Templates | Frontend | Not Started | None | Empty ledger, no transactions, no customers screens with clear CTAs |
| **P2.2.2** | Loading Skeleton & Spinners | Frontend | Not Started | None | Consistent skeleton loaders for ledger lists, transaction details |
| **P2.2.3** | Error Boundary & Fallback UI | Frontend | Not Started | None | Global error boundary; user-friendly error messages; retry actions |
| **P2.2.4** | Mobile UX Clarity Pass | Mobile | Not Started | None | Adapt empty/loading states for mobile; ensure readability on small screens |

---

#### 2.3 Batch Operations & Fast Actions

**Owner:** Ledger Feature Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** P2.1 (Search/Filter), Ledger Foundation (P1.2)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P2.3.1** | Bulk Payment Entry API | Backend | Not Started | P2.1.2 | `POST /api/ledger/transactions/bulk`; atomically create multiple transactions |
| **P2.3.2** | Quick Action Buttons (Send Reminder, Export) | Frontend | Not Started | P2.3.1 | Ledger row quick actions; accessible via keyboard + mouse |
| **P2.3.3** | Checkout/Settlement Workflow | Frontend | Not Started | P2.3.1 | Multi-step form for bulk customer payments; preview before submit |

---

### Phase 3: Admin & Tenant Controls (v1.3.0–v1.3.1)

**Duration:** Weeks 4–5  
**Goal:** Empower tenant admins to manage users, roles, and audit; super-admins govern all tenants.

#### 3.1 Role-Based Access Control (RBAC) Reinforcement

**Owner:** Auth/Admin Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** Platform Guardrails (P1.1)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P3.1.1** | RBAC Policy Definition | Architect | Not Started | None | docs/RBAC.md: Role definitions (SUPER_ADMIN, TENANT_ADMIN, OPERATOR, MANAGER); permission matrix |
| **P3.1.2** | Backend Authorization Annotations | Backend | Not Started | P3.1.1 | `@RoleRequired(roles={"TENANT_ADMIN"})` annotation; enforcement middleware, no silent failures |
| **P3.1.3** | Role Discovery Endpoint | Backend | Not Started | P3.1.2 | `GET /api/profile/roles`; returns current user roles + available actions |
| **P3.1.4** | Admin Role Assignment UI | Frontend | Not Started | P3.1.3 | Admin page: manage users, assign/revoke roles, view role matrix |

---

#### 3.2 Audit & Profile Surfaces

**Owner:** Admin UX Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** P3.1 + Ledger Foundation (P1.2)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P3.2.1** | Audit Log API & Pagination | Backend | Not Started | P3.1.2 | `GET /api/admin/audit-logs?limit=100&offset=0`; filters by user, action, date |
| **P3.2.2** | Audit Log Viewer UI | Frontend | Not Started | P3.2.1 | Admin section: sortable, searchable audit log table with action/user/timestamp columns |
| **P3.2.3** | User Profile Update API | Backend | Not Started | P3.1.2 | `PUT /api/profile`; allows tenant admins to edit user info within their tenant |
| **P3.2.4** | Profile Management UI | Frontend | Not Started | P3.2.3 | Profile page: edit name, mobile, avatar; connected to backend |

---

#### 3.3 Tenant Management & Tenant Settings

**Owner:** Tenant Admin Agent  
**Version Target:** 1.3.0 (minor)  
**Dependencies:** P3.1 + Platform Guardrails (P1.1)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P3.3.1** | Tenant Settings Schema | Architect | Not Started | None | db-schema.md: tenant_config table (theme, currency, localization, etc.); api-spec.md: tenant config endpoints |
| **P3.3.2** | Tenant Settings APIs | Backend | Not Started | P3.3.1 | `GET /api/admin/tenant/config`, `PUT /api/admin/tenant/config` (super-admin scoped) |
| **P3.3.3** | Tenant Settings UI | Frontend | Not Started | P3.3.2 | Admin section: business name, currency, timezone, language preferences |

---

### Phase 4: Feature Module Expansion (v1.3.1+)

**Duration:** Weeks 6–10  
**Goal:** Roll out controlled feature modules (Reminders, Reporting, Inventory).

#### 4.1 Reminders Module (First Pilot)

**Owner:** Reminders Feature Agent  
**Version Target:** 1.3.1 (minor)  
**Dependencies:** Module Catalog Framework (P1.3) + Platform Guardrails (P1.1)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P4.1.1** | Reminder Domain Model & Schema | Architect | Not Started | P1.3 | db-schema.md: reminders table; message template table; api-spec.md: reminder DTOs |
| **P4.1.2** | Reminder Scheduling APIs | Backend | Not Started | P4.1.1 | `POST /api/modules/reminders/schedules`, `GET /api/modules/reminders/templates` (tenant-scoped) |
| **P4.1.3** | Template Variable Validation | Backend | Not Started | P4.1.2 | Validate `{{customerName}}`, `{{balance}}`, `{{businessName}}` in templates; no injection attacks |
| **P4.1.4** | Reminder UI: Template & Schedule Editor | Frontend | Not Started | P4.1.2 | Reminder module page: create/edit templates, set send schedule |
| **P4.1.5** | SMS/WhatsApp Gateway Integration (Stub) | Backend | Not Started | P4.1.2 | Placeholder for SMS/WhatsApp provider (Twilio/Gupshup); no live sends yet in v1.3.1 |

**Acceptance Criteria:**
- ✅ Templates store safely with validated variables.
- ✅ Scheduled reminders persist with tenant isolation.
- ✅ Frontend allows operators to create/edit templates.

---

#### 4.2 Reporting Module (Basic Export)

**Owner:** Reporting Feature Agent  
**Version Target:** 1.3.1 (minor)  
**Dependencies:** Module Catalog Framework (P1.3) + Search/Filter (P2.1)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P4.2.1** | Ledger Report Schema | Architect | Not Started | P2.1 | api-spec.md: Report DTOs (date range, customer filter, balance summary) |
| **P4.2.2** | Ledger Report APIs (CSV Export) | Backend | Not Started | P4.2.1 | `GET /api/modules/reports/ledger?format=csv&dateFrom=&dateTo=` (tenant-scoped); stream CSV |
| **P4.2.3** | Report Generation UI | Frontend | Not Started | P4.2.2 | Reporting module page: select date range, customer filter; download CSV/PDF |
| **P4.2.4** | Mobile Report Access (Stub) | Mobile | Not Started | P4.2.2 | Placeholder for report access on mobile; may be web-only initially |

---

#### 4.3 Inventory Module (Skeleton)

**Owner:** Inventory Feature Agent  
**Version Target:** 1.3.2+ (minor, deferred)  
**Dependencies:** Module Catalog Framework (P1.3)

**Tasks (Deferred to v1.3.2):**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P4.3.1** | Inventory Domain Model (Architect Design Doc) | Architect | Backlog | P1.3 | docs/INVENTORY_MODULE_DESIGN.md; product requirement, schema outline, API contract stub |
| **P4.3.2** | Stock Ledger Persistence Layer | Backend | Backlog | P4.3.1 | Schema migration; stock tracking APIs (create, update, balance) |
| **P4.3.3** | Inventory Dashboard UI | Frontend | Backlog | P4.3.2 | Inventory module page with product list, stock levels; no transactions yet |

---

### Phase 5: Quality & Release Gates (Continuous)

**Duration:** Ongoing per release  
**Goal:** Maintain contract integrity, prevent regressions, enable confident releases.

#### 5.1 Quality Assurance & Testing Framework

**Owner:** QA/Test Agent  
**Version Target:** Every release (1.2.x+)  
**Dependencies:** None (parallel to feature work)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P5.1.1** | Unit Test Coverage Baseline (>70%) | Backend | Not Started | None | Test suite for all core services; coverage report uploaded to CI/CD |
| **P5.1.2** | Integration Test Suite (API Contracts) | Backend | Not Started | None | Contract tests against api-spec.md; validate request/response shapes |
| **P5.1.3** | E2E Smoke Tests (Happy Path) | Frontend + Backend | Not Started | None | Automated tests: Login → Create Customer → Add Transaction → View Ledger |
| **P5.1.4** | Mobile Device Testing Matrix | Mobile | Not Started | None | Test on Android 11+, iOS 13+; document known issues |
| **P5.1.5** | Tenant Isolation Security Tests | Backend + QA | Not Started | None | Cross-tenant access attempts; all should fail with 403 Forbidden |

---

#### 5.2 Release & Rollback Readiness

**Owner:** Release Agent  
**Version Target:** Every release  
**Dependencies:** P5.1 (Quality gates)

**Tasks:**

| Task ID | Title | Owner | Status | Dependencies | Deliverables |
|---|---|---|---|---|---|
| **P5.2.1** | Release Notes Template & Process | Release | Not Started | None | docs/RELEASE_NOTES.md: what changed, known issues, upgrade instructions |
| **P5.2.2** | Synchronized Version Bumping | Release | Not Started | None | Script to bump version across backend `pom.xml`, frontend `package.json`, mobile `package.json` |
| **P5.2.3** | Docker Compose Multi-Stage Build | DevOps | Not Started | None | Dockerfile updates for backend (slim JRE), frontend (Nginx), mobile (optional); size optimization |
| **P5.2.4** | Rollback & Data Migration Runbooks | Release | Not Started | None | docs/ROLLBACK.md: safe procedures for database, API, UI rollbacks |

---

## Parallel Execution Model

### Execution Rules

1. **Architect leads**: Defines contracts/schema before Backend and Frontend start.
2. **Backend implements**: Implements APIs, persistence, and validation.
3. **Frontend consumes**: Builds UI on confirmed contract; does not invent fields.
4. **Mobile mirrors**: Implements same contract for critical paths.
5. **Reviewer validates**: Ensures no drift, maintainability, security.

### Phase 1 Parallel Dependencies Chart

```
┌─────────────────────────────────────────────────────────────┐
│                Platform Stabilization (Phase 1)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [P1.1] Platform Guardrails ◄── CRITICAL PATH                │
│  ├─ P1.1.1: Contract Drift (Backend)                         │
│  ├─ P1.1.2: API Spec Versioning (Architect)                  │
│  ├─ P1.1.3: Schema Audit (Backend)                           │
│  ├─ P1.1.4: Tenant Tests (Backend)                           │
│  └─ P1.1.5: Dependency Audit (Frontend)                      │
│     ↓                                                         │
│  [P1.2] Ledger Foundation (AFTER P1.1 passes) ◄── Feature    │
│  ├─ P1.2.1: Edit/Delete APIs (Backend)                       │
│  ├─ P1.2.2: Balance Recalc (Backend)                         │
│  ├─ P1.2.3: Attachments (Backend)                            │
│  ├─ P1.2.4: Edit UI (Frontend)                               │
│  ├─ P1.2.5: Upload UI (Frontend)                             │
│  ├─ P1.2.6: Balance Clarity (Frontend)                       │
│  └─ P1.2.7: Mobile Parity (Mobile)                           │
│     ↓                                                         │
│  [P1.3] Module Catalog (AFTER P1.1 passes) ◄── Infrastructure│
│  ├─ P1.3.1: Hook Design (Architect)                          │
│  ├─ P1.3.2: Backend Registry (Backend)                       │
│  ├─ P1.3.3: Frontend Loading (Frontend)                      │
│  └─ P1.3.4: Mobile Navigation (Mobile)                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Handoff Workflow

Each agent uses this order when complete:

1. **Pre-Handoff Validation:**
   - Feature scope matches task description.
   - Docs (api-spec.md, db-schema.md) updated.
   - Tests passing (compile, lint, unit tests).
   - No known regressions logged.

2. **Handoff Entry Template:**

```markdown
- Date: YYYY-MM-DD
- From Agent: [Role]
- To Agent: [Next Role]
- Scope Completed: [Task IDs + brief summary]
- Files Changed: [List changed files/modules]
- Validation Run: [Test command + results]
- Known Risks: [List any known issues or blockers for next agent]
- Next Action: [Explicit next task for downstream agent]
```

3. **Post-Handoff:**
   - Update agent-handoff-log.md immediately after merge.
   - Update version in backend, frontend, mobile (if customer-facing).
   - Tag release if feature is complete for version target.

---

## Platform Vocabulary & Definitions

| Term | Definition |
|---|---|
| **Tenant** | Organization/shop account; isolates data and user roles |
| **tenant_id** | Unique identifier scoped to tenant; on every tenant-scoped table |
| **SUPER_ADMIN** | Cross-tenant admin; can manage all tenants and users (backend only) |
| **TENANT_ADMIN** | Tenant-specific admin; can manage users and settings within their tenant |
| **OPERATOR** | Standard ledger user; can create/edit transactions within their tenant |
| **Contract** | API request/response shape; governs by api-spec.md |
| **Schema** | Database table structure; governed by db-schema.md and Liquibase migrations |
| **Live Feature** | Merged to main, versioned, docs updated, tested, and tagged as release |
| **Handoff** | Feature complete in current role; documented in agent-handoff-log.md; ready for next role |

---

## Documentation Governance Rules

### docs-first Workflow

- **Before any implementation**, update the relevant documentation:
  - New API? Update `api-spec.md` with endpoint, request/response shapes, auth rules.
  - New table or field? Update `db-schema.md` with migration and tenant scoping.
  - New workflow or permission? Update `agent-context.md` with domain delta.
  - New validation or error? Update error contract in `api-spec.md`.

### Docs Maintenance

- Keep `docs/README.md` as the entrypoint for new agents.
- Keep `docs/RELEASE_NOTES.md` updated per release.
- Archive time-bound or historical docs to `docs/archive/`.
- Update `docs/roadmap.md` (this file) when tasks complete; move to "Completed" section below.

---

## Completed Work (v1.1 → v1.2.0)

**Baseline Platform (as of 2026-04-10):**

| Date | Scope | Status |
|---|---|---|
| 2026-04-08 | Repo Governance Architecture | ✅ Completed |
| 2026-04-08 | Shared Protected App Shell | ✅ Completed |
| 2026-04-08 | Module Catalog API Stubs | ✅ Completed |
| 2026-04-08 | Module Registry Dynamic Loading (Frontend) | ✅ Completed |
| 2026-04-08 | Ledger Dashboard Status Strip | ✅ Completed |

**See `docs/agent-handoff-log.md` for full history.**

---

## Next Immediate Actions (Week 1)

### For Architect Agent:
- [ ] Complete Phase 0 triage and classify all dirty files by intent and risk.
- [ ] Approve and publish architect-owned engineering standards in docs.
- [ ] Reconcile missing handoff entries before assigning net-new feature work.

### For Backend Agent:
- [ ] Support P0.1.1 file classification for backend-related deltas.
- [ ] Start P1.1.1 contract drift enforcement middleware design after Phase 0 exit.
- [ ] Implement P0.2.4 backend config hardening (remove sensitive fallback defaults).

### For Frontend Agent:
- [ ] Execute P0.2.3 toolchain drift plan for eslint/typescript compatibility.
- [ ] Begin P1.1.5 dependency audit only after Phase 0 exit criteria is met.
- [ ] Run centralized env sweep to ensure all URLs/flags come through `src/config/env.ts`.

### For Mobile Agent:
- [ ] Complete P0.1.3 mobile surface delta review and reconciliation.
- [ ] Prepare tsconfig deprecation migration proposal for architect review.
- [ ] Run centralized env sweep to ensure endpoint/provider IDs come through `src/config/env.ts`.

### For QA/Reviewer Agent:
- [ ] Lead P0.1.1 dirty worktree classification and reconciliation report.
- [ ] Validate handoff log completeness against changed file inventory.

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Platform Guardrails delay Phase 1 completion | Cascading delay to P1.2 and P1.3 | Run P1.1 in parallel across all subsystems; prioritize P1.1.4 (tenant tests) first |
| Contract drift between Frontend and Backend | Silent bugs, user-facing errors | Enforce pre-implementation docs updates; add CI/CD contract validation checks |
| Tenant isolation regression from new features | Data leak, security breach | Dedicated test suite (P5.1.5); review all tenant_id filters in new endpoints before merge |
| Mobile platform falls behind Web in features | User frustration, platform fragmentation | Define mobile parity criteria per feature; phase mobile work after backend/frontend complete |
| Release versioning inconsistency across apps | Deployment confusion, support burden | Automated version sync script (P5.2.2); include in CI/CD pipeline |

---

## Success Metrics

At end of Phase 1 (v1.2.2):
- ✅ Zero known contract drift issues.
- ✅ >95% tenant isolation test coverage passing.
- ✅ Core ledger workflows (edit, delete, backdated entry, attachments) live on all platforms.
- ✅ Module catalog plumbing ready for first module (Reminders) in Phase 4.
- ✅ All handoffs documented in agent-handoff-log.md with no ambiguity.

At end of Phase 2 (v1.3.0):
- ✅ Search and filter across all platforms.
- ✅ Operator UX clarity (empty/loading/error states).
- ✅ Batch operations for fast payment entry.
- ✅ RBAC + Audit surfaces live for tenant admins.

At end of Phase 4 (v1.3.1+):
- ✅ Reminders module live with template editing.
- ✅ Basic reporting (CSV/PDF export).
- ✅ Total user-facing features: 15+; feature parity 85%+ across web/mobile.

---

## How Agents Use This Roadmap

1. **Intake**: Agent assigned to a task reads the corresponding Phase + Task section.
2. **Scope Confirmation**: Agent clarifies dependencies, accepts entry criteria, confirms version target.
3. **Implementation**: Agent follows the task checklist; documents any deviations.
4. **Handoff**: Agent updates agent-handoff-log.md; marks task as complete; identifies next task.
5. **Archival**: Completed task moved to historical record or retired from active roadmap.

---

**This is a living document. Update it after each phase completes or when scope changes. Last update: 2026-04-10.**
