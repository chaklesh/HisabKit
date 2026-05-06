# Rule 09: Guard Clauses & Early Returns

## Overview
Use guard clauses to exit functions early when preconditions are not met.

## Standards
1. **Flatten Logic**: Avoid deeply nested `if/else` blocks.
   - ✅ `if (!user) return null;`
   - ❌ `if (user) { if (admin) { ... } }`
2. **Error First**: Handle error cases or edge cases at the top of the function.
3. **Implicit Success**: The final part of your function should be the "happy path" logic, minimizing indentation.

## Why
This makes code significantly more readable and reduces cognitive load by keeping the main logic at the leftmost indentation level.
