# Data & Financial Integrity

**Last Updated:** 2026-04-26 | **Owner:** Backend Architecture

---

## Source of Truth

- **Schema:** Liquibase migration files in `apps/api/src/main/resources/db/changelog/` are the canonical schema definition
- **This document:** Defines the human-readable quality rules and financial data integrity bar

---

## Core Data Rules

| Rule | Detail |
|---|---|
| Tenant scoping | Every tenant-scoped table must contain `tenant_id` (indexed) |
| Foreign keys | Explicit FK relationships where practical; no orphaned records |
| Monetary values | `NUMERIC(19, 4)` or equivalent; never `FLOAT` or `DOUBLE` |
| Sensitive mutations | Must be auditable via `audit_logs` table |
| Derived values | Balances and totals must be reproducible from durable transaction records |
| Soft delete | Preferred for customer and transaction records over hard deletion |

---

## Financial Integrity Rules

1. **Transaction history is immutable.** Records are never silently edited — corrections use explicit reversal or amendment entries.
2. **Backdated entries** must not silently corrupt downstream balances. Balance recalculation must account for entry order.
3. **Destructive changes** prefer audit-backed correction over hard deletion.
4. **Client storage** (localStorage, AsyncStorage) must never be treated as canonical financial data. Server is always the source of truth.
5. **Precision:** All monetary arithmetic uses `BigDecimal` with `HALF_UP` rounding to 2 decimal places in Java.

---

## Schema Migration Rules

| Rule | Detail |
|---|---|
| Tool | Liquibase only — no manual schema changes in production |
| Forward-only | All migrations are additive or carefully backward-compatible |
| Immutable | Released and applied changesets must never be edited |
| Destructive migrations | Require an explicit backup plan and rollback strategy before deployment |
| Contract alignment | Schema changes that affect API response shapes must be coordinated with API contract updates |

---

## Multi-Tenancy Data Rules

- Every list query against a tenant-scoped table must filter by `tenant_id`
- `tenant_id` filters are enforced at the repository layer — not left to the caller
- Cross-tenant queries require explicit super-admin privilege and are logged
- Tenant deletion must cascade-delete all associated records in dependency order (audit logs → transactions → customers → tenant)

---

## Audit Logging

Audit records are mandatory for:
- All ledger mutations (create/update/delete customer, create transaction)
- All admin operations (tenant create/update/delete)
- All privileged or role-escalated operations

Audit log entry must contain:
- `tenant_id`
- `user_id` (who performed the action)
- `action` (verb: `CUSTOMER_CREATED`, `TRANSACTION_POSTED`, `TENANT_DELETED`, etc.)
- `entity_type` and `entity_id`
- `payload` (before/after or description)
- `created_at` (server time)

---

## Data Retention & Recovery

| Concern | Standard |
|---|---|
| Production backups | Automated daily, verified periodically |
| Backup retention | Minimum 30 days |
| Attachment storage | Retention and recovery expectations documented before production |
| Audit logs | Minimum 90-day retention window |
| Recovery procedure | Documented in [Release & Operations](/delivery/release-and-ops) |

---

## Current Gaps

- Stricter audit testing (verifying audit records are written on all expected operations) is pending
- Operational recovery procedure is not yet fully documented
- Production backup schedule is not yet formally configured
