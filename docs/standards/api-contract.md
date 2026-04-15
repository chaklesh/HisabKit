# API Contract - HisabKit Backend

**Version:** 1.2.0  
**Status:** Production Ready  

## 1. Authentication (`/api/auth`)

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/login` | `POST` | Standard Username/Password Login | Public |
| `/register` | `POST` | Register a new Tenant + Admin user | `SUPER_ADMIN` |
| `/social/google` | `POST` | Google OAuth2 Social Login | Public |

## 2. Admin Operations (`/api/admin`) - Restricted to `SUPER_ADMIN`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/tenants` | `GET` | List all tenants in the system |
| `/tenants` | `POST` | Create a new tenant (Manual) |
| `/tenants/{id}` | `PUT` | Update tenant details and quotas |
| `/tenants/{id}` | `DELETE` | Delete a tenant (Cascade) |
| `/customers` | `GET` | List all customers across tenants |

## 3. Ledger Module (`/api/ledger`) - Scoped by `X-TenantID`

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/customers` | `GET` | List all customers for current tenant | `ADMIN`, `USER` |
| `/customers` | `POST` | Create a new customer | `ADMIN` |
| `/customers/{id}` | `DELETE` | Delete customer (with transactions) | `ADMIN` |
| `/transactions` | `GET` | Get transactions for a customer | `ADMIN`, `USER` |
| `/transactions` | `POST` | Create Sale or Payment | `ADMIN`, `USER` |

## 4. Storage Module (`/api/storage`)

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/attachments` | `POST` | Upload file for a transaction | `ADMIN`, `USER` |
| `/attachments/{id}` | `GET` | Get file metadata/details | `ADMIN`, `USER` |
| `/attachments/{id}/download` | `GET` | Download physical file | `ADMIN`, `USER` |

## 5. Catalog & System

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/api/modules` | `GET` | List enabled system modules | `USER` |
| `/actuator/health` | `GET` | Liveness/Readiness probe | Public |

## Security & Architecture
- **JWT Auth**: Every request must include `Authorization: Bearer <JWT>`.
- **Multi-Tenancy**: Every protected request must include `X-TenantID` header (enforced via filter).
- **Audit Logging**: All mutations (POST/PUT/DELETE) are logged in JSON format in the `audit_logs` table.
- **Precision**: All financial fields use `BigDecimal` with 2 decimal places (`HALF_UP`).
