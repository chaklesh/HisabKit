# Admin API

**Base Path:** `/api/admin` | **Auth:** `SUPER_ADMIN` only  
**Headers:** `Authorization: Bearer <JWT>` (SUPER_ADMIN role required for all endpoints)

All admin mutations are logged via `AuditService` to the `audit_logs` table.

---

## Tenant Management

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/tenants` | `GET` | List all tenants in the system |
| `/api/admin/tenants` | `POST` | Create a new tenant |
| `/api/admin/tenants/{tenantId}` | `PUT` | Update tenant details |
| `/api/admin/tenants/{tenantId}` | `DELETE` | Delete tenant (full cascade cleanup) |

---

## GET /api/admin/tenants

Returns all tenants. No pagination in current implementation — returns full list.

**Response `200 OK`:**
```json
[
  {
    "id": "tenant-uuid",
    "slug": "my-shop",
    "name": "My Shop",
    "status": "ACTIVE",
    "businessType": "Retail",
    "ownerName": "Shop Owner"
  }
]
```

---

## POST /api/admin/tenants

Creates a new tenant record (does not create a user — use `/api/auth/register` to create tenant + admin user together).

**Request Body:**
```json
{
  "name": "New Shop",
  "slug": "new-shop"
}
```

**Response `200 OK`:**
```json
{
  "tenant": {
    "id": "tenant-uuid",
    "name": "New Shop",
    "slug": "new-shop",
    "status": "ACTIVE"
  }
}
```

---

## PUT /api/admin/tenants/{tenantId}

**Request Body:**
```json
{
  "name": "Updated Shop Name",
  "status": "SUSPENDED"
}
```

**Response `200 OK`:** Updated tenant object.

---

## DELETE /api/admin/tenants/{tenantId}

Permanently deletes a tenant and all associated data.

**Cascade deletion order enforced by backend:**
1. Audit logs
2. Transaction attachments
3. Transactions
4. Customers
5. Users
6. Tenant record

> ⚠️ **Irreversible.** All financial data for the tenant is permanently destroyed.

**Response `200 OK`:**
```json
{ "deleted": true }
```

---

## Cross-Tenant Data Operations

| Endpoint | Method | Description |
|---|---|---|
| `/api/admin/customers?tenantId={uuid}` | `GET` | List all customers for a tenant |
| `/api/admin/customers?tenantId={uuid}` | `POST` | Create customer in a specific tenant |
| `/api/admin/customers/{id}?tenantId={uuid}` | `PUT` | Update a customer |
| `/api/admin/customers/{id}?tenantId={uuid}` | `DELETE` | Delete a customer |
| `/api/admin/transactions?tenantId={uuid}` | `GET` | List transactions (optionally filtered by `customerId`) |
| `/api/admin/transactions?tenantId={uuid}` | `POST` | Create transaction |
| `/api/admin/transactions/{id}?tenantId={uuid}` | `PUT` | Update transaction |
| `/api/admin/transactions/{id}?tenantId={uuid}` | `DELETE` | Delete transaction |

> All cross-tenant data endpoints require `tenantId` as a required query parameter.

**Example:** `GET /api/admin/customers?tenantId=550e8400-e29b-41d4-a716-446655440000`

**Response `200 OK`:**
```json
[
  {
    "id": "customer-uuid",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "balance": "5000.00",
    "tenantId": "tenant-uuid"
  }
]
```
