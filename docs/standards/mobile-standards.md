# Mobile Standards

**Last Updated:** 2026-04-14  
**Owner:** Mobile Architecture

## Purpose

Define the mobile quality bar so the app behaves like a first-class product surface, not a reduced companion app.

## Architecture Standard

The mobile app should also follow a modular monolith pattern:

- `src/app`: bootstrap, providers, navigation, auth or session wiring
- `src/modules/<module>`: screen flows, hooks, services, view models, types
- `src/shared`: API client, config, theme, device adapters, utilities

Current repository note:
The app already has useful shared layers such as config, navigation, and theme context, but it still needs clearer module ownership and stronger parity with the web app’s product model.

## Parity Rules

Web and mobile do not need identical layouts, but they must share:

- product vocabulary
- domain rules
- transaction semantics
- settings model where practical
- localization model
- theme model

## State And Data Rules

- server state should move toward TanStack Query for parity and predictability
- local device storage must be treated as cache, draft storage, or preference storage
- offline behavior must be explicit; if a workflow is online-only, the app must say so clearly
- sensitive tokens or secrets must use secure storage, not general async storage

## Screen Design Rules

- prioritize thumb-friendly primary actions
- keep high-frequency operator flows short
- do not overload screens with desktop-style density
- loading, empty, sync, and failure states must be visible and actionable

## Device Integration Rules

- platform permissions must be requested just-in-time
- document picker, image picker, auth session, and local auth flows must fail gracefully
- device-specific behavior must be wrapped behind stable app-side adapters when it grows beyond simple use

## Testing Standard

Target baseline:

- TypeScript strictness stays enabled
- component and screen behavior tests are introduced
- critical-path smoke automation is added with a pragmatic tool such as Maestro

## Release Standard

- builds must be reproducible through Expo or EAS configuration
- environment configuration must be explicit per target environment
- app versioning and backend compatibility windows must be documented before release

## Current Gap Notes

- mobile currently relies mostly on type safety and manual verification
- stronger testing, secure token handling, and module boundaries are still needed
- the goal is parity in product quality, not visual duplication
