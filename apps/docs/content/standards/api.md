# API Design & Governance

**Last Updated:** 2026-04-26 | **Owner:** Backend Architecture

This document defines how APIs are designed, versioned, documented, consumed, and changed. See [API Reference](/api-reference) for the endpoint catalog.

---

## Ownership

- Backend owns canonical request and response contracts
- OpenAPI / Swagger is the published contract artifact (at `/swagger-ui.html`)
- Web and mobile consume contracts and may add presentation types, but must not add conflicting domain fields

---

## API Design Rules

| Rule | Detail |
|---|---|
| Resource naming | Stable, descriptive, noun-based paths (`/customers`, `/transactions`) |
| HTTP methods | Use standard conventions: `GET` read, `POST` create, `PUT` full update, `PATCH` partial update, `DELETE` remove |
| Status codes | `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `500` Server Error |
| Auth | Every protected endpoint requires `Authorization: Bearer <JWT>` |
| Multi-tenancy | Every protected endpoint enforces `X-TenantID` header; enforced by filter, not per-controller |
| Pagination | All list endpoints must support pagination; return `{ data: [], total: N, page: N, size: N }` |
| Filtering | Use query parameters for filters (`?status=ACTIVE&customerId=123`) |
| Sorting | Use `sort` query parameter (`?sort=createdAt,desc`) |
| DTOs | Never expose JPA entities — always use dedicated request/response DTOs |

---

## Error Contract

Every non-2xx response must conform to:

```json
{
  "timestamp": "2026-04-26T10:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Customer name is required",
  "path": "/api/ledger/customers",
  "details": [
    { "field": "name", "message": "must not be blank" }
  ],
  "traceId": "abc-123-xyz"
}
```

- `error` — machine-readable error code
- `message` — user-safe human-readable message
- `details` — optional array for field-level validation errors
- `traceId` — optional; include when correlation is available

---

## Versioning Strategy

- All endpoints live under `/api/v1/`
- Version bump to `/api/v2/` only for breaking changes that cannot be additive
- Breaking changes require an ADR entry and a coordinated rollout plan

---

## Compatibility Rules

| Change Type | Classification | Required Action |
|---|---|---|
| New endpoint | Non-breaking | No special process |
| New optional field in response | Non-breaking | Document in changelog |
| New required field in request | Breaking | ADR + rollout plan |
| Removed field | Breaking | ADR + rollout plan |
| Changed enum value | Breaking | ADR + rollout plan |
| Auth model change | Breaking | ADR + security review + rollout plan |
| Changed HTTP status | Breaking | ADR + rollout plan |

**Rule:** If consumers cannot be updated in the same change set, the change is not ready to merge.

---

## API Change Flow

For any change that affects an existing API contract:

1. Update relevant `standards/api.md` sections if the policy changes
2. Update OpenAPI annotations in the backend controller/DTO
3. Update all impacted consumers (web service files, mobile API client)
4. Add a changelog entry
5. Run contract-sensitive tests before merging

---

## Security Rules

- JWT tokens must have an explicit expiry
- Never log full JWT tokens
- Tenant ID must be taken from the authenticated security context on the server — never trusted from the request body
- Privileged endpoints must be narrowly scoped and explicitly listed in the admin module

---

## Secrets & Configuration

- JWT secret: min 64 characters, loaded from environment variable only
- No secrets in source code, config files, or Docker images
- OAuth credentials (Google) loaded from environment
- Key rotation plan must exist before production launch

---

## Testing Expectations

| Test Type | What to Cover |
|---|---|
| Unit | Service-layer business logic |
| Controller slice | Input validation, response shape, status codes |
| Tenant isolation | Every protected endpoint family — must prove cross-tenant data cannot leak |
| Authorization | Every role-restricted endpoint — must prove lower roles cannot access |
| Consumer smoke | Critical user flows tested at the HTTP level |
