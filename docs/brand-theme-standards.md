# Brand Theme Standards

**Owner:** Architect  
**Last Updated:** 2026-04-10

## Purpose

Define one brand and UI theme system for backend-integrated web and mobile products so all agents build a consistent experience.

## Brand Foundations

- Product name: HisabKit.
- Tone: practical, trustworthy, fast for daily operator workflows.
- UX principle: task-first workflows over decorative layouts.

## Mandatory Design Token Strategy

All visual styling must derive from centralized tokens. No direct ad-hoc color/spacing/typography literals in feature code for reusable surfaces.

### Token Sources

- Web: central token layer in CSS/Tailwind variables and shared UI style utilities.
- Mobile: tokenized theme objects under `src/theme/*`.

### Required Token Groups

- Color: primary, secondary, semantic (success/warning/error/info), surface, text, border.
- Typography: family, size scale, weight, line-height.
- Spacing: 4/8-based scale.
- Radius: component corner scale.
- Elevation: shadow/overlay scale.
- Motion: duration/easing presets.

## Theme Consistency Rules

- Reuse existing shell patterns for module screens (header, summary strip, content sections).
- Keep navigation behavior and interaction states consistent across modules.
- No one-off page palette unless Architect-approved and documented.
- New UI components should be composed from shared primitives before adding bespoke styles.

## Brand Review Checklist (Required For UI Work)

1. Uses centralized tokens only.
2. Matches shell/navigation conventions.
3. Preserves accessibility contrast and readable hierarchy.
4. Supports i18n expansion without broken layout.
5. Mobile and web maintain equivalent visual intent.

## Approval Rule

Any major visual language shift (new palette family, typography system, or global layout behavior) requires Architect approval via `docs/architecture-decisions.md` before implementation.
