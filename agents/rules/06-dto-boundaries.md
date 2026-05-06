# Rule 06: DTO Boundaries

## Overview
Standardize data transmission between layers to prevent JPA entity leakage and ensure strict contract enforcement.

## Standards
1. **Separation**:
   - `RequestDTO`: For incoming data.
   - `ResponseDTO`: For outgoing data.
   - `Domain`: For internal business logic.
   - `Entity`: For database persistence.
2. **Translation**: Always use a mapping tool (e.g., MapStruct in Java, dedicated transform functions in TypeScript) for translation between layers.
3. **No Entities in API**: NEVER return a JPA Entity or Prisma Model directly from an API endpoint. This prevents accidental exposure of sensitive fields (e.g., password hashes, internal IDs).
4. **Validation**: Place validation constraints (`@NotNull`, `@Size`, etc. in Java; Zod schemas in TS) on the DTOs, not just the database models.

## Why
This allows the API contract to evolve independently of the database schema and ensures security by default.
