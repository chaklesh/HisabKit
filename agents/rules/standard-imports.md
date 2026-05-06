# Standard Import Rules

To ensure optimal build performance and prevent circular dependencies, HisabKit enforces strict import standards.

## Subpath Imports

Avoid "barrel" imports from package indexes. Import directly from the source file.

```typescript
// ✅ Good
import { Button } from "@hisabkit/ui/components/Button";
import { formatCurrency } from "@hisabkit/lib/utils/format";

// ❌ Bad
import { Button, Input } from "@hisabkit/ui";
import { formatCurrency } from "@hisabkit/lib";
```

## Type Imports

Always use `import type` when only the type definition is needed. This helps with tree-shaking and prevents unnecessary runtime overhead.

```typescript
// ✅ Good
import type { Customer } from "@hisabkit/types";

// ❌ Bad
import { Customer } from "@hisabkit/types";
```

## Relative vs Workspace Imports

-   **Within a package**: Use relative imports for files inside the same package.
-   **From an app to a package**: ALWAYS use the workspace name (`@hisabkit/*`).
-   **Within an app**: Use the `@/` alias (configured in `tsconfig.json` and Vite).

```typescript
// ✅ Good (Inside web app)
import { useAuth } from "@/modules/auth/hooks/useAuth";
```
