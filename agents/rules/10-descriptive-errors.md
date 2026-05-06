# Rule 10: Descriptive Errors

## Overview
Errors should be actionable and provide enough context for debugging without exposing sensitive data.

## Standards
1. **No Generic Errors**: Avoid `throw new Error("Something went wrong")`.
2. **Contextual Info**: Include relevant IDs or state that caused the error.
   - ✅ `throw new ErrorWithCode(ErrorCode.BookingNotFound, "Booking with ID ${id} not found")`
3. **Decoupled Errors**: In `packages/features`, use errors that are independent of the transport layer (e.g., skip `TRPCError` in services).
4. **Validation Errors**: Use Zod or JSR-303 to provide specific field-level error messages.

## Why
Ensures that we can debug production issues quickly from logs and that users get helpful feedback when they make mistakes.
