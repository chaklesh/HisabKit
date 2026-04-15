# Database Schema Governance

## Source Of Truth

Liquibase changelogs in backend resources are the executable schema truth.
This file is the human-readable schema reference and policy layer.

## Core Tables

- tenants: tenant identity and business metadata.
- users: identities, roles, auth links, tenant ownership.
- customers: tenant-scoped customer ledger accounts.
- transactions: SALE/PAYMENT records with amounts and timestamps.
- attachments: optional file proofs linked to transactions.
- audit_logs: mutation and action traces.

## Tenant Isolation Rules

- Tenant-scoped tables must include tenant_id.
- Tenant-scoped queries must be filtered by tenant context.
- Cross-tenant access is only allowed in explicitly authorized admin flows.

## Migration Rules

- Every schema change must be delivered as a new Liquibase changeset.
- Never edit previously released changesets.
- Keep forward-only migrations for reproducibility.
- Schema changes must be reflected in api-spec.md when contract fields are affected.

## Data Integrity Guidelines

- Keep transaction amount fields precise and validated.
- Preserve referential integrity between customers, transactions, and attachments.
- Ensure audit coverage for privileged mutations.
