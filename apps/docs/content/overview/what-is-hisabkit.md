# What is HisabKit?

**Last Updated:** 2026-04-26 | **Owner:** Product + Architecture

---

## Mission

HisabKit is a trusted operating system for MSME finance workflows — ledgering, receivables follow-up, shop-level controls, and daily financial clarity across web and mobile.

The product must feel:
- **Trustworthy** enough for money-related decisions
- **Fast** enough for daily operator use
- **Simple** enough for non-technical business users
- **Controlled** enough for tenant admins and auditors

---

## Problem Statement

Small businesses run receivables, payments, and customer balances through fragmented methods: paper registers, WhatsApp notes, ad-hoc spreadsheets, and memory-based follow-ups. The result is slow collections, weak auditability, and poor operational visibility.

HisabKit solves this by combining:
- A ledger-first customer record
- Balance visibility and portfolio exposure
- Transaction history with audit trails
- Reminders and follow-up tooling
- Role-safe admin controls
- A consistent workflow across web and mobile

---

## Product Tenets

1. **Ledger first, not feature first.** Financial correctness outranks visual novelty.
2. **Tenant isolation is non-negotiable.** Every data record is tenant-scoped.
3. **One product, two interfaces.** Web and mobile share business rules — layout differs, behavior does not.
4. **Complexity grows through modules.** New capabilities are added as explicit modules, not page sprawl.
5. **Every workflow has a recovery path.** Loading, error, empty, and partial-success states are always handled.

---

## User Segments

| Persona | Role | Primary Concern |
|---|---|---|
| **Shop Owner / Tenant Admin** | Creates and manages the business account | Balance overview, audit control, settings |
| **Counter Operator / Staff** | Records daily transactions | Speed, accuracy, customer lookup |
| **Platform Admin** | Manages tenants across the platform | Tenant lifecycle, system health, support |

---

## Core Capability Map

| Module | Label | Capability | Status |
|---|---|---|---|
| `dashboard` | Dashboard | Home KPIs, balance overview, quick actions | ✅ Live |
| `ledger` | Customer Ledger | Ledger-first customer records, full transaction history | ✅ Live |
| `customers` | CRM | Bulk management, Excel import/export, search/filter | ✅ Live |
| `analytics` | Portfolio Analytics | Aging analysis, portfolio KPIs, CSV data exports | ✅ Live |
| `settings` | Settings | Business profile, theme, preferences | ✅ Live |
| `profile` | Profile | User profile, password, avatar | ✅ Live |
| `admin` | Admin Console | Tenant lifecycle, cross-tenant ops, audit logs | ✅ Live |
| `inventory` | Inventory Management | Stock and inventory tracking | 🔜 Planned |
| `suppliers` | Supplier Management | Supplier records and payables | 🔜 Planned |
| `lending` | Money Lending | Loan and lending workflows | 🔜 Planned |

---

## Cross-Platform Expectations

Web and mobile must share:
- The same vocabulary for domain concepts (customer, ledger, transaction, balance)
- The same business rules for balances, statuses, and transaction types
- The same settings model where practical
- The same language and theme options

They are allowed to differ in:
- Layout and navigation pattern
- Component implementations
- Platform-specific gestures or capabilities

---

## Enterprise-Grade Quality Bar

HisabKit qualifies as enterprise-grade only when it can demonstrate:

- Role-safe and tenant-safe behavior (tested)
- Auditable mutations for sensitive operations
- Controlled release and rollback discipline
- Observable production behavior (structured logs, metrics, health probes)
- Consistent UX and terminology across platforms
- Predictable engineering delivery with documented and enforced standards
