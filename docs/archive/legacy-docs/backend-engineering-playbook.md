# Backend Engineering Playbook

**Owner:** Backend Engineering
**Scope:** `hisabkit-backend`
**Last Updated:** 2026-04-14
**Purpose:** Keep the backend maintainable, tenant-safe, and production-ready as the platform grows.

This playbook is backend-specific implementation guidance under shared standards in:
- `docs/engineering-standards.md`
- `docs/development-guide.md`
- `docs/api-spec.md`
- `docs/db-schema.md`

## 1) Non-Negotiable Rules

- Preserve tenant isolation on all tenant-scoped reads and writes.
- Keep controller -> service -> repository layering explicit.
- Keep DTOs as the external API boundary; do not leak persistence models directly to clients.
- Validate inputs at the boundary and keep business rules in services, not controllers.
- Do not introduce schema or contract drift without updating `api-spec.md` and `db-schema.md`.
- Avoid hidden side effects inside repositories or security filters.

## 2) Current Backend Shape

The backend currently follows a layered Spring Boot structure:

- `src/main/java/com/nayag/hisabkit/controller`
- `src/main/java/com/nayag/hisabkit/service`
- `src/main/java/com/nayag/hisabkit/repository`
- `src/main/java/com/nayag/hisabkit/dto`
- `src/main/java/com/nayag/hisabkit/model`
- `src/main/java/com/nayag/hisabkit/security`
- `src/main/java/com/nayag/hisabkit/config`
- `src/main/java/com/nayag/hisabkit/module`

Keep new code aligned with this structure unless an approved architecture decision changes it.

## 3) Responsibility Boundaries

- Controllers:
  - request/response mapping
  - authz entry checks
  - DTO validation
  - HTTP status semantics
- Services:
  - business rules
  - orchestration across repositories or integrations
  - tenant-aware decisions
  - domain-level invariants
- Repositories:
  - persistence access only
  - no cross-aggregate orchestration
- Security/config:
  - authentication, authorization, request context, and runtime wiring only

## 4) Contract And Data Rules

- Every externally visible request/response shape must be represented by a DTO.
- Enums used in API payloads must be treated as cross-stack contracts.
- Keep attachment, auth, ledger, admin, and profile payloads backward-compatible unless a documented breaking change is approved.
- Prefer additive changes over destructive changes.

## 5) Transaction, Audit, And Safety Guidance

- Keep transactional boundaries in services, not controllers.
- Prefer explicit transactional methods for writes affecting multiple entities.
- Document audit-sensitive behavior in service code and handoff logs.
- Financial and ledger behavior must be deterministic, especially for backdated entries.

## 6) Testing Guidance

- Minimum expectation for backend changes:
  - `mvn -q -DskipTests compile`
- Release or risk-sensitive work should also run:
  - `mvn test`

Current observed gap:
- There is no meaningful `src/test` suite committed yet.

Near-term test priorities:
- service-level tests for ledger balance and tenant boundaries
- controller tests for auth/admin/profile flows
- regression coverage for attachments and reminder/template behavior

## 7) Clean Code Rules

- Keep methods small enough to read without scrolling through unrelated branches.
- Prefer explicit names over abbreviated business terminology in code.
- Keep entity mutation paths obvious and centralized.
- Avoid utility dumping grounds; place logic near the owning service or module.
- If a class exceeds its domain responsibility, split it before adding more behavior.

## 8) Pull Request Checklist

- Compile passes.
- API/schema docs updated if needed.
- Tenant-safety impact reviewed.
- Error behavior is explicit and consistent.
- No controller or repository now owns business logic it should not own.

## 9) Near-Term Improvement Focus

- Build a real backend test baseline under `src/test`.
- Tighten service-level documentation around tenancy and ledger recomputation.
- Keep module/plugin growth behind clear contracts and feature gates.
