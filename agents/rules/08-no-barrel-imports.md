# Rule 08: Avoid Barrel Imports

## Overview
Do not use barrel files (`index.ts`) to re-export multiple files from a single directory.

## Standards
1. **Import directly**: Always import from the specific file where the component or utility is defined.
   - ✅ `import { Button } from "@/components/ui/Button"`
   - ❌ `import { Button } from "@/components/ui"`
2. **Circular Dependencies**: Barrel files are the #1 cause of circular dependencies in large monorepos. Avoiding them ensures cleaner module boundaries.
3. **Tree Shaking**: Direct imports are easier for bundlers like Vite and Webpack to optimize.

## Why
This rule, enforced strictly in Cal.com, prevents the "spaghetti of death" in large monorepos and ensures that changing one component doesn't trigger a re-build of the entire directory.
