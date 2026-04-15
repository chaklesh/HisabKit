# Product Foundation

**Last Updated:** 2026-04-14  
**Owner:** Product + Architecture

## Product Mission

HisabKit should become a trusted operating system for MSME finance workflows: ledgering, receivables follow-up, shop-level controls, and daily financial clarity across web and mobile.

The product must feel:

- trustworthy enough for money-related decisions
- fast enough for daily operator use
- simple enough for non-technical business users
- controlled enough for tenant admins and auditors

## Problem Statement

Small businesses often run receivables, payments, and customer balances through fragmented methods: paper registers, WhatsApp notes, ad-hoc spreadsheets, and memory-based follow-ups. The result is slow collections, weak auditability, and poor operational visibility.

HisabKit solves this by combining:

- a ledger-first customer record
- balance visibility
- transaction history
- reminders and follow-up tooling
- role-safe admin controls
- a consistent workflow across web and mobile

## Product Tenets

- Ledger first, not feature first.
- Financial correctness outranks visual novelty.
- Tenant isolation is non-negotiable.
- Web and mobile are one product, not two unrelated interfaces.
- Product complexity should grow through clear modules, not through page sprawl.
- Every user-facing workflow must have a clear recovery path for loading, error, empty, and partial-success states.

## Target User Segments

- Shop owner or tenant admin
- Counter operator or staff user
- Internal platform admin or support operator

## Core Capability Map

- Identity and access
- Customer ledger
- Transaction recording
- Balance clarity
- Business profile and settings
- Reminder workflows
- Reporting and exports
- Admin controls and auditability

## Cross-Platform Product Expectations

- Same vocabulary across backend, web, and mobile
- Same domain rules for balances, statuses, and transaction types
- Same settings model where practical
- Same language and theme options
- Same core workflows, even when layout differs by device

## Product Design Principles

- Put the most frequent workflow on the shortest path.
- Prefer guided flows over ambiguous free-form interfaces.
- Avoid clever finance terminology when plain language works.
- Show financial impact before destructive or balance-altering actions.
- Make overdue, risk, and data-quality issues visible without overwhelming the operator.

## Enterprise-Grade Quality Expectations

For HisabKit to qualify as a practical enterprise-grade product, the team must be able to demonstrate:

- role-safe and tenant-safe behavior
- auditable mutations for sensitive operations
- controlled release and rollback discipline
- observable production behavior
- consistent UX and terminology across platforms
- predictable engineering delivery with documented standards

## Current Strategic Gap

The repository already contains meaningful product scaffolding, but it does not yet fully meet the standard above. The active goal of this docs system is to close the gap between current implementation and target product quality without introducing unnecessary complexity.
