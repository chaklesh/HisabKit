# Quickstart

**Last Updated:** 2026-05-02

Get the full HisabKit platform running locally in under 10 minutes.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Use `nvm` or `fnm` for version management |
| npm | 10+ | Comes with Node 20 |
| Java | 21 | OpenJDK 21 recommended |
| Maven | 3.9+ | Or use the `./mvnw` wrapper inside `apps/api/` |

> **No external database needed for dev.** The backend uses an **embedded H2 database** by default. A file-based H2 DB is created automatically at `apps/api/data/hisabkit-db` on first run.

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd hisabkit5

# Install all workspace dependencies (all apps + packages)
npm install
```

---

## Step 2: Configure Environment Variables

Copy the example env files:

```bash
# Backend
copy apps\api\.env.example apps\api\.env

# Web
copy apps\web\.env.example apps\web\.env
```

**Minimum required for local dev:**

`apps/api/.env`:
```properties
# H2 is used by default — no DB config needed for dev
JWT_SECRET=any-long-random-string-at-least-32-characters-here
```

`apps/web/.env`:
```properties
VITE_API_BASE_URL=http://localhost:8010
```

> **Note:** The backend runs on port **8010** (not 8080). Set `VITE_API_BASE_URL` accordingly.

---

## Step 3: Run the Platform

### Run everything (web + backend + docs, excluding mobile):
```bash
npm run dev
```
*or with Turborepo filter:*
```bash
npx turbo dev --filter=!@hisabkit/mobile
```

### Run mobile only:
```bash
npx turbo dev --filter=@hisabkit/mobile --no-cache
```

### Run a specific app:
```bash
# Web only
npx turbo dev --filter=@hisabkit/web

# Backend only
npx turbo dev --filter=@hisabkit/api

# Docs only
npx turbo dev --filter=@hisabkit/docs
```

---

## Step 4: Access the Services

| Service | URL | Notes |
|---|---|---|
| Web Dashboard | http://localhost:5173 | Main operator UI |
| Backend API | http://localhost:8010 | REST API |
| Swagger UI | http://localhost:8010/swagger-ui.html | Interactive API explorer |
| H2 Console | http://localhost:8010/h2-console | Dev database explorer |
| Docs | http://localhost:3001/docs | This documentation site |
| Mobile | http://localhost:8081 | Expo Metro bundler |

---

## Step 5: First Login

The backend auto-seeds a default super-admin on first startup via the bootstrap configuration:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `password123` |
| Role | `SUPER_ADMIN` |

> **Change the password immediately after first login in any non-local environment.**

---

## Quality Gate Commands

Run these before committing or opening a PR:

```bash
# Lint all apps (Biome for JS/TS, Checkstyle for Java)
npm run lint        # from root — runs biome for web/mobile/docs

# Type-check all TypeScript apps
npx turbo typecheck

# Run all tests
npx turbo test

# Build all apps
npx turbo build

# Full check for web (lint + typecheck + test + build)
cd apps/web && npm run check
```

---

## Common Issues

| Issue | Fix |
|---|---|
| Backend won't start — port conflict | Check nothing is using port 8010: `netstat -aon \| findstr 8010` |
| Web shows API errors | Ensure `VITE_API_BASE_URL=http://localhost:8010` in `apps/web/.env` |
| Metro bundler fails for mobile | Run `npx turbo dev --filter=@hisabkit/mobile --no-cache` |
| `npx turbo` not found | Run `npm install` from the root first |
| H2 console not loading | Backend must be running; access at `http://localhost:8010/h2-console`, JDBC URL: `jdbc:h2:file:./data/hisabkit-db` |
| Liquibase migration error | Delete `apps/api/data/` folder and restart for a clean H2 DB |
