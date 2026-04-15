# Design System Standards

**Last Updated:** 2026-04-14  
**Owner:** Product Design + Frontend/Mobile Architecture

## Purpose

Define one product language for web and mobile so the product stays coherent as modules grow.

## Design Principles

- practical over flashy
- trustworthy over decorative
- dense enough for business use, but never cramped
- accessible by default
- localization-ready by default

## Token Standard

All reusable UI must derive from tokens for:

- color
- typography
- spacing
- radius
- elevation
- motion

Raw styling literals may appear only in truly isolated one-off experiments and must be removed before merge.

## Web UI Standard

- shared primitives should be composed using shadcn with accessible Radix-style behavior
- product modules should consume primitives, not reinvent controls
- tables, dialogs, toasts, tabs, and forms should converge on shared patterns

## Mobile UI Standard

- mobile must use a centralized theme and token model
- equivalent UI intent should match the web app even when components differ
- common patterns such as page headers, section cards, form rows, alerts, and empty states must be standardized

## Content Standard

- avoid jargon where plain business language works
- labels and actions should be short and decisive
- destructive actions must be explicit
- financial impact should be visible before commit
- all copy must support localization

## Accessibility Standard

- keyboard and screen-reader support on web
- semantic labels and focus management on web
- readable touch targets and clear status messaging on mobile
- color must never be the only signal for status or urgency

## Design Governance

Changes that affect core brand direction, token system, or shared component behavior require:

- an ADR entry
- updates to this file
- updates to the relevant platform standard if implementation rules change

## Current Gap Notes

- the repository has the beginnings of shared theming and shared primitives
- the next maturity step is wider convergence around shared form, table, feedback, and shell patterns
