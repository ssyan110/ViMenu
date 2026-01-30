# Migrations (Supabase/Postgres)

This folder is reserved for SQL migrations (schema, RLS policies, RPCs).

> Note: The current repo did not include migrations at generation time. Add numbered SQL files here when implementing Supabase.

Recommended naming:
- `0001_init.sql`
- `0002_rls_policies.sql`
- `0003_rpc_publish_menu_version.sql`

Keep RLS enabled and enforce tenant isolation. Do not grant anon access to base tables; expose public read via safe views.
