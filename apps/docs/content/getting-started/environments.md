# Environments & Configuration

**Last Updated:** 2026-05-02

---

## Environment Model

HisabKit has three environments. Each must be explicit — no silent fallback.

| Environment | Purpose | Database | Stability |
|---|---|---|---|
| **dev** (default) | Developer iteration, hot reload | H2 embedded (file-based, auto-created) | Fast feedback |
| **staging** | Integration testing, release rehearsal | MariaDB (or H2) | Stable for QA |
| **production** | Live customer traffic | MariaDB (managed) | Zero-downtime releases only |

The active Spring profile is set via `SPRING_PROFILES_ACTIVE`. Defaults to `dev`.

---

## Backend Environment Variables (`apps/api/.env`)

| Variable | Required | Description | Default / Example |
|---|---|---|---|
| `JWT_SECRET` | ✅ | JWT signing key (min 32 chars; use 64+ for production) | `dev-only-jwt-secret-change-me` |
| `SERVER_PORT` | ⚪ | Backend HTTP port | `8010` |
| `SPRING_PROFILES_ACTIVE` | ⚪ | Active profile (`dev` or `prod`) | `dev` |
| `GOOGLE_CLIENT_ID` | ⚪ | Google OAuth2 client ID (for social login) | *(empty — optional)* |
| `CORS_ALLOWED_ORIGINS` | ⚪ | CORS allowed origins | `http://localhost:5173` |
| `UPLOAD_DIR` | ⚪ | File attachment storage directory | `./uploads` |

**Production-only (`SPRING_PROFILES_ACTIVE=prod`):**

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | ✅ | MariaDB host |
| `DB_PORT` | ✅ | MariaDB port (usually `3306`) |
| `DB_NAME` | ✅ | Database name |
| `DB_USER` | ✅ | Database username |
| `DB_PASSWORD` | ✅ | Database password |

**Dev-only (override H2 with external DB):**

| Variable | Description | Example |
|---|---|---|
| `DEV_JDBC_URL` | Custom JDBC URL (overrides H2 default) | `jdbc:mariadb://localhost:3306/hisabkit` |
| `DEV_DB_DRIVER` | JDBC driver class | `org.mariadb.jdbc.Driver` |
| `DEV_DB_DIALECT` | Hibernate dialect | `org.hibernate.dialect.MariaDBDialect` |

---

## Web App Environment Variables (`apps/web/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL | `http://localhost:8010` |
| `VITE_GOOGLE_CLIENT_ID` | ⚪ | Google OAuth2 client ID (for One Tap login) | `xxx.apps.googleusercontent.com` |

> **All `VITE_` variables are embedded at build time.** Never put secrets here — they are visible in the browser bundle.

---

## Dev Database: H2 Embedded

By default in the `dev` profile, the backend uses an **H2 embedded file-based database**:

- **No setup needed** — H2 is included in the Spring Boot dependencies
- Database file is created at: `apps/api/data/hisabkit-db.mv.db`
- Schema is managed by **Liquibase** and applied automatically on startup
- H2 web console available at: `http://localhost:8010/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/hisabkit-db`
  - Username: `sa`
  - Password: `password`

**To reset the dev database:** Delete the `apps/api/data/` folder and restart the backend.

---

## Production Database: MariaDB

The `prod` profile connects to a MariaDB instance (currently hosted on Oracle Cloud / HestiaCP):

- Liquibase runs migrations automatically on startup
- `ddl-auto: validate` — Hibernate validates but does not alter schema
- Connection pool configured via HikariCP (max 10 connections)

---

## Bootstrap: Default Admin Account

On first startup, the backend creates a default super-admin account if no admin exists:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `password123` |
| Tenant | `Platform Auditor` (slug: `auditor`) |
| Role | `SUPER_ADMIN` |

This is controlled by the `hisabkit.bootstrap.*` config block in `application.yml`. Disable by setting `hisabkit.bootstrap.enabled=false` in production.

---

## Configuration Rules

1. **Never commit `.env` files.** Only `.env.example` is committed. Actual values go in `.env` (gitignored).
2. **No secrets in source code.** JWT secret, DB credentials, OAuth client secrets must always come from environment variables.
3. **Environment separation is explicit.** A staging or production `.env` must never point to the local dev database.
4. **JWT secret rotation** in production requires coordinated token invalidation (existing tokens become invalid).

---

## Production Deployment Target

| Component | Target |
|---|---|
| Backend | Docker container, behind reverse proxy (Nginx / Caddy) |
| Web | Docker container (Nginx static) or CDN static hosting |
| Database | Managed MariaDB with automated daily backups |
| Secrets | Platform environment variable injection — never in Docker images |
| TLS | Terminated at reverse proxy / ingress |

See [Release & Operations](/delivery/release-and-ops) for the full deployment standard.
