# Auth & Profile API

**Base Paths:** `/api/auth`, `/api/profile`

---

## Auth Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/auth/login` | `POST` | Username/password login | Public |
| `/api/auth/register` | `POST` | Register new tenant + admin user | `SUPER_ADMIN` |
| `/api/auth/social/google` | `POST` | Google OAuth2 social login | Public |

---

## POST /api/auth/login

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400000,
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "SUPER_ADMIN",
    "tenantId": "tenant-uuid"
  }
}
```

**Error cases:**
- `401` — Invalid credentials
- `400` — Missing required fields

---

## POST /api/auth/register

Creates a new tenant and its first admin user. **Requires `SUPER_ADMIN` role.**

**Headers:** `Authorization: Bearer <SUPER_ADMIN_JWT>`

**Request Body:**
```json
{
  "tenantName": "My Shop",
  "tenantSlug": "my-shop",
  "adminUsername": "shopowner",
  "adminPassword": "secure-password"
}
```

**Response `200 OK`:**
```json
{
  "token": "...",
  "user": { "username": "shopowner", "role": "ADMIN", "tenantId": "..." }
}
```

---

## POST /api/auth/social/google

**Request Body:**
```json
{
  "idToken": "google-id-token-from-client"
}
```

**Response `200 OK`:** Same shape as login response.

---

## JWT Token Lifecycle

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Expiry | 24 hours (`86400000` ms — configurable) |
| Header | `Authorization: Bearer <token>` |
| Signing key | From `JWT_SECRET` env var |

---

## Profile Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/profile` | `GET` | Get current user's profile | Any authenticated |
| `/api/profile` | `PUT` | Update current user's profile | Any authenticated |
| `/api/profile/password` | `PUT` | Change password | Any authenticated |
| `/api/profile/avatar` | `POST` | Upload avatar image | Any authenticated |
| `/api/profile/tenant` | `GET` | Get tenant business profile | Any authenticated |
| `/api/profile/tenant` | `PUT` | Update tenant business profile | `ADMIN` or `SUPER_ADMIN` |

---

## GET /api/profile

**Response `200 OK`:**
```json
{
  "username": "shopowner",
  "role": "ADMIN",
  "fullName": "Shop Owner",
  "email": "owner@myshop.com",
  "mobile": "+91-9876543210",
  "avatarUrl": "https://..."
}
```

---

## PUT /api/profile

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "new@email.com",
  "mobile": "+91-9876543210",
  "avatarUrl": "https://..."
}
```

---

## PUT /api/profile/password

**Request Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**Error cases:**
- `400` — Current password is incorrect

---

## GET /api/profile/tenant

Returns the full business profile for the current user's tenant.

**Response `200 OK`:**
```json
{
  "id": "tenant-uuid",
  "slug": "my-shop",
  "name": "My Shop",
  "businessType": "Retail",
  "ownerName": "Shop Owner",
  "businessPhone": "+91-9876543210",
  "businessEmail": "owner@myshop.com",
  "businessAddress": "123 Main St",
  "gstNumber": "27AABCU9603R1ZX",
  "logoUrl": null,
  "smsTemplate": null,
  "whatsappTemplate": null,
  "status": "ACTIVE",
  "attachmentQuotaMb": 500,
  "maxAttachmentFileSizeMb": 10,
  "attachmentRetentionDays": 90
}
```

---

## PUT /api/profile/tenant

Update tenant business profile. Requires `ADMIN` or `SUPER_ADMIN` role.

**Request Body:**
```json
{
  "name": "My Shop (Updated)",
  "businessType": "Retail",
  "ownerName": "Owner Name",
  "businessPhone": "+91-9876543210",
  "businessEmail": "owner@myshop.com",
  "businessAddress": "123 Main St",
  "gstNumber": "27AABCU9603R1ZX",
  "logoUrl": null,
  "smsTemplate": "Dear {name}, your balance is {balance}.",
  "whatsappTemplate": "Hi {name}, please pay {balance}.",
  "attachmentQuotaMb": 500,
  "maxAttachmentFileSizeMb": 10,
  "attachmentRetentionDays": 90
}
```
