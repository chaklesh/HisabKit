# Release & Operations

**Last Updated:** 2026-04-26 | **Owner:** Platform + Engineering Leadership

---

## Environment Model

| Environment | Purpose | Stability |
|---|---|---|
| **local** | Developer iteration, hot reload | Fast feedback |
| **staging** | Integration testing, release rehearsal, QA | Stable for verification |
| **production** | Live customer traffic | Zero-downtime releases only |

**Rule:** Environment behavior is explicit. No silent fallback from one environment to another. Each app resolves its environment config from explicit environment variables — never from conditional guessing.

---

## CI/CD Pipeline Stages

Every merge to the main branch must pass through:

1. Install and restore dependencies (`npm ci` / `mvn dependency:resolve`)
2. Lint and static analysis (Biome / Checkstyle)
3. Compile / typecheck (TypeScript / Java)
4. Automated tests (Vitest / JUnit 5)
5. Build / package artifacts (Vite / Maven)
6. Deploy to target environment
7. Post-deploy smoke verification

**Current state:** Local quality gates are enforced. A full automated CI/CD pipeline is a Phase 5 deliverable.

---

## Release Rules

- Releases must be traceable to a version tag and a change set
- Release notes must summarize:
  - User-facing impact
  - Migration impact (schema changes, config changes)
  - Rollback impact (what breaks if we revert)
- Schema changes must be rollout-safe (backward-compatible while old code is still running)
- Breaking API changes require explicit consumer coordination and compatibility planning

---

## Rollback Rules

- Every production release must have a documented rollback path before deployment
- Schema changes need both a forward migration and a documented recovery plan
- Rollback steps are written before deployment — not improvised during an incident
- If a schema migration cannot be safely rolled back, it requires architecture review before release

---

## Observability Baseline

Production readiness requires all of the following:

| Signal | Standard |
|---|---|
| Structured logs | JSON format; include `tenantId`, `traceId`, `userId` on sensitive operations |
| Application health | `/actuator/health` returning liveness + readiness |
| Metrics | Request latency (p95/p99), error rate, throughput per endpoint |
| Web error tracking | Client-side error reporting (Sentry or equivalent) |
| Mobile error tracking | Crash reporting (Expo error reporting or Sentry) |
| Alerting | Backend database errors, auth failures, external integration errors |

**Current state:** Not yet production-grade. This is a Phase 5 exit criterion.

---

## Deployment Target

| Component | Deployment Model |
|---|---|
| Backend API | Docker container, behind reverse proxy (Nginx / Caddy) |
| Web Dashboard | Docker container (Nginx static) or CDN-hosted static build |
| Database | Managed MariaDB with automated daily backups |
| Secrets | Platform environment variable injection — never baked into images |
| TLS | Termination at reverse proxy or ingress controller |
| Domain | Explicit domain config — no IP-direct access in production |

---

## Support & Incident Management

| Concern | Standard |
|---|---|
| Critical financial-impacting defects | Must have explicit severity handling and SLA |
| Incident notes | Capture: impact, timeline, root cause, preventive action |
| Recurring incidents | Must create tracked roadmap items — not just hotfixes |
| Data corruption suspicion | Immediate escalation, backup restore evaluated, audit log reviewed |

---

## Deployment Runbook Template

For each production release, create a runbook with:

```
## Release [version] — [date]

### What's Changing
- [list of changes]

### Pre-Deployment Checklist
- [ ] Schema migration tested in staging
- [ ] Rollback plan documented
- [ ] Smoke tests ready

### Deployment Steps
1. ...

### Post-Deployment Verification
- [ ] Health check passes
- [ ] Critical smoke path verified
- [ ] Logs show no unexpected errors

### Rollback Steps (if needed)
1. ...
```
