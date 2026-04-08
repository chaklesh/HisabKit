# HisabKit Product Plan

## Current Scope (Implemented)
- Super admin control center with sidebar-based management.
- Super admin can create, list, update, and delete tenants.
- Super admin can update/delete tenant customers and transactions.
- Tenant users can manage their own customers and transactions (CRUD).
- Optional transaction proof uploads (PDF/Image) per transaction.
- Customer-wise ledger UI with backdated transaction support.
- Google and One Tap login restricted to already-registered users.
- Protected pages include in-app navigation (`Back`, `Dashboard`, contextual links) to avoid URL typing.
- CRUD screens now include success feedback banners and explicit empty-state messaging.
- User profile module with editable personal details, avatar URL, and password change.
- Tenant profile module (for admin roles) with business fields and reminder templates.
- Reminder deeplinks now use tenant-managed SMS/WhatsApp templates with variables.
- Attachment UX improved with preview, lightbox open, and explicit download action.

## Security Rules
- Only existing registered users can sign in with Google/One Tap.
- If no matching registered account is found, sign-in is blocked.
- If a Google account is already linked by subject ID, that link is reused for future sign-ins.
- Tenant registration is restricted to `SUPER_ADMIN`.
- Tenant data operations are tenant-scoped in `/api/ledger`.
- Cross-tenant power operations are available only in `/api/admin`.

## Next Milestones
1. Plugin framework per tenant (enable/disable by super admin).
2. Notification/reminder plugin:
   - SMS and WhatsApp deeplink actions.
   - Prewritten message with customer balance and due details.
3. Attachment lifecycle:
   - Download links and previews.
   - Per-tenant storage quotas and retention.
4. Audit trail expansion:
   - Record all super-admin mutations.
   - Add timeline in admin UI.
5. Reporting:
   - Customer statements and exports.
   - Daily cash-flow summaries.

## Delivery Model (Product Team)

### Agent Ownership
- Product Manager Agent: scope, acceptance criteria, release decisions.
- Frontend Agent: UX, responsiveness, accessibility, i18n, performance.
- Backend Agent: API contracts, tenant isolation, auth, validation, persistence.
- QA Agent: regression suites and release readiness checklist.
- Release Agent: semantic versioning, release notes, and tagged cut.

### Standard Workflow
1. PM defines sprint goals and user-facing outcomes.
2. Frontend and Backend agents implement in parallel on scoped branches.
3. QA agent validates critical user journeys and regression checks.
4. Release agent bumps versions, updates notes, and cuts release tag.

### Non-Negotiable Quality Gates
- Frontend must pass: `npm run lint` and `npm run build`.
- Backend must pass: `mvn test`.
- All customer-impacting changes require release-note entry.
