# API_CONTRACTS — ViMenu

Contracts are **immutable by default**. Only change when explicitly requested.

This folder documents request/response shapes and error envelopes for client ↔ backend boundaries:
- Supabase RPCs
- Supabase Edge Functions

## Error envelope (recommended)
If not already defined elsewhere, prefer:
```json
{ "error": { "code": "...", "message": "...", "details": {} } }
```

See individual contract files for shapes.
