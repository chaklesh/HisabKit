# Rule 02: UI Standardization (Shadcn/Radix)

## Overview
HisabKit uses a premium, minimal UI aesthetic based on **Shadcn/UI** and **Radix UI**. Consistency is paramount.

## Standards
1. **Prefer Primitives**: ALWAYS check `src/components/ui/` or `packages/ui` for a primitive before writing raw Tailwind HTML.
2. **Design Language**: 
   - Use `Card` for containers.
   - Use `sonner` for all notifications/toasts.
   - Use `Button` for all actions.
   - Use `Input` and `Label` for all forms.
3. **Theming**:
   - Always support Light/Dark/System modes.
   - Use HSL colors defined in `tailwind.config.js` via CSS variables.
4. **Spacing**:
   - Use standard Tailwind spacing scales. Avoid magic numbers.

## Prohibited
- Do not use `alert()` or `prompt()`.
- Do not use inline `style` props unless for dynamic positioning.
- Do not create new "Alert" or "Button" styles that drift from the design system.
