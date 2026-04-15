# API Specification Governance

## Source Of Truth

Backend API contracts are authored in Spring controllers and DTOs.
OpenAPI/Swagger output is the contract publication mechanism.

## Contract Rules

- Do not change response/request shapes without updating this document and linked backend DTO/controller definitions.
- Keep naming consistent across backend DTOs, frontend types, and mobile types.
- Preserve backward compatibility for auth payload and error schema unless a versioned change is approved.

## API Surface Groups

- Auth APIs: /api/auth/*
- Ledger APIs: /api/ledger/* (tenant scoped)
- Admin APIs: /api/admin/* (super-admin operations)
- Profile APIs: /api/profile/*
- Module Catalog APIs: /api/modules

## Error Contract

Use a stable structured error format from backend global exception handling:
- timestamp
- status
- error
- message
- path
- validationErrors (field map when validation fails)

## Change Management

For any API-impacting task:
1. Update api-spec.md with intended change.
2. Update backend DTO/controller.
3. Update frontend/mobile consumers in same work package or explicitly block merge.
4. Add handoff evidence in agent-handoff-log.md.

## Non-Negotiables

- No silent contract drift.
- No undocumented endpoint additions.
- No schema/enum changes without cross-stack alignment notes.
