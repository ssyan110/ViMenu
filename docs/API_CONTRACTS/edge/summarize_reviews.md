# Edge Function Contract: summarize_reviews

## Request (JSON)
- `language_code: string`
- `reviews: Array<{ text: string }>`

## Response (JSON)
- `summary_text: string`
- `quota_remaining: number`
