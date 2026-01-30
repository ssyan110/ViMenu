# TECHSTACK — ViMenu

## Overview
This repository currently contains:
- `apps/guest-pwa`: Next.js (App Router) + TypeScript + TailwindCSS PWA for guest menu browsing.
- `mcp/supabase-rest`: Node.js service used as an MCP server (developer tooling).

## Frontend
### Guest PWA (`apps/guest-pwa`)
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: TailwindCSS
- Linting: ESLint
- Data fetching: `fetch` (TanStack Query may be added later if desired)

## Backend / Data
- Supabase (Postgres + PostgREST + RLS) is the intended backend, but DB/migrations are not yet present in this repo.

## Architectural conventions (target)
Clean Architecture layering for app code:
- `src/domain`: pure types + business rules (no React/Next imports)
- `src/application`: use-cases/services that orchestrate domain + data
- `src/data`: infrastructure clients (Supabase REST/RPC/Edge Functions)
- `src/ui`: React components/hooks/screens

## Notes
- This file is generated from `.github/instructions/instruction.instructions.md` and reflects current repo structure.
- If/when adding an Admin Web app or Supabase migrations, update this document accordingly.
