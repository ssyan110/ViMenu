# RPC Contract: publish_menu_version

## Name
`publish_menu_version(version_id uuid)`

## Purpose
Atomically publish a draft menu version, ensuring **exactly one** published version per restaurant.

## Security requirements (mandatory)
Function is typically `SECURITY DEFINER` and must:
- Verify caller is `authenticated`.
- Map `auth.uid()` → `app_users`.
- Verify tenant match: `app_users.tenant_id == menu_versions.tenant_id`.
- Verify role allowed: `owner | manager`.
- Allow only `menu_versions.status='draft'`; otherwise return **409**.

## Behavior
Within a transaction:
1) Archive current published version for the same restaurant.
2) Publish the target version (set `status='published'`, `published_at=now()` and `published_by`).

## Errors
- `401` unauthenticated
- `403` forbidden (tenant mismatch / role not allowed)
- `409` conflict (version not draft, or invalid state)
