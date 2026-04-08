# Khatabook Desktop UI/UX Adaptation Notes (Pattern-Level)

## Scope
This document captures non-copy adaptation patterns inspired by Khatabook public product positioning and workflow signals.
HisabKit should follow the same usability direction while keeping its own brand and implementation.

## Public Signals Considered
- "Desktop + mobile sync" expectation.
- "One place for credit/debit" workflow emphasis.
- "Faster collection via reminders" as a core action.
- "Business reports" and "multi-business" extensibility direction.

## Desktop Layout Principles for HisabKit
1. Persistent left navigation for primary modules.
2. Sticky top workspace header with page title and identity context.
3. Task-first content region: summary metrics -> actions -> detail tables/forms.
4. Lightweight status language (success/error banners, empty states, loading states).
5. Reminder and collection actions should stay one click away from customer context.

## HisabKit Adaptation Decisions (v1.1)
- Keep English-first labels with i18 readiness.
- Use module registry architecture so future modules plug in without route rewrites.
- Keep ledger as primary active module; inventory/supplier/lending remain planned modules.
- Use "Soon" badges instead of dead links for planned modules.

## Extensibility Guardrails
- New modules must be registered in src/modules/moduleRegistry.ts.
- Navigation should render from registry, not hardcoded page menus.
- Future lending module must support installment schedule and interest policy abstractions.
- Future inventory/supplier modules should integrate via shared tenant-aware API patterns.

## Non-Goals
- No direct visual/copy imitation.
- No brand asset reuse.
- No reverse-engineering proprietary UI internals.
