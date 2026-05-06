# Project Structure

**Last Updated:** 2026-05-02

HisabKit is a **Turborepo monorepo** containing all platform applications and shared packages in one repository.

---

## Root Layout

```
hisabkit5/
├── apps/                   ← Deployable applications
│   ├── api/                ← Backend (Spring Boot)
│   ├── web/                ← Web Dashboard (Vite + React)
│   ├── mobile/             ← Mobile App (Expo + React Native)
│   └── docs/               ← This documentation site (Next.js + Nextra)
├── packages/               ← Shared code used across apps
│   ├── api/                ← Shared API type definitions
│   ├── features/           ← Shared business feature logic
│   ├── lib/                ← Shared utility libraries
│   ├── types/              ← Shared TypeScript types
│   └── ui/                 ← Shared React component library (used by web + mobile)
├── agents/                 ← AI agent rules and context files
├── .github/                ← GitHub Actions CI workflows
├── .husky/                 ← Git hooks (pre-commit quality gates)
├── turbo.json              ← Turborepo pipeline configuration
├── biome.json              ← Biome linting/formatting config (web + mobile + docs)
├── package.json            ← Root workspace definition
└── docker-compose.yml      ← Optional: external DB for dev overrides
```

---

## apps/api — Backend

```
apps/api/
├── src/main/java/com/nayag/hisabkit/
│   ├── HisabkitBackendApplication.java
│   ├── core/
│   │   ├── config/         ← Spring config, TenantContext, CORS, Hibernate
│   │   ├── exception/      ← GlobalExceptionHandler, error response DTOs
│   │   └── security/       ← JWT filter, SecurityUtils, Roles constants
│   └── modules/
│       ├── identity/       ← Auth, login, register, profile, user management
│       ├── tenant/         ← Tenant lifecycle, admin CRUD operations
│       ├── ledger/         ← Customer ledger, transactions, balances, attachments
│       ├── analytics/      ← Portfolio KPIs, distribution, CSV exports
│       ├── storage/        ← File attachment service (local disk; prod: adapter)
│       ├── audit/          ← AuditService — centralized mutation logging
│       └── catalog/        ← Module feature catalog (what modules are enabled)
├── src/main/resources/
│   ├── db/changelog/       ← Liquibase migration files (source of schema truth)
│   └── application.yml     ← Spring config (H2 dev profile / MariaDB prod profile)
├── data/                   ← H2 file-based DB (dev only; gitignored)
├── uploads/                ← File attachments (dev; gitignored)
├── pom.xml                 ← Maven build
└── Dockerfile              ← Production container image
```

**Key facts:**
- Java 21, Spring Boot 3, Lombok
- H2 embedded (dev) / MariaDB (prod) via Liquibase
- Runs on port **8010** (configurable via `SERVER_PORT`)
- JWT-based stateless auth, multi-tenancy via `X-TenantID` header
- ArchUnit enforces layer boundary rules (controllers cannot call repositories)

---

## apps/web — Web Dashboard

```
apps/web/
├── src/
│   ├── app/                ← AppRouter, AppProviders, ThemeProvider, AppRoot
│   ├── layout/             ← ProtectedAppLayout (sidebar, header, shell)
│   ├── modules/
│   │   ├── auth/           ← LandingPage, LoginPage, session management
│   │   ├── dashboard/      ← DashboardHomePage, useDashboardHomeState
│   │   ├── ledger/         ← LedgerPage, useLedgerPageState
│   │   ├── customers/      ← CustomersPage (CRM, bulk ops, Excel import/export)
│   │   ├── analytics/      ← ReportsPage (Intelligence Hub, aging analysis)
│   │   ├── settings/       ← SettingsPage (business profile, theme, preferences)
│   │   ├── admin/          ← AdminDashboard, useAdminDashboardState
│   │   └── profile/        ← ProfilePage, useProfilePageState
│   ├── shared/
│   │   ├── api/            ← Axios-based API client + per-module service files
│   │   ├── components/     ← ProtectedRoute, PageLoader, ModuleComingSoonPage, GoogleOneTapAuth
│   │   ├── context/        ← AuthContext
│   │   └── config/         ← env.ts (typed env variables)
│   └── i18n/               ← react-i18next translation files
├── index.css               ← Tailwind v4, HSL design tokens, dark/light mode
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts    ← E2E test config
└── Dockerfile
```

**Key dependencies:**
- Vite 5, React 18, TypeScript, React Router DOM v6
- TanStack Query v5 (server state)
- React Hook Form v7 + Zod v4 (forms and validation)
- shadcn/ui + Radix UI (accessible primitives)
- Tailwind v4 (utility CSS via PostCSS)
- Recharts (charts and analytics)
- ExcelJS + JSZip (Excel import/export with attachments)
- Framer Motion (animations)
- i18next + react-i18next (internationalisation)
- Biome (lint + format)
- Vitest + React Testing Library (unit/component tests)
- Playwright (E2E tests)

---

## apps/mobile — Mobile App

```
apps/mobile/src/
├── app/                    ← Expo Router navigation, providers
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── ledger/
│   └── settings/
└── shared/
    ├── api/                ← Same backend API contracts as web
    ├── theme/              ← Centralized design tokens
    └── components/         ← Shared React Native primitives
```

**Key facts:**
- Expo 52, React Native, TypeScript
- Expo Router (file-based navigation)
- Same backend API — no separate mobile backend

---

## apps/docs — Documentation

```
apps/docs/
├── content/                ← All documentation pages (Markdown / MDX)
│   ├── _meta.json          ← Top-level nav order
│   ├── index.mdx           ← Root landing page
│   ├── overview/           ← What is HisabKit, Architecture, Changelog
│   ├── getting-started/    ← Quickstart, Project Structure, Environments
│   ├── standards/          ← All engineering standards
│   ├── api-reference/      ← Full API endpoint documentation
│   ├── delivery/           ← Operating model, quality gates, roadmap, release ops
│   ├── decisions/          ← ADR register
│   └── archive/            ← Legacy / superseded material (not in nav)
├── app/                    ← Next.js App Router
└── next.config.js          ← Nextra + basePath: /docs
```

**Key facts:**
- Next.js 16, Nextra 4, React 19
- Served at `http://localhost:3001/docs` (basePath: `/docs`)
- Content is plain Markdown/MDX — no framework knowledge needed to edit

---

## packages/ — Shared Libraries

| Package | Purpose | Consumers |
|---|---|---|
| `packages/api` | Shared API type definitions and utilities | web, mobile |
| `packages/features` | Shared business feature logic | web, mobile |
| `packages/lib` | Shared utility functions | all apps |
| `packages/types` | Shared TypeScript type definitions | all apps |
| `packages/ui` | Shared React component library (PageLoader, etc.) | web, mobile |

---

## Turborepo Pipeline (`turbo.json`)

| Task | Depends On | Description |
|---|---|---|
| `build` | `^build` | Build all apps in dependency order |
| `dev` | — | Start all dev servers in parallel |
| `lint` | — | Biome check all JS/TS apps |
| `typecheck` | `^typecheck` | TypeScript check all apps |
| `test` | — | Run all tests |

Run across all apps:
```bash
npx turbo <task>
```

Run for a specific app:
```bash
npx turbo <task> --filter=@hisabkit/<app-name>
# e.g.:
npx turbo lint --filter=@hisabkit/web
npx turbo test --filter=@hisabkit/web
```
