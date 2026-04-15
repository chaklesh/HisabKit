# Data Governance

**Last Updated:** 2026-04-14  
**Owner:** Backend Architecture

## Purpose

Define how financial and tenant data is modeled, changed, validated, retained, and protected.

## Source Of Truth

- executable schema truth lives in Liquibase migrations
- this document defines the human-readable rules and quality bar

## Core Data Rules

- every tenant-scoped table must contain `tenant_id`
- foreign-key relationships must be explicit where practical
- monetary values must use precise numeric types
- sensitive mutations must be auditable
- derived balances must be reproducible from durable records

## Financial Integrity Rules

- transaction history must remain explainable
- backdated entries must not silently corrupt downstream balances
- destructive changes should prefer audit-backed correction over silent hard deletion
- local client storage must never be treated as canonical finance data

## Migration Rules

- schema changes are forward-only
- released migrations are immutable
- destructive migrations require an explicit rollback and backup plan
- schema changes that affect contracts must align with API governance updates

## Data Retention And Recovery

- backups must be automated for production
- attachment storage must have retention and recovery expectations
- audit and operational logs must have a documented retention window
- recovery procedures belong in release and operations docs

## Current Gap Notes

- the current schema approach is directionally sound
- stricter audit, testing, and operational recovery discipline still need to be formalized and implemented
