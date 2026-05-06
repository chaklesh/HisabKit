# HisabKit Frontend

React + TypeScript frontend for HisabKit.

## Quick Start

1. Install dependencies
   - npm install
2. Start dev server
   - npm run dev
3. Run quality checks
   - npm run check

## Environment

Required variables are documented in .env.example.

- VITE_API_URL
- VITE_GOOGLE_CLIENT_ID

## Scripts

- npm run dev: start local development server
- npm run build: typecheck and production build
- npm run lint: lint TypeScript and React code
- npm run typecheck: TypeScript type check only
- npm run test: run unit tests
- npm run check: lint + typecheck + test + build

## Architecture Direction

- Keep code feature-oriented and modular.
- Keep domain types centralized.
- Keep API calls in services/API layer.
- Keep user-facing text in i18n locales.

See project policy:
- docs/frontend-engineering-playbook.md

## New Developer First Read

1. src/main.tsx
2. src/App.tsx
3. src/layout/AppShell.tsx
4. src/api/api.ts
5. docs/frontend-engineering-playbook.md

## Definition Of Done (Frontend)

- lint passes
- typecheck passes
- tests pass
- build passes
- no hardcoded user-facing strings for multilingual screens
- no new duplicate domain types
