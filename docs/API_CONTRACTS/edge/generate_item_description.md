# Edge Function Contract: generate_item_description

## Request (JSON)
- `item_id: string` (uuid)
- `language_code: string` (e.g. `en`)
- `tone: string`
- `overwrite?: boolean` (default `false`)

## Response (JSON)
- `suggested_description: string`
- `quota_remaining: number`
