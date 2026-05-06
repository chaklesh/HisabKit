# System Architecture

**Last Updated:** 2026-05-02 | **Owner:** Architecture

---

## Platform Overview

HisabKit is a three-application platform with shared domain rules:

```
┌─────────────────────────────────────────────────────────┐
│                    HisabKit Platform                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Web App   │  │ Mobile App  │  │    Docs App     │ │
│  │ (Vite/React)│  │(Expo/RN)    │  │(Next.js/Nextra) │ │
│  │  Port 5173  │  │  Port 8081  │  │   Port 3001     │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────┘ │
│         │                │                               │
│         └────────┬───────┘                               │
│                  │  REST API (JSON + JWT)                 │
│                  │  Base URL: /api                        │
│         ┌────────▼───────┐                               │
│         │   Backend API  │                               │
│         │  (Spring Boot) │                               │
│         │   Port 8010    │  ← not 8080                   │
│         └────────┬───────┘                               │
│                  │                                        │
│         ┌────────▼──────────────────┐                    │
│         │ H2 (dev) / MariaDB (prod) │                    │
│         │   Schema-managed by       │                    │
│         │       Liquibase           │                    │
│         └───────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

| App | Package Name | Tech | Default Port |
|---|---|---|---|
| Backend API | `@hisabkit/api` | Spring Boot 3, Java 21, H2 (dev) / MariaDB (prod), Liquibase | **8010** |
| Web Dashboard | `@hisabkit/web` | Vite 5, React 18, TypeScript, TanStack Query, shadcn/ui, Tailwind v4 | 5173 |
| Mobile App | `@hisabkit/mobile` | Expo 52, React Native, TypeScript | 8081 |
| Docs | `@hisabkit/docs` | Next.js 16, Nextra 4 | 3001 |

---

## Architecture Strategy: Modular Monolith

HisabKit uses a **modular monolith** strategy — not microservices.

**Why modular monolith:**
- Simpler deployment and debugging
- Lower operational overhead
- Stronger internal boundaries than page-led growth
- Avoids premature distributed-system complexity

Each app has clear internal layers. Modules interact only through public service interfaces or shared models — never through private internals.

---

## Backend Internal Structure

```
apps/api/src/main/java/com/nayag/hisabkit/
├── HisabkitBackendApplication.java
├── core/                       ← Cross-cutting platform infrastructure
│   ├── config/                 ← Spring config, tenant filter, CORS
│   ├── exception/              ← GlobalExceptionHandler, error DTOs
│   └── security/               ← JWT filter, SecurityUtils, Roles
└── modules/
    ├── identity/               ← Auth, login, registration, profile
    │   ├── controller/         ← AuthController, ProfileController
    │   ├── service/            ← IdentityService, GoogleSocialAuthService
    │   ├── model/              ← User
    │   ├── dto/
    │   └── repository/
    ├── tenant/                 ← Tenant lifecycle, admin operations
    │   ├── controller/         ← AdminController
    │   ├── service/            ← TenantService
    │   ├── model/              ← Tenant
    │   ├── dto/
    │   └── repository/
    ├── ledger/                 ← Customer ledger, transactions, balances
    │   ├── controller/         ← LedgerController
    │   ├── service/            ← LedgerService
    │   ├── model/              ← Customer, Transaction
    │   ├── dto/
    │   └── repository/
    ├── analytics/              ← Portfolio KPIs, aging, CSV exports
    │   ├── controller/         ← AnalyticsController
    │   ├── service/            ← AnalyticsService
    │   └── dto/
    ├── storage/                ← File attachments
    │   ├── service/            ← AttachmentStorageService
    │   └── model/              ← Attachment
    ├── audit/                  ← Centralized audit logging
    │   └── service/            ← AuditService
    └── catalog/                ← Module feature catalog/registry
        ├── controller/         ← ModuleCatalogController
        └── service/            ← ApplicationModuleCatalogService
```

**Layer rules:**
- `controller` — HTTP mapping, input validation, delegation only
- `service` — Business logic, transactional boundaries, orchestration
- `repository` — Database access only; no business decisions
- `model` — JPA entities; never exposed directly to API consumers (use DTOs)
- `core/` — Never business logic; only cross-cutting platform concerns

---

## Web App Internal Structure

```
apps/web/src/
├── app/                    ← Bootstrap (AppRouter, AppProviders, ThemeProvider, AppRoot)
├── layout/                 ← ProtectedAppLayout (shell, sidebar, header)
├── modules/
│   ├── auth/               ← LandingPage, LoginPage, AuthContext
│   ├── dashboard/          ← DashboardHomePage, useDashboardHomeState
│   ├── ledger/             ← LedgerPage, useLedgerPageState
│   ├── customers/          ← CustomersPage (CRM, import/export, bulk ops)
│   ├── analytics/          ← ReportsPage (Intelligence Hub, aging, BI)
│   ├── settings/           ← SettingsPage (theme, business profile, preferences)
│   ├── admin/              ← AdminDashboard, useAdminDashboardState
│   └── profile/            ← ProfilePage, useProfilePageState
├── shared/
│   ├── api/                ← Axios-based API client + per-module services
│   ├── components/         ← Shared UI: ProtectedRoute, PageLoader, ModuleComingSoonPage
│   ├── context/            ← AuthContext
│   ├── config/             ← env config
│   └── types/              ← Shared TypeScript types
└── i18n/                   ← react-i18next translations
```

**Route map:**

| Route | Module | Roles |
|---|---|---|
| `/` | auth/LandingPage | Public |
| `/login` | auth/LoginPage | Public |
| `/dashboard` | dashboard/DashboardHomePage | Any authenticated |
| `/customers` | customers/CustomersPage | Any authenticated |
| `/ledger` | ledger/LedgerPage | Any authenticated |
| `/analytics` | analytics/ReportsPage | Any authenticated |
| `/settings` | settings/SettingsPage | Any authenticated |
| `/profile` | profile/ProfilePage | Any authenticated |
| `/admin` | admin/AdminDashboard | `SUPER_ADMIN` only |
| `/inventory` | ModuleComingSoonPage | Any authenticated |
| `/suppliers` | ModuleComingSoonPage | Any authenticated |
| `/lending` | ModuleComingSoonPage | Any authenticated |

---

## Mobile App Internal Structure

```
apps/mobile/src/
├── app/                    ← Navigation, providers, layout
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── ledger/
│   └── settings/
└── shared/
    ├── api/                ← API client (same backend as web, same contracts)
    ├── theme/              ← Centralized theme tokens
    └── components/         ← Shared React Native primitives
```

---

## Database Strategy

| Environment | Database | Notes |
|---|---|---|
| **dev** (default) | H2 embedded file-based | Zero setup; DB file at `apps/api/data/` |
| **prod** | MariaDB | Managed; Oracle Cloud / HestiaCP in current deployment |

Schema is managed exclusively by **Liquibase** migrations in `apps/api/src/main/resources/db/changelog/`.

---

## Multi-Tenancy Model

- **Shared schema, tenant-scoped data.** Every tenant-scoped table contains `tenant_id`.
- **Every request** is validated against the `X-TenantID` header via a Spring Security filter.
- **Cross-tenant operations** require explicit `SUPER_ADMIN` privilege — never implicit.
- **Audit records** are mandatory for all privileged or financially sensitive mutations via `AuditService`.

---

## Module Vocabulary

All three platforms must use consistent module names:

| Module ID | Label | Status | Route |
|---|---|---|---|
| `dashboard` | Dashboard | ✅ Live | `/dashboard` |
| `customers` | CRM | ✅ Live | `/customers` |
| `ledger` | Customer Ledger | ✅ Live | `/ledger` |
| `analytics` | Portfolio Analytics | ✅ Live | `/analytics` |
| `inventory` | Inventory Management | 🔜 Planned | `/inventory` |
| `suppliers` | Supplier Management | 🔜 Planned | `/suppliers` |
| `lending` | Money Lending | 🔜 Planned | `/lending` |

---

## Architecture Anti-Patterns (Avoid)

- Controllers calling repositories directly (bypassing service layer — ArchUnit enforces this)
- Giant page components containing business logic, queries, and modals inline
- Browser local storage as the only source of truth for financial data
- Client-side domain models drifting from backend API contracts
- Uncontrolled library addition without architectural reason
- Cross-module imports of private internals
