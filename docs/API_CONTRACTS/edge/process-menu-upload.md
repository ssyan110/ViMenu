# Edge Function Contract: process-menu-upload

## Request (JSON)
- `upload_id: string` (uuid)
- `tenant_id: string` (uuid)
- `restaurant_id: string` (uuid)
- `file_path: string`

## Response (JSON)
- `job_id: string` (uuid)
- `status: "queued" | "processing" | "failed" | "done"`
