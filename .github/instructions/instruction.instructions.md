# ViMenu — Copilot Instructions

You are an AI coding assistant working inside this repository.
Your primary goal is to implement features that match the BRD and the existing contracts, producing maintainable, scalable, testable code.

## 0) Source of Truth (read-first)
Before making changes, ALWAYS consult:
1) docs/TECHSTACK.md (current stack, libraries, patterns, folder conventions)
2) docs/BRD_DIGEST.md (scope, user roles, flows, acceptance criteria, non-functional requirements)
3) docs/API_CONTRACTS/** (request/response schemas, error format, versioning rules)
4) docs/DB_SCHEMA.md or /migrations/** (database schema + migration order)
5) docs/adr/** (architectural decisions; do not violate existing ADRs)

If instructions conflict:
- Prefer ADR > API_CONTRACTS > DB schema > BRD_DIGEST > TECHSTACK.
- If still unclear, create a note in docs/questions.md and implement the smallest safe change with TODO markers.

## 1) Non-negotiable Rules
### 1.1 Contracts are immutable by default
- DO NOT change docs/API_CONTRACTS/** unless explicitly requested.
- If contract change is necessary: propose a diff + migration plan + backward compatibility plan.

### 1.2 Repository boundaries
- Keep strict boundaries between apps, services, and shared packages.
- Shared types/schemas belong in packages/shared or the location defined in docs/TECHSTACK.md.
- No cross-layer imports that bypass the designated interfaces.

### 1.3 Maintainability standards
- Prefer small, composable modules with clear ownership.
- Business logic must be isolated from UI and infrastructure.
- Use dependency injection and interfaces; avoid hidden singletons and global state.

### 1.4 Testing is mandatory
- Every non-trivial business rule must have unit tests.
- Integration tests are required for DB queries, API handlers, and critical pipeline steps.
- Tests must be deterministic (no network calls; mock time/randomness).

### 1.5 Observability and error handling
- Use consistent error envelope and error codes as defined in docs/API_CONTRACTS.
- Add structured logging with a correlation/trace id if the stack supports it.
- Never swallow errors silently.

### 1.6 Performance + security
- Respect BRD non-functional requirements (latency targets, offline-first rules, access control).
- Enforce tenant isolation and published/draft visibility rules strictly.
- Validate inputs at boundaries (API, worker entrypoints, UI forms).

## 2) Implementation Workflow (how you should respond)
For any feature request, follow this sequence:

### Step A — Plan first (no code)
Return:
- A short summary of the feature and the BRD section it maps to (from docs/BRD_DIGEST.md)
- Files/modules you will touch (with paths)
- API/DB/schema impact (must reference docs/API_CONTRACTS or migrations)
- Test plan (unit/integration), including test file paths
- Risk/edge cases and how you will handle them

### Step B — Implement
- Implement in small commits/patches.
- Keep functions pure where possible.
- Add tests in the same change set.
- Update docs/adr/** if you make architectural choices not already documented.

### Step C — Final checklist in your response
- What changed
- Tests added and how to run them
- Any migrations and how to apply them
- Any follow-up TODOs (must be explicitly labeled)

## 3) Code Style and Quality Gates
Follow the style tooling specified in docs/TECHSTACK.md.
General requirements:
- Consistent naming; no abbreviations that reduce clarity.
- No duplicate logic; factor out shared behavior.
- Prefer typed models and explicit schemas for IO.
- Keep functions under reasonable length; extract helpers.

## 4) Feature-specific guardrails (ViMenu domain)
Apply these domain rules unless explicitly overridden by BRD/ADR:
- Guest users can only read published menu versions.
- Admin actions must be authorized and tenant-scoped.
- AI outputs must be traceable and reviewable; human approval is the source of truth for “approved” data.
- Offline-first: cached data must be versioned (restaurant_slug + menu_version_id + language).

## 5) When you are uncertain
If a requirement is ambiguous:
- Do not guess big design changes.
- Propose 1–2 safe options and recommend the least risky one.
- Record the question in docs/questions.md with context and assumptions.
