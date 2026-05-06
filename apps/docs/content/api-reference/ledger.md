# Ledger & Analytics API

**Base Paths:** `/api/ledger`, `/api/analytics`  
**Auth:** Authenticated user + `X-TenantID` header required for `/api/ledger`  
**Auth:** Authenticated user + `X-Tenant-Id` header required for `/api/analytics`

---

## Customers

| Endpoint | Method | Description | Roles |
|---|---|---|---|
| `/api/ledger/customers` | `GET` | List all customers for current tenant | Any authenticated |
| `/api/ledger/customers` | `POST` | Create a new customer | Any authenticated |
| `/api/ledger/customers/{customerId}` | `PUT` | Update customer details | Any authenticated |
| `/api/ledger/customers/{customerId}` | `DELETE` | Delete customer and all their transactions | Any authenticated |
| `/api/ledger/summary` | `GET` | Get ledger summary KPIs for the tenant | Any authenticated |

---

## GET /api/ledger/customers

Returns all customers for the tenant. Returns raw list (no pagination envelope).

**Headers:** `X-TenantID: <tenant-uuid>`

**Response `200 OK`:**
```json
[
  {
    "id": "customer-uuid",
    "tenantId": "tenant-uuid",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com",
    "address": "123 Main St",
    "balance": "5000.00",
    "createdAt": "2026-01-15T10:00:00Z"
  }
]
```

---

## POST /api/ledger/customers

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91-9876543210",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

**Response `200 OK`:** Full customer object.

---

## PUT /api/ledger/customers/{customerId}

Same request body as POST. Returns updated customer object.

---

## DELETE /api/ledger/customers/{customerId}

Deletes the customer and all associated transactions and attachments.

**Response `200 OK`:**
```json
{
  "deleted": true,
  "customerId": "customer-uuid"
}
```

---

## GET /api/ledger/summary

Returns aggregate KPIs for the tenant.

**Response `200 OK`:**
```json
{
  "totalCustomers": 142,
  "totalOutstanding": "125000.00",
  "totalOverdue": "35000.00",
  "totalSales": "500000.00",
  "totalPayments": "375000.00"
}
```

---

## Transactions

| Endpoint | Method | Description | Roles |
|---|---|---|---|
| `/api/ledger/customers/{customerId}/transactions` | `GET` | Get transactions for a customer | Any authenticated |
| `/api/ledger/transactions` | `POST` | Create a transaction | Any authenticated |
| `/api/ledger/transactions/{transactionId}` | `PUT` | Update a transaction | Any authenticated |
| `/api/ledger/transactions/{transactionId}` | `DELETE` | Delete a transaction | Any authenticated |

---

## GET /api/ledger/customers/{customerId}/transactions

**Query Parameters:**
- `from` — ISO date (`2026-01-01`): filter start date (optional)
- `to` — ISO date (`2026-04-30`): filter end date (optional)

**Response `200 OK`:**
```json
[
  {
    "id": "tx-uuid",
    "customerId": "customer-uuid",
    "tenantId": "tenant-uuid",
    "type": "SALE",
    "amount": "1500.00",
    "description": "Purchase of goods",
    "transactionDate": "2026-04-20T14:00:00Z",
    "createdAt": "2026-04-20T14:00:00Z"
  }
]
```

**Transaction types:**
- `SALE` — Customer owes more (increases balance)
- `PAYMENT` — Customer paid (decreases balance)

---

## POST /api/ledger/transactions

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "type": "SALE",
  "amount": "1500.00",
  "description": "Purchase of goods",
  "transactionDate": "2026-04-20T14:00:00Z"
}
```

**Response `200 OK`:** Map with transaction details and updated balance.

---

## Attachments

| Endpoint | Method | Description |
|---|---|---|
| `/api/ledger/transactions/{transactionId}/attachments` | `POST` | Upload file for a transaction |
| `/api/ledger/transactions/{transactionId}/attachments` | `GET` | List attachments for a transaction |
| `/api/ledger/attachments/{attachmentId}/content` | `GET` | Inline view attachment file |
| `/api/ledger/attachments/{attachmentId}` | `DELETE` | Delete an attachment |

---

## POST /api/ledger/transactions/{transactionId}/attachments

**Content-Type:** `multipart/form-data`  
**Form field:** `file` — the file to upload

**Response `200 OK`:** Attachment object.

---

## GET /api/ledger/attachments/{attachmentId}/content

Returns the raw file inline (for display in browser).  
**Response:** Binary file with `Content-Disposition: inline` header.

---

## Analytics API

**Base Path:** `/api/analytics`  
**Note:** This API uses `X-Tenant-Id` header (lowercase `d`) — not `X-TenantID`.

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/analytics/portfolio-kpis` | `GET` | Portfolio KPI summary | Authenticated |
| `/api/analytics/portfolio-distribution` | `GET` | Balance distribution breakdown | Authenticated |
| `/api/analytics/export-portfolio` | `GET` | Export detailed portfolio as CSV | Authenticated |
| `/api/analytics/export-audit` | `GET` | Export audit trail as CSV | Authenticated |

---

## GET /api/analytics/portfolio-kpis

**Headers:** `X-Tenant-Id: <tenant-uuid>`

**Response `200 OK`:**
```json
{
  "totalCustomers": 142,
  "totalOutstanding": "125000.00",
  "overdueCustomers": 23,
  "overdueAmount": "35000.00",
  "avgBalance": "880.28",
  "collectionRate": 0.75
}
```

---

## GET /api/analytics/export-portfolio

Returns a CSV file download.  
**Response:** `text/csv` with `Content-Disposition: attachment; filename=portfolio_extract.csv`

---

## GET /api/analytics/export-audit

Returns an audit trail CSV file.  
**Response:** `text/csv` with `Content-Disposition: attachment; filename=audit_trail.csv`
