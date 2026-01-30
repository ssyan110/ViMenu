# ADR 0001 — Clean Architecture Layering

## Status
Accepted

## Context
The BRD requires maintainable code with strict separation between UI and business rules, and Supabase as backend with multi-tenant RLS.

## Decision
We follow a Clean Architecture style layering in application code:
- `domain`: types + pure business rules
- `application`: use-cases orchestrating domain + data
- `data`: infrastructure clients (Supabase REST/RPC/Edge)
- `ui`: React components/hooks

Dependency direction: UI → application → data → external.

## Consequences
- Business rules (VN fallback, confirmed/approved visibility, plan gating) must not be implemented directly inside UI components.
- Data layer must not import UI.
