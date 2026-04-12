# Config And Secrets Governance

**Owner:** Architect  
**Last Updated:** 2026-04-10

## Purpose

Standardize runtime configuration and prevent hardcoded URLs, secrets, and keys across backend, frontend, and mobile.

## Non-Negotiable Rules

- Never hardcode secrets or production URLs in source code.
- All runtime variables must come from env/config systems.
- Every new variable must be documented in the app's `.env.example`.
- Public client values are not secrets; use only platform-safe public prefixes.

## Centralized Config Sources

### Backend

- Source: Spring env + `application.yml` profile placeholders.
- Secrets: environment variables only.
- Rule: no real fallback secret values in config defaults.

### Frontend

- Source: `src/config/env.ts`.
- Allowed env prefix: `VITE_`.
- Rule: feature code must consume env values through central `env` export only.

### Mobile

- Source: `src/config/env.ts`.
- Allowed env prefix: `EXPO_PUBLIC_` for client-safe values.
- Rule: all network/auth endpoints and provider IDs must come from central `ENV` object.

## Hardcoding Policy

Disallowed in feature code:
- Literal API base URLs.
- Secrets/keys/tokens.
- Environment-specific endpoints.

Allowed:
- Relative API paths after base URL is centralized.
- Test-only dummy values inside dedicated test fixtures.

## Required Variable Categories

- API base URL
- OAuth/client IDs
- Feature flags
- Upload/asset endpoints
- Third-party integration IDs
- Security and token configuration (backend env only)

## Change Workflow For New Variables

1. Add variable to relevant `.env.example`.
2. Add variable to central config module.
3. Update this doc (if new category/policy impact).
4. Add handoff evidence in `docs/agent-handoff-log.md`.

## Current Cleanup Items

- Backend config currently contains an example-style fallback JWT secret in `application.yml`; replace with non-sensitive placeholder policy in upcoming hardening task.
- Continue removing legacy direct URL literals from feature layers and route through central config access.
