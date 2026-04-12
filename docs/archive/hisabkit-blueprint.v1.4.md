# HisabKit Master Blueprint: Enterprise Multi-Tenant Ledger (v1.4)

## 1. Objective
To build a highly robust, secure, and multilingual web application (**HisabKit**) for MSMEs. Optimized for **low-cost hosting on Oracle Cloud** and **persistent local development on Windows**.

---

## 2. Core Architecture & Tech Stack
- **Backend:** Java 21 + Spring Boot 3.4
  - **Live Reload:** Spring Boot DevTools (Hot Swap enabled).
  - **Profiles:**
    - `dev` (Local): **Persistent H2 File-based Database** (`./data/hisabkit-db`).
    - `prod` (Oracle Cloud): **PostgreSQL** (Self-hosted on Compute instance).
  - **Multi-Tenancy (Enterprise Grade):**
    - **Shared Database, Shared Schema** with mandatory `tenant_id` on all tables.
    - **Global Tenant Filter:** Intercepts all Hibernate/JPA queries to automatically append `tenant_id` at the database level (Hibernate `@Filter` or Spring AOP).
    - **Tenant Context:** ThreadLocal context for stateless JWT requests.
  - **Security:** Spring Security + JWT.
  - **i18n:** English/Hindi localized labels and messages.
  - **Storage:** Local file system with a configurable root.
- **Frontend:** React 18 + TypeScript + TailwindCSS
  - **Live Reload:** Vite HMR (Hot Module Replacement).
  - **i18n:** `react-i18next` (English/Hindi).
- **Deployment Strategy:**
  - **Compute-Only:** Single-instance Docker Compose (App + DB + Nginx).
  - **Documentation:** Dedicated `/docs` directory within the `HisabKit/` project folder.

---

## 3. Robust Enterprise Schema
1. **`tenants`**: 
   - `id`, `slug` (Unique), `name`, `business_type`, `config` (JSON: currency, language, timezone), `status`, `created_at`.
2. **`users`**: 
   - `id`, `username`, `password_hash`, `role` (ADMIN, USER, SUPER_ADMIN), `tenant_id`, `is_active`, `last_login_at`.
3. **`customers`**: 
   - `id`, `name`, `phone`, `email` (Optional), `address` (Optional), `gst_number` (Optional), `total_balance`, `tenant_id`.
4. **`transactions` (Ledger Entries)**: 
   - `id`, `reference_no` (Tenant-unique prefix), `customer_id`, `type` (SALE/PAYMENT), `total_amount`, `paid_amount`, `due_amount`, `description`, `timestamp`, `created_by_user_id`, `tenant_id`.
5. **`attachments`**: 
   - `id`, `transaction_id`, `file_name`, `file_type`, `file_url`, `uploaded_at`, `tenant_id`.
6. **`audit_logs`**: 
   - `id`, `entity_name`, `entity_id`, `action` (CREATE/UPDATE/DELETE), `changes` (JSON: old_val vs new_val), `user_id`, `timestamp`, `tenant_id`.

---

## 4. Implementation Phases

### Phase 1: Robust Scaffolding
- Create `HisabKit/` project directory.
- Initialize `hisabkit-backend` with **Persistent H2** and **Global Tenant Context Filter**.
- Initialize `hisabkit-frontend` with Vite, React, and Tailwind.
- Set up `/docs` for architectural and user manuals.

### Phase 2: IAM & i18n
- Implement JWT Auth with secure `tenant_id` injection.
- Configure i18n for English and Hindi on both stacks.
- Build the "Login" UI with a clean Language Switcher.

### Phase 3: Super Admin Module
- Create management APIs for Tenant Onboarding and global auditing.
- Build the Admin UI for managing shops and system performance.

### Phase 4: Core Ledger & Attachments
- **Ledger Engine:** Atomic updates to customer balances with automatic `due_amount` calculation.
- **Audit System:** Automatically log every transaction change.
- **File System Storage:** Service for uploading and serving images/PDFs.

### Phase 5: Self-Contained Deployment
- Finalize `docker-compose.yml` for single-instance Oracle Cloud deployment.
- Complete User Guide and API Reference in `/docs`.

---

## 5. Verification Strategy
- **Persistence Test:** Ensure H2 data survives backend restarts on Windows.
- **Isolation Test:** Verify Tenant A can never query Tenant B data using an automated security script.
- **Audit Trail Test:** Confirm every change is recorded in the `audit_logs` table.
- **Live-Reload Test:** Verify code changes are reflected without manual restarts.
