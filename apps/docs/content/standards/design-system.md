# Design System

**Last Updated:** 2026-04-26 | **Owner:** Product Design + Frontend/Mobile Architecture

---

## Design Principles

- **Practical over flashy.** Business operators need clarity, not spectacle.
- **Trustworthy over decorative.** Financial context demands visual reliability.
- **Dense enough for business use, never cramped.** Information-rich without overwhelming.
- **Accessible by default.** Every design decision must pass keyboard and screen-reader requirements.
- **Localization-ready by default.** No layout assumptions tied to English text length.

---

## Token System

All UI styling must derive from design tokens. Raw literals are not permitted in module code.

| Token Category | Examples |
|---|---|
| Color | `--color-primary`, `--color-surface`, `--color-destructive` |
| Typography | `--font-size-sm`, `--font-weight-semibold`, `--font-family-base` |
| Spacing | `--spacing-2`, `--spacing-4`, `--spacing-8` (4px grid) |
| Border Radius | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Elevation / Shadow | `--shadow-sm`, `--shadow-card`, `--shadow-dialog` |
| Motion | `--duration-fast`, `--duration-normal`, `--easing-default` |

**Web:** Tokens live in `src/index.css` as HSL CSS custom properties. Supports dark/light/system theme modes.

**Mobile:** Tokens live in `shared/theme/` as TypeScript constants. Same conceptual vocabulary, platform-native implementation.

---

## Web UI Standard

**Use shadcn/Radix primitives** as the default for all interactive controls:
- Dialogs, popovers, tooltips → Radix Dialog, Popover, Tooltip
- Tables → TanStack Table + shadcn Table primitives
- Forms → shadcn Form + React Hook Form + Zod
- Toasts / notifications → shadcn Toast
- Tabs → Radix Tabs with shadcn styling

**Rules:**
- Product modules consume primitives — they do not reinvent controls
- Never apply raw Tailwind utility classes for complex layout — use component slots and token-based classes
- Component variants should be defined in the primitive, not inline in module code

---

## Mobile UI Standard

- Use centralized theme tokens from `shared/theme/` — never hardcode colors, sizes, or fonts
- Equivalent UI intent must match the web app's visual vocabulary
- Standardize these common patterns before building module-specific variations:

| Pattern | Status |
|---|---|
| Page headers | 🟡 Partially standardized |
| Section cards | 🟡 Partially standardized |
| Form rows | 🔴 Not yet standardized |
| Alert / feedback states | 🔴 Not yet standardized |
| Empty states | 🟡 Partially standardized |

---

## Content Standards

| Rule | Detail |
|---|---|
| Language | Avoid finance jargon when plain business language works |
| Labels and actions | Short, decisive verbs ("Record Payment", "Delete Customer") |
| Destructive actions | Always explicit — never buried in menus without confirmation |
| Financial impact | Show balance impact before any balance-altering action |
| Status and urgency | Never conveyed by color alone; always paired with text or icon |
| Localization | All copy is externalized to i18n resource files — no hardcoded strings in JSX/TSX |

---

## Accessibility Standard

**Web:**
- Keyboard navigation on all interactive elements
- Semantic HTML with proper heading hierarchy per page
- ARIA labels for icon-only buttons and non-obvious interactive elements
- Visible focus indicators on all focusable elements
- Color contrast minimum AA (WCAG 2.1)

**Mobile:**
- `accessibilityLabel` on all interactive elements
- Readable touch targets (minimum 44x44 pt)
- Clear status messaging for loading, error, empty states

---

## Design Governance

Changes to the following require an ADR entry and an update to this file:
- Core brand direction (color palette, typography)
- Token system structure or naming
- Shared component behavior that affects all modules
- Accessibility posture changes
