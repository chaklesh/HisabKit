# Roadmap

**Last Updated:** 2026-04-26 | **Owner:** Product + Architecture | **Horizon:** 2 quarters

---

## Sequencing Rules

1. Quality hardening before major feature expansion
2. Architecture cleanup must be pragmatic and tied to product value
3. Web and mobile converge on shared product behavior — not on identical code
4. Backend contract and data rules lead cross-platform work

---

## Phase 0 — Documentation & Governance Reset ✅ Complete

**Window:** Completed 2026-04-14 (updated 2026-04-26)

**Goal:** Establish a reliable operating model and central source of truth.

**Outcomes:**
- Active docs structure reset — clean hierarchy, no duplication
- Standards rewritten around target quality, not repository habit
- Roadmap, progress tracking, and operations guidance established
- Docs fully revamped with Changelog, Getting Started, Quality Gates (2026-04-26)

---

## Phase 1 — Baseline Quality Hardening 🟡 In Progress

**Window:** 2026-04-15 to 2026-04-28

**Goal:** Make the product safe to evolve without silent drift.

| Outcome | Status |
|---|---|
| Backend ArchUnit layer enforcement | ✅ Done |
| Backend AuditService centralized | ✅ Done |
| Web typecheck 100% compliance | ✅ Done |
| Web Biome lint clean | ✅ Done |
| Web critical workflow smoke coverage | 🔴 Pending |
| Mobile automated test baseline | 🔴 Pending |
| Tenant isolation tests formalized | 🔴 Pending |
| Config and secret handling tightened | 🟡 Partial |

**Exit criteria:**
- [ ] All three apps have defined and passing validation commands
- [ ] Critical-path workflows have at least one automated smoke test
- [ ] No critical tenant-isolation gap remains untracked

---

## Phase 2 — Modular Monolith Alignment 🟡 In Progress

**Window:** 2026-04-22 to 2026-05-12

**Goal:** Reduce structural risk and make the product easier to extend.

| Outcome | Status |
|---|---|
| Web module boundaries established (dashboard, ledger, admin, settings, profile) | ✅ Done |
| Web API client modularized | ✅ Done |
| Customers & CRM module | ✅ Done |
| Mobile module structure aligned with product vocabulary | 🟡 Partial |
| Backend boundaries strengthened (domain/application/infrastructure) | 🟡 Partial |
| Shared settings model aligned across web and mobile | 🔴 Pending |

**Exit criteria:**
- [ ] All major web modules have explicit, testable boundaries
- [ ] Cross-module leakage is reduced and tracked
- [ ] Mobile module structure matches web module vocabulary

---

## Phase 3 — Product Experience & Operational Trust

**Window:** 2026-05-06 to 2026-05-27

**Goal:** Raise usability and confidence in daily financial workflows.

| Outcome | Status |
|---|---|
| Settings becomes a real control center (unified preferences) | 🔴 Planned |
| Loading, empty, error, confirmation states standardized | 🔴 Planned |
| Audit visibility and data recovery posture improve | 🔴 Planned |
| Business profile, reminders, notification preferences formalized | 🔴 Planned |

**Exit criteria:**
- [ ] No critical workflow ends in a dead state (no unhandled error/empty/loading)
- [ ] User preferences are centralized and documented
- [ ] Destructive actions are visibly safer with confirmation patterns

---

## Phase 4 — Reporting, Reminders & Admin Maturity

**Window:** 2026-05-20 to 2026-06-24

**Goal:** Expand controlled business capabilities on top of a hardened core.

| Outcome | Status |
|---|---|
| Intelligence Hub mature and actionable | ✅ Done (Phase 2 early win) |
| Reminder workflows operational | 🔴 Planned |
| Admin and audit workflows strengthened | 🟡 Partial |
| Release and support motions repeatable | 🔴 Planned |

---

## Phase 5 — Production Operations Excellence

**Window:** 2026-06-10 onward

**Goal:** Make the system easier to observe, release, and support in production.

| Outcome | Status |
|---|---|
| Observability baseline (structured logs, metrics, health probes) | 🔴 Planned |
| Rollback playbooks tested | 🔴 Planned |
| Environment promotion and release discipline stabilized | 🔴 Planned |
| Support and incident process documented | 🔴 Planned |

---

## Enterprise-Grade Foundation Exit Conditions

The platform is not enterprise-grade until **all** of the following are true:

- [ ] Critical workflows automated across all platforms (web, mobile, backend)
- [ ] Tenancy and authorization demonstrably tested
- [ ] Release and rollback processes documented and usable
- [ ] Design system and settings model coherent across web and mobile
- [ ] Docs and implementation stay synchronized through enforced quality gates
- [ ] Observability baseline is production-grade
