# GEMINI.md - HisabKit Project Context

## Project Overview
**HisabKit** is an enterprise-grade, multi-tenant ledger and business management platform designed specifically for MSMEs (Micro, Small, and Medium Enterprises) like hardware, paint, and building material shops. It allows shopkeepers to manage customer credits, debits, and partial payments with support for file attachments (Images/PDFs) and multilingual (English/Hindi) interfaces.

### Core Architecture
- **Multi-Tenancy:** "Shared Database, Shared Schema" with a robust **Global Tenant Context Filter** in the backend for absolute data isolation.
- **Backend:** Java 21 + Spring Boot 3.4
  - **Security:** JWT-based stateless authentication.
  - **Database:** H2 (Persistent File-based for Local Dev) and PostgreSQL (Production).
  - **Migrations:** Liquibase for versioned schema management.
- **Frontend:** React 18 + TypeScript + Vite
  - **Styling:** TailwindCSS with "Enterprise Blue" (#2E3A59) branding.
  - **i18n:** Full support for English and Hindi.
  - **State Management:** TanStack Query (React Query) for efficient API caching.

---

## Building and Running

### Backend (`hisabkit-backend`)
- **Prerequisites:** JDK 21, Maven.
- **Run (Dev):** `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
- **Build:** `mvn clean package`
- **Test:** `mvn test`
- **H2 Console:** Accessible at `/h2-console` (Credentials: `sa` / `password`).

### Frontend (`hisabkit-frontend`)
- **Prerequisites:** Node.js, npm/yarn.
- **Install Dependencies:** `npm install`
- **Run (Dev):** `npm run dev` (Runs on http://localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint`

---

## Development Conventions

### 1. Multi-Tenant Safety
- **Mandate:** Every database table MUST contain a `tenant_id` column.
- **Enforcement:** The `TenantFilter` and `TenantContext` in the backend ensure that all queries are automatically scoped to the logged-in shopkeeper. Never bypass this filter.

### 2. Internationalization (i18n)
- **Mandate:** No hardcoded strings in the UI or error messages.
- **Frontend:** Use `react-i18next` with `src/i18n/locales/`.
- **Backend:** Use Spring `MessageSource` with `src/main/resources/i18n/`.

### 3. Documentation
- **Technical Specs:** Located in the `/docs` directory.
- **API Reference:** Automatically generated via SpringDoc OpenAPI (Swagger) at `/swagger-ui.html`.

### 4. Code Style
- **Backend:** Standard Spring Boot naming conventions. Use Lombok for boilerplate reduction.
- **Frontend:** Functional React components with TypeScript interfaces for all API responses.

---

## Deployment
- **Production:** Optimized for single-instance deployment on **Oracle Cloud Compute** using Docker Compose.
- **Infrastructure:** Self-contained container bundling Backend, Frontend (Nginx), and PostgreSQL.
