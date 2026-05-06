# API Reference

**Backend Version:** 1.2.0 | **Base URL:** `http://localhost:8010`  
**Interactive Docs:** `http://localhost:8010/swagger-ui.html`

---

## Authentication Headers

All protected endpoints require:

| Header | Value | When Required |
|---|---|---|
| `Authorization` | `Bearer <JWT token>` | All protected endpoints |
| `X-TenantID` | Tenant UUID | All tenant-scoped endpoints (ledger, analytics) |

> **Note:** The Analytics API uses `X-Tenant-Id` (lowercase `d`) as its header name — see [Analytics API](/api-reference/ledger#analytics) for details.

---

## Common Response Patterns

### Error response (all non-2xx)
```json
{
  "timestamp": "2026-04-26T10:00:00Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Customer name is required",
  "path": "/api/ledger/customers"
}
```

---

## API Surface Overview

| Domain | Base Path | Description |
|---|---|---|
| [Auth](/api-reference/auth) | `/api/auth` | Login, registration, Google OAuth2 |
| [Profile](/api-reference/auth#profile) | `/api/profile` | User profile and tenant business profile |
| [Admin](/api-reference/admin) | `/api/admin` | Tenant lifecycle + cross-tenant data ops |
| [Ledger](/api-reference/ledger) | `/api/ledger` | Customers, transactions, attachments, summary |
| [Analytics](/api-reference/ledger#analytics) | `/api/analytics` | Portfolio KPIs, distribution, CSV exports |
| [Modules](/api-reference/storage) | `/api/modules` | Module catalog (enabled/disabled features) |
| System | `/actuator/health` | Health probe |

---

## System Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/modules` | `GET` | List enabled application modules | Public |
| `/actuator/health` | `GET` | Liveness / readiness probe | Public |
| `/actuator/info` | `GET` | Application version info | Public |
| `/h2-console` | GET | H2 database console (dev only) | None |
| `/swagger-ui.html` | GET | Interactive Swagger UI | None |
