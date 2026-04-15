# API Governance

**Last Updated:** 2026-04-14  
**Owner:** Backend Architecture

## Purpose

Define how APIs are designed, versioned, documented, consumed, and changed.

## Ownership

- backend owns canonical request and response contracts
- OpenAPI is the published contract artifact
- web and mobile consume contracts and may add presentation types, but not conflicting domain fields

## API Design Rules

- use stable, descriptive resource naming
- keep auth and authorization explicit
- keep tenant scoping explicit in behavior even when not shown in route paths
- use DTOs rather than exposing persistence models directly
- use consistent pagination, filtering, and sorting patterns

## Error Contract

Every non-2xx response should fit a stable error structure with:

- timestamp
- status
- error code or title
- user-safe message
- path
- validation details when relevant
- trace or correlation identifier when available

## Compatibility Rules

- additive changes are preferred
- breaking changes require an ADR and a rollout plan
- enum changes, auth changes, and payload shape changes must be treated as compatibility events
- if consumers cannot be updated in the same work package, the change is not ready

## Documentation And Change Flow

For any API-impacting work:

1. update this document if the policy or contract shape changes materially
2. update OpenAPI and backend DTO or controller definitions
3. update all impacted consumers
4. update delivery docs if timeline or scope changes

## Testing Expectations

- contract-sensitive endpoints need automated tests
- tenant-sensitive endpoints need isolation tests
- privileged endpoints need authorization tests
- critical user flows should have consumer smoke coverage on top of backend tests

## Current Gap Notes

- API governance exists conceptually, but it still needs stronger enforcement through automated contract validation and broader consumer smoke coverage
