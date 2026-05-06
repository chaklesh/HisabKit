# Backend Standards

**Last Updated:** 2026-04-26 | **Owner:** Backend Architecture  
**Stack:** Java 21, Spring Boot 3, H2 (dev) / MariaDB (prod), Liquibase

See [Core Engineering Standards](/standards/engineering) for universal rules. This file covers backend-specific standards only.

---

## Internal Layer Model

```
modules/<module>/
├── controller/     ← HTTP mapping, validation, delegation
├── service/        ← Business logic, transactional boundaries
├── repository/     ← Persistence access only
├── domain/         ← Business rules, aggregates, value objects
└── dto/            ← Request/Response objects (never expose JPA entities)
```

**Current state:** The repository uses a simplified layered structure that is acceptable as a starting point. Refactors must move toward stronger business-boundary clarity, not add more controller-to-repository shortcuts.

---

## Controller Rules

- Validate transport-level input only (use Bean Validation annotations)
- Delegate immediately to the service layer
- Return `ResponseEntity<T>` on all endpoints
- Do not implement business calculations
- Use dedicated DTOs for all request and response payloads
- Error handling is centralized in `GlobalExceptionHandler`

---

## Service Rules

- Business rules live in services or domain policies — not repositories, not controllers
- Every service method that mutates state must be `@Transactional`
- Time, identity, and tenant context must be injected — never hardcoded
- Sensitive workflows must delegate to `AuditService` before returning

---

## Repository Rules

- Handle persistence concerns only
- No business decisions inside query methods
- All tenant-scoped queries must enforce `tenant_id` filters
- N+1 query patterns are treated as defects — use `JOIN FETCH` or projections
- Unbounded queries (no pagination) are not allowed on endpoints returning lists

---

## Security Standards

| Concern | Standard |
|---|---|
| Authentication | JWT stateless tokens; every protected request requires `Authorization: Bearer <token>` |
| Multi-Tenancy | Every protected request must include `X-TenantID` header; enforced by Spring Security filter |
| Authorization | Checked at service layer using role annotations or explicit role checks |
| Secrets | Never in source code; loaded from environment variables |
| Privileged Operations | Narrow, explicit, always audited |

**Tenant isolation tests are mandatory for every new protected endpoint family.**

---

## Data Integrity Rules

- Monetary values use `BigDecimal` with `HALF_UP` rounding and 2 decimal places
- All schema changes are managed by Liquibase migrations
- Released migrations are immutable — never edit a deployed changeset
- Destructive migrations require an explicit backup and rollback plan
- Audit records are mandatory for financially sensitive or privileged mutations
- Backdated transactions must not silently corrupt downstream balances

---

## Error Contract

Every non-2xx response must match this shape:

```json
{
  "timestamp": "2026-04-26T10:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Customer name is required",
  "path": "/api/ledger/customers",
  "details": [{ "field": "name", "message": "must not be blank" }],
  "traceId": "abc123"
}
```

`GlobalExceptionHandler` must handle: validation errors, resource not found, unauthorized, forbidden, and unexpected server errors.

---

## Testing Standards

| Test Type | Scope | Tooling |
|---|---|---|
| Unit | Service and domain logic | JUnit 5, Mockito |
| Slice | Controllers, repositories | `@WebMvcTest`, `@DataJpaTest` |
| Integration | Full application flow | `@SpringBootTest`, Testcontainers |
| Tenant isolation | Every new protected endpoint | `@SpringBootTest` with multi-tenant fixtures |
| Architecture | Layer boundary enforcement | ArchUnit (enforced in build) |
| Schema | Liquibase migration validation | Testcontainers (H2 or MariaDB) |

**Current gap:** Test baseline exists but is below the 80% target for service/domain logic.

---

## Observability Standard

Production-grade backend must have:
- Structured JSON logs (include `tenantId`, `traceId`, `userId` on sensitive operations)
- Request correlation / trace IDs across requests
- Metrics: latency (p95/p99), error rate, throughput per endpoint
- Health probes at `/actuator/health` (liveness + readiness)
- Alertable failure signals for auth failures, database errors, external integrations
