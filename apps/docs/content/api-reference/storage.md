# Storage & Module Catalog API

---

## Storage: Attachments

File attachments are managed through the ledger API (not a standalone `/api/storage` path).  
See [Ledger API → Attachments](/api-reference/ledger#attachments) for full details.

**Quick reference:**

| Endpoint | Method | Description |
|---|---|---|
| `/api/ledger/transactions/{id}/attachments` | `POST` | Upload attachment (`multipart/form-data`, field: `file`) |
| `/api/ledger/transactions/{id}/attachments` | `GET` | List all attachments for a transaction |
| `/api/ledger/attachments/{id}/content` | `GET` | Inline view file content |
| `/api/ledger/attachments/{id}` | `DELETE` | Delete attachment |

---

## Attachment Storage Configuration

| Variable | Description | Default |
|---|---|---|
| `UPLOAD_DIR` | Server directory for uploaded files | `./uploads` |
| Per-tenant quota | Configured in tenant profile (`attachmentQuotaMb`) | 500 MB |
| Per-file size limit | Configured in tenant profile (`maxAttachmentFileSizeMb`) | 10 MB |
| Retention | Configured in tenant profile (`attachmentRetentionDays`) | 90 days |

> **Production note:** The current implementation stores files on local disk (`./uploads`). For horizontal scaling or managed cloud deployment, replace with an object storage adapter (S3-compatible) behind the `AttachmentStorageService` interface. Never use local disk in a multi-instance deployment.

---

## Module Catalog API

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/modules` | `GET` | List all application modules and their enabled status | Public |

---

## GET /api/modules

Returns the full catalog of application modules with their enabled/disabled status and phase.

**Response `200 OK`:**
```json
[
  {
    "id": "dashboard",
    "label": "Dashboard",
    "enabled": true,
    "phase": "live"
  },
  {
    "id": "customers",
    "label": "CRM",
    "enabled": true,
    "phase": "live"
  },
  {
    "id": "ledger",
    "label": "Customer Ledger",
    "enabled": true,
    "phase": "live"
  },
  {
    "id": "analytics",
    "label": "Portfolio Analytics",
    "enabled": true,
    "phase": "live"
  },
  {
    "id": "inventory",
    "label": "Inventory Management",
    "enabled": false,
    "phase": "planned"
  },
  {
    "id": "suppliers",
    "label": "Supplier Management",
    "enabled": false,
    "phase": "planned"
  },
  {
    "id": "lending",
    "label": "Money Lending",
    "enabled": false,
    "phase": "planned"
  }
]
```

The web frontend uses this endpoint to dynamically show/hide sidebar items and module navigation. Planned modules render a "Coming Soon" placeholder page.
