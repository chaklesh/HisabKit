# Quality Gates

**Last Updated:** 2026-04-26 | **Owner:** Engineering

This document provides explicit checklists for each change type. Use the appropriate checklist before opening a PR or merging. These are the enforced gates — not suggestions.

---

## Quick Reference

| Change Size | Checklist to Use |
|---|---|
| Bug fix, copy change, minor config | [Small Change](#small-change) |
| New feature, refactor, new module | [Medium Change](#medium-change) |
| Architecture change, new external integration | [Large Change](#large-change) |
| API contract change, auth model change, schema change | [Critical Change](#critical-change) |

---

## Small Change

A small change is: bug fixes, copy changes, styling tweaks, minor config updates, single-component refactors.

**Required before merge:**

- [ ] Code compiles / typechecks with no new errors
- [ ] `npm run lint` passes with no new warnings
- [ ] Existing tests still pass
- [ ] Code reviewed by at least one other person
- [ ] Changelog entry added (or justified why not needed)

---

## Medium Change

A medium change is: new feature, new page/screen, refactor of an existing module, new API endpoint, schema migration.

**Required before merge:**

- [ ] All Small Change gates pass
- [ ] `npm run build` succeeds for all affected apps
- [ ] New or updated unit tests cover the business logic added
- [ ] API changes: response shape matches backend DTOs in web/mobile consumers
- [ ] Schema migration: Liquibase changeset is forward-only and tested locally
- [ ] Docs updated if standards, architecture, or API contract changed
- [ ] Changelog entry added with Type, Area, Phase, What Changed, Why, Gates Passed
- [ ] PR description explains what was changed and how to verify

---

## Large Change

A large change is: new module, architectural refactor, new package/library, significant behavior change.

**Required before merge:**

- [ ] All Medium Change gates pass
- [ ] Architecture impact assessed and documented (update `overview/architecture.md` if needed)
- [ ] ADR entry created in `decisions/adr-register.md`
- [ ] Rollout plan documented (can this be deployed incrementally?)
- [ ] Rollback plan documented (how to revert without data loss?)
- [ ] Failure modes reviewed (what breaks and how do users see it?)
- [ ] All affected platforms updated (backend + web + mobile where applicable)
- [ ] Product review completed

---

## Critical Change

A critical change is: any API breaking change, auth model change, multi-tenancy behavior change, financial calculation change, production schema migration on live data.

**Required before merge:**

- [ ] All Large Change gates pass
- [ ] ADR entry with explicit options considered and decision rationale
- [ ] All consumers (web service files, mobile API client) updated in the same change set
- [ ] Tenant isolation tests pass for affected endpoints
- [ ] Authorization tests pass for affected role-restricted endpoints
- [ ] Regression smoke test passes on all critical golden paths
- [ ] Release note prepared: user impact, migration impact, rollback impact
- [ ] Release reviewed by architecture or engineering lead
- [ ] Post-deploy smoke verification plan ready

---

## Mandatory CI Gates (Automated)

These run on every PR and must pass for merge to be allowed:

| Gate | Tool | Applies To |
|---|---|---|
| Type check | TypeScript / Java compile | Web, Mobile, Backend |
| Lint | Biome (Web/Mobile), Checkstyle (Backend) | All |
| Unit tests | Vitest / JUnit 5 | All |
| Build | Vite / Maven | All |
| ArchUnit | ArchUnit | Backend (layer boundary violations = build failure) |

---

## Gate Failure Protocol

If a quality gate fails:

1. **Do not disable the gate** to force a merge
2. Fix the failing check or document a tracked exception with rationale
3. If the gate is genuinely wrong (false positive), raise it as a separate issue — do not bypass it inline
4. Critical production fixes may use an expedited review process but must still pass the Minimum gates above
