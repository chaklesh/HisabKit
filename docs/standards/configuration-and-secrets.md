# Configuration And Secrets

**Last Updated:** 2026-04-14  
**Owner:** Architecture + Platform

## Purpose

Define how environment configuration, secrets, runtime flags, and third-party credentials are managed.

## Core Rules

- no production secret in source control
- no environment-specific URL literals in feature code
- every runtime variable must have one documented owner and one loading path
- client applications may only receive values that are safe to expose publicly

## Configuration Model

### Backend

- runtime configuration comes from Spring configuration plus environment variables
- secrets must come from environment or secret-management infrastructure
- no real fallback secret values in application defaults

### Web

- environment variables must enter through a centralized config module
- only approved public prefixes may be exposed to the client bundle
- feature code must not read raw environment variables directly

### Mobile

- environment variables must enter through a centralized config module
- only explicitly public client-safe values may be embedded
- tokens and credentials must use secure storage where persistence is required

## Change Policy

For every new variable:

1. add it to the relevant example env file
2. add it to the app’s centralized config layer
3. update this document if the category or policy changes
4. document operational impact in release docs if relevant

## Operational Expectations

- rotate secrets with a documented process
- separate dev, staging, and production configuration clearly
- keep environment parity high enough to avoid release-only surprises

## Current Gap Notes

- the project still needs stronger cleanup of fallback values and stricter centralization in some areas
- this is a standards gap to close, not a reason to normalize hardcoding
