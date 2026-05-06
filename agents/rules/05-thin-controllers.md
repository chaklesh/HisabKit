# Rule 05: Thin Controllers (Spring Boot)

## Overview
Controllers should only be responsible for routing, HTTP mapping, and validation. Business logic belongs in the Service or Domain layer.

## Standards
1. **No Logic**: Controllers MUST NOT contain business logic, calculations, or complex data manipulations.
2. **Delegation**: Delegate to a Service for all operations:
   ```java
   @PostMapping
   public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
       return ResponseEntity.ok(userService.create(request));
   }
   ```
3. **Response Types**: Always return `ResponseEntity` for consistent status codes and headers (unless using a global response wrapper).
4. **Validation**: Use `@Valid` and JSR-303 annotations on Request DTOs.
5. **No Direct Entity Access**: Controllers should never receive or return JPA Entities. Use DTOs exclusively.

## Why
This ensures that business logic can be tested independently of the HTTP layer and reused by other consumers (e.g., internal scheduled jobs, background workers).
