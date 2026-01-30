# DB_SCHEMA — ViMenu (Source-of-truth: provided SQL schema)

> This document mirrors the **current database schema contract** as provided (context-only SQL). It is documentation, not a migration.

## 1) Core multi-tenant tables
- `public.tenants`
  - Columns: `id`, `name`, `created_at`

- `public.restaurants`
  - Columns: `id`, `tenant_id`, `name`, `slug`, `default_language` (default `vi`), `currency` (default `VND`), `created_at`
  - Constraints: `slug` unique

- `public.app_users`
  - Columns: `id`, `auth_user_id` (unique), `tenant_id`, `role user_role` (default `manager`), `email`, `created_at`
  - FKs: `auth_user_id → auth.users(id)`, `tenant_id → public.tenants(id)`

## 2) Subscription & language gating
- `public.subscription_plans`
  - Columns: `id`, `code` (unique), `name`, `created_at`

- `public.restaurant_subscriptions`
  - Columns: `id`, `restaurant_id` (unique), `tenant_id`, `plan_id`, `status` (default `active`), `current_period_start`, `current_period_end`, `created_at`
  - FKs: `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `plan_id → public.subscription_plans(id)`

- `public.restaurant_languages_enabled`
  - Columns: `id`, `restaurant_id`, `tenant_id`, `lang_code`, `enabled` (default `true`), `created_at`
  - FKs: `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

## 3) Menu versioning + uploads
- `public.menu_uploads`
  - Columns: `id`, `restaurant_id`, `tenant_id`, `file_path`, `file_type`, `status upload_status` (default `pending`), `error_message`, `created_by`, `created_at`
  - FKs: `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `created_by → public.app_users(id)`

- `public.menu_versions`
  - Columns: `id`, `restaurant_id`, `tenant_id`, `status menu_version_status` (default `draft`), `source_upload_id`, `published_at`, `created_by`, `created_at`
  - FKs: `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `source_upload_id → public.menu_uploads(id)`, `created_by → public.app_users(id)`

## 4) Menu data
- `public.categories`
  - Columns: `id`, `menu_version_id`, `restaurant_id`, `tenant_id`, `sort_order` (default `0`), `name_vi`, `created_at`
  - FKs: `menu_version_id → public.menu_versions(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

- `public.menu_items`
  - Columns: `id`, `category_id`, `menu_version_id`, `restaurant_id`, `tenant_id`, `sku`, `price`, `price_note`, `image_path`, `is_hidden` (default `false`), `name_vi`, `description_vi`, `created_at`
  - FKs: `category_id → public.categories(id)`, `menu_version_id → public.menu_versions(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

## 5) Translations & approval gate
> Guest-facing content must respect approval/confirmation flags:
> - translations: `approved=true`
> - signals (allergens/dietary/nutrition): `confirmed=true`

- `public.category_translations`
  - Columns: `id`, `category_id`, `restaurant_id`, `tenant_id`, `lang_code`, `name`, `source` (default `manual`), `ai_suggestion`, `approved` (default `false`), `approved_at`, `created_at`
  - FKs: `category_id → public.categories(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

- `public.item_translations`
  - Columns: `id`, `item_id`, `restaurant_id`, `tenant_id`, `lang_code`, `name`, `description`, `source` (default `manual`), `ai_suggestion`, `approved` (default `false`), `approved_at`, `created_at`
  - FKs: `item_id → public.menu_items(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

## 6) Allergens (master + translations + item mapping)
- `public.allergens`
  - Columns: `id`, `code` (unique), `display_vi`, `icon`, `created_at`

- `public.allergen_translations`
  - Columns: `id`, `allergen_id`, `lang_code`, `display`, `source` (default `manual`), `ai_suggestion`, `approved` (default `true`), `approved_at`, `created_at`
  - FKs: `allergen_id → public.allergens(id)`

- `public.item_allergens`
  - Columns: `id`, `item_id`, `restaurant_id`, `tenant_id`, `allergen_id`, `detected_by` (default `ai`), `confirmed` (default `false`), `created_at`
  - FKs: `item_id → public.menu_items(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `allergen_id → public.allergens(id)`

## 7) Dietary tags (master + translations + item mapping)
- `public.dietary_tags`
  - Columns: `id`, `code` (unique), `display_vi`, `created_at`

- `public.dietary_tag_translations`
  - Columns: `id`, `tag_id`, `lang_code`, `display`, `source` (default `manual`), `ai_suggestion`, `approved` (default `true`), `approved_at`, `created_at`
  - FKs: `tag_id → public.dietary_tags(id)`

- `public.item_dietary_tags`
  - Columns: `id`, `item_id`, `restaurant_id`, `tenant_id`, `tag_id`, `confirmed` (default `false`), `created_at`
  - FKs: `item_id → public.menu_items(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `tag_id → public.dietary_tags(id)`

## 8) Nutrition estimates
- `public.nutrition_estimates`
  - Columns: `id`, `item_id` (unique), `restaurant_id`, `tenant_id`, `calories`, `protein_g`, `fat_g`, `carbs_g`, `sodium_mg`, `source` (default `ai`), `confirmed` (default `false`), `created_at`
  - FKs: `item_id → public.menu_items(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

## 9) Badges
- `public.item_badges`
  - Columns: `id`, `item_id`, `restaurant_id`, `tenant_id`, `code <enum>`, `rank` (default `0`), `created_at`
  - FKs: `item_id → public.menu_items(id)`, `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`

## 10) Analytics
- `public.analytics_events`
  - Columns: `id`, `tenant_id` (nullable), `restaurant_id` (nullable), `event_name`, `properties jsonb` (default `{}`), `created_at`

## 11) Review summaries (Gemini)
- `public.review_summaries`
  - Columns: `id`, `restaurant_id`, `tenant_id`, `source` (default `manual_paste`), `input_text`, `summary jsonb` (default `{}`), `created_by`, `created_at`
  - FKs: `restaurant_id → public.restaurants(id)`, `tenant_id → public.tenants(id)`, `created_by → public.app_users(id)`

## 12) Notes / enums / constraints
- This schema references enums (USER-DEFINED) such as:
  - `user_role` (at least: `owner`, `manager`)
  - `upload_status` (at least: `pending`, `processing`, `completed`, `failed`)
  - `menu_version_status` (at least: `draft`, `published`, `archived`)
  - `item_badges.code` enum (not specified here)
- Public guest access should still be implemented via safe **views** (e.g. `public.public_menu_items`) and enforced with RLS.
