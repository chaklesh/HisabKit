# HisabKit Documentation

HisabKit is a ledger-first MSME shop management SaaS focused on practical shop operations: customer balances, transaction history, reminders, and role-safe multi-tenant operations.

This documentation is organized for two audiences:
- Product and business readers who need clear platform direction.
- Engineering and AI agents that need fast, reliable project context.

## Product Snapshot

- Problem solved: fragmented khata records, delayed collections, and low visibility into receivables.
- Core value: one trusted ledger workflow across web and mobile with tenant-safe data isolation.
- Target users: MSME operators, store admins, and internal super-admin operations.

## Read Order For New Agents

1. architecture.md
2. api-spec.md
3. db-schema.md
4. development-guide.md
5. engineering-standards.md
6. brand-theme-standards.md
7. config-and-secrets-governance.md
8. architecture-decisions.md
9. agent-communication-protocol.md
10. roadmap.md
11. agent-playbook.md
12. agent-context.md
13. agent-handoff-log.md

## Active Docs

- architecture.md: system boundaries and core design decisions.
- api-spec.md: API contract governance and change rules.
- db-schema.md: data model and migration governance.
- development-guide.md: setup, run commands, and engineering standards.
- engineering-standards.md: architect-approved stack, design principles, and pattern/library governance.
- brand-theme-standards.md: cross-platform brand identity, design tokens, and UX consistency rules.
- config-and-secrets-governance.md: centralized variable policy for URLs, secrets, keys, and runtime config.
- architecture-decisions.md: architect approval register for frameworks/libraries/patterns/system decisions.
- agent-communication-protocol.md: role-to-role communication rules, handoff protocol, and escalation paths.
- roadmap.md: dependency-based product direction and agent execution order.
- agent-playbook.md: mandatory workflow and quality gates.
- agent-context.md: living architecture/domain deltas.
- agent-handoff-log.md: agent-to-agent work handoff records.

## Documentation Governance

- Prefer updating an existing doc over creating a new doc.
- Create a new doc only when scope is truly new and cannot fit existing sections.
- Keep one owner and one purpose per document.
- If two docs overlap by more than 30%, merge them in the next refactor cycle.
- Add a "Last Updated" line in policy/playbook documents.
- Move stale or superseded docs to docs/archive instead of deleting history.
- Keep onboarding path short: new developers should read no more than 6 docs before coding.

## Change History

- There is no separate customer-facing changelog file today.
- Operational work history is tracked in agent-handoff-log.md.

## Archive Policy

Historical and time-bound documents are stored in docs/archive.
They are reference-only and should not define current implementation policy.
