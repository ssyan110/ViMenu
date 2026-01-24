---
applyTo: "**"
---

# ViMenu (Vimenu) — Copilot Agent Instructions

Bạn đang làm việc trong dự án SaaS “Vimenu”: PWA menu QR đa ngôn ngữ (song ngữ) + AI số hoá menu + cờ dị ứng + dinh dưỡng (theo gói) + Gemini tạo mô tả & tóm tắt review.

Mục tiêu khi bạn (AI agent) tạo/chỉnh code:

- Ưu tiên triển khai đúng scope, đúng kiến trúc Supabase, và có thể ship.
- Không tự ý thêm tính năng ngoài phạm vi (NO POS/Payment/Order-to-kitchen/Invoice/Inventory/Booking/Staff scheduling).
- Luôn tuân thủ multi-tenant isolation bằng RLS.

## BRD Guardrails (BẮT BUỘC — BRD v1.1, 05/10/2025)

Mục này là “hàng rào sản phẩm” để AI không lệch phạm vi. Nếu có xung đột giữa BRD và thực tế implementation, ưu tiên:

1. Scope/NFR/Acceptance criteria từ BRD
2. Kiến trúc + schema Supabase hiện tại trong repo (source-of-truth kỹ thuật)

### In-scope (chỉ triển khai những nhóm này)

- Guest PWA: G-01..G-05
  - G-01 QR & onboarding (infographic lần đầu, bỏ qua được)
  - G-02 Song ngữ (VN + ngôn ngữ chọn; ngôn ngữ theo gói)
  - G-03 Chi tiết món (giá, mô tả, dị ứng, dinh dưỡng theo gói)
  - G-04 “Món của tôi” (danh sách tạm để đưa cho nhân viên)
  - G-05 Lọc ăn kiêng/tôn giáo (Halal/Kosher/Ăn chay/Thuần chay/Không Gluten) — tag phải admin xác nhận

- Admin Web: A-01..A-04
  - A-01 Upload & số hoá menu (PDF/JPG/PNG/XLS/CSV)
  - A-02 Chỉnh sửa thủ công + Publish
  - A-03 Gemini tạo mô tả món (gói Professional/Performance)
  - A-04 Gemini tóm tắt review (gói Performance)

### Out-of-scope (TUYỆT ĐỐI KHÔNG THÊM)

- Không POS, không thanh toán, không gửi order xuống bếp, không hoá đơn bàn.
- Không quản lý tồn kho.
- Không lịch nhân viên/chấm công.
- Không đặt chỗ.

### UX/Business rules then chốt

- “Món của tôi” chỉ là danh sách giao tiếp: **không có tổng tiền**, không tính tổng/subtotal, không tạo order trên server.
- Song ngữ: luôn có tiếng Việt; nếu thiếu dịch thì fallback VN.
- Dị ứng/dinh dưỡng/dietary tags:
  - Guest chỉ thấy các bản ghi đã được xác nhận/duyệt: `confirmed=true` (allergens/nutrition/tags) và `approved=true` (translations).

### Non-functional requirements (NFR)

- Guest PWA: P95 load ≤ 2.5s (ưu tiên “truy cập lại” sau cache warm).
- Offline: dùng được sau lần tải đầu (cache app shell + published menu).
- Availability: 99.9%.
- Security: TLS; RBAC cho admin; multi-tenant isolation (RLS) bắt buộc.

Ghi chú: BRD có mô tả stack kỹ thuật cũ (Flutter/Python/Node). Dự án hiện tại chuẩn hoá theo Next.js + Supabase; chỉ phần nghiệp vụ/UX/NFR của BRD là ràng buộc.

## 1) Tech stack chuẩn hoá (BẮT BUỘC)

## 1.1) Kiến trúc code (Clean Architecture — BẮT BUỘC)

Yêu cầu chung: code theo hướng **dễ scale và maintain**. Ưu tiên tách lớp rõ ràng, giảm coupling, tránh “logic rải khắp UI”.

Nguyên tắc:

- **Domain-first**: business rules (fallback ngôn ngữ, confirmed/approved visibility, publish rules, out-of-scope) nằm ở domain/service layer, không nhúng thẳng vào component.
- **Thin UI**: UI chỉ lo render + gọi hooks/use-cases; không trực tiếp thao tác Supabase/SQL ở nhiều chỗ.
- **Single source of truth**: định nghĩa types/contracts (DTO) và rules ở một nơi; tái sử dụng, không copy-paste.
- **Dependency direction**: UI → application (use-cases) → data (supabase client / fetch). Không để data layer import UI.
- **Error handling chuẩn**: chuẩn hoá error codes/messages (401/403/409/402) và mapping sang UI states.

Gợi ý tổ chức (không bắt buộc nếu repo đã có pattern khác):

- `src/domain/`: types, pure functions, business rules (no React/Next imports)
- `src/application/`: use-cases/services (orchestrate domain + data)
- `src/data/`: Supabase queries, PostgREST clients, edge function callers
- `src/ui/`: components, pages/routes, hooks (compose use-cases)

Quy tắc scale/maintain:

- Mọi truy vấn public menu nên đi qua **một** gateway/hook (TanStack Query) thay vì gọi rải rác.
- Mọi gọi Edge Function/RPC nên đi qua **một** client wrapper có timeout/retry/backoff hợp lý.
- Không “đổi schema” tuỳ tiện trong code: bám đúng schema hiện tại; nếu cần thay đổi DB → migration SQL rõ ràng.

### Guest PWA (Frontend)

- Next.js (App Router) + TypeScript
- PWA: `next-pwa` (Workbox) hoặc tự cấu hình service worker (ưu tiên `next-pwa` nếu repo đã dùng)
- UI: TailwindCSS + shadcn/ui
- Data fetching: `fetch` + TanStack Query (React Query)
- i18n hiển thị song ngữ: tự quản lý (toggle lang + render VN + ngôn ngữ chọn). Không bắt buộc `next-intl`.

### Admin Web (Frontend)

- Next.js (App Router) + TypeScript
- Auth UI: Supabase Auth UI hoặc custom form
- Form: React Hook Form + Zod
- Table/edit: TanStack Table + inline editing
- Upload: direct upload Supabase Storage (signed URL)

### Backend (Supabase)

- Postgres + Row Level Security (RLS) cho multi-tenant isolation
- Supabase Auth (email/password)
- Supabase Storage (menu uploads, item images)
- REST API: PostgREST (auto REST từ tables/views) + RPC (SQL functions)
- Supabase Edge Functions (Deno) cho:
  - AI pipeline orchestrator: OCR/parse/translate/allergen/nutrition (async job pattern)
  - Gemini generate item description
  - Gemini summarize reviews
  - webhook/cron (nếu cần)

## 2) Kiến trúc hệ thống (theo stack mới)

Guest PWA (Next.js) → Supabase REST (PostgREST) → Postgres (RLS)
│ │
│ └→ Storage (uploads/images)
└→ (PWA caching/offline)

Admin Web (Next.js) → Supabase Auth + REST
└→ Supabase Edge Functions (AI jobs / Gemini)

Nguyên tắc:

- CRUD chuẩn (menu/items/translations/tags) đi qua PostgREST trực tiếp tables/views và bị chặn bằng RLS.
- Nghiệp vụ có side-effects/atomicity/permission phức tạp (publish version, AI jobs, Gemini) đi qua Edge Functions hoặc RPC.

## 3) Multi-tenant strategy trên Supabase (BẮT BUỘC)

### Data model tenant

- `tenants(id)`
- `restaurants(id, tenant_id, slug, ...)`
- Mọi bảng nghiệp vụ nên có `tenant_id` trực tiếp (không chỉ suy ra từ `restaurant_id`) để RLS đơn giản và query nhanh.

### Auth mapping & claims

- Map `auth.users.id` → `app_users.id`.
- `app_users` bắt buộc có: `tenant_id`, `role`.
- Source-of-truth theo schema hiện tại: enum `user_role` chỉ có `owner` | `manager`.
- Mọi query/admin route phải dựa vào `auth.uid()` và join `app_users` để xác định tenant.

### RLS policies (nguyên tắc)

- Admin (đã login): chỉ SELECT/INSERT/UPDATE/DELETE dữ liệu thuộc `tenant_id` của họ.
- Public/Guest (anon): chỉ SELECT các bản ghi thuộc menu **published** và đúng `restaurant.slug`.
- Tuyệt đối không mở anon access vào tables thô nếu chưa có RLS chặt.

Lưu ý khi AI sửa DB/RLS:

- Không tắt RLS.
- Không dùng “security definer” bừa bãi; nếu có RPC publish thì phải kiểm tenant/role.

Lưu ý quan trọng về helper function trong RLS:

- Schema hiện tại có helper `public.current_tenant_id()` lấy tenant từ `app_users` theo `auth.uid()`.
- Nếu dùng function trong policy, role chạy policy (thường là `authenticated`) phải có quyền EXECUTE function đó; tránh revoke quá tay làm policy fail.

## 4) Mapping tính năng → Supabase implementation

### Guest PWA

- G-01 QR & onboarding
  - Route: `/r/[slug]`
  - Fetch public config + published menu (qua views an toàn)
  - Onboarding flag: `localStorage` key `vimenu_onboarded_{restaurantId}`

- G-02 Song ngữ
  - Guest đọc translations qua public VIEW (khuyến nghị) để chỉ thấy bản đã duyệt
  - Theo schema hiện tại: `item_translations.approved=true` mới được public
  - Fallback nếu thiếu translation: VN (vi)

- G-03 Chi tiết món
  - Query item detail + allergens + nutrition + visibility (đều là published)

- G-04 “Món của tôi”
  - Local state only (`localStorage`/`sessionStorage`)
  - Business rule: **không có total price**, không tính tổng tiền.

- G-05 Lọc ăn kiêng
  - Query theo tags: `item_dietary_tags.confirmed=true`
  - UI filter chỉ dựa trên tags đã confirmed

### Admin Web

- A-01 Upload & số hoá menu
  - Upload file → Supabase Storage path: `menu_uploads/{tenantId}/{restaurantId}/{uploadId}`
  - Create row `menu_uploads(status='pending'|'processing')` (schema: `upload_status` = pending/processing/completed/failed)
  - Call Edge Function `process-menu-upload` (async job pattern)

- A-02 Edit & Publish
  - Edit trực tiếp tables: `categories`, `menu_items`, `item_translations`, `item_dietary_tags`, `item_allergens`
  - Publish = RPC `publish_menu_version(version_id)` để atomic switch

- A-03 Gemini mô tả món
  - Edge Function `generate_item_description`
  - Response trả `suggested_description`
  - Admin approve → ghi vào `item_translations.description`

- A-04 Gemini review summary
  - Edge Function `summarize_reviews`
  - Lưu vào `review_summaries`

## 5) DB schema tối thiểu (phù hợp Supabase)

Schema **đang dùng trong dự án** (source of truth) — hãy bám đúng tên bảng/cột/enum sau khi code:

- Multi-tenant
  - `tenants(id, name, created_at)`
  - `restaurants(id, tenant_id, name, slug, default_language, currency, created_at)`
  - `app_users(id, auth_user_id, tenant_id, role user_role, email, created_at)`

- Subscription & language gating
  - `subscription_plans(code: basic|professional|performance, name, ...)`
  - `restaurant_subscriptions(restaurant_id unique, tenant_id, plan_id, status, current_period_*)`
  - `restaurant_languages_enabled(restaurant_id, tenant_id, lang_code, enabled)`

- Menu versioning
  - `menu_versions(status menu_version_status = draft|published|archived, published_at, source_upload_id, ...)`
  - `menu_uploads(status upload_status = pending|processing|completed|failed, file_path, file_type, error_message, created_by, ...)`

- Menu data
  - `categories(menu_version_id, restaurant_id, tenant_id, sort_order, name_vi, ...)`
  - `menu_items(category_id, menu_version_id, restaurant_id, tenant_id, price nullable, price_note, image_path, is_hidden, name_vi, description_vi, ...)`
  - `item_translations(item_id, restaurant_id, tenant_id, lang_code, name, description, source, ai_suggestion, approved, approved_at, ...)`

- Confirmed signals (guest chỉ nên thấy confirmed)
  - `item_allergens(confirmed boolean, detected_by ai/manual, ...)` + master `allergens(code, display_vi, icon)`
  - `nutrition_estimates(confirmed boolean, calories/macros, ...)`
  - `item_dietary_tags(confirmed boolean, ...)` + master `dietary_tags(code, display_vi)`

Giữ schema theo Functional Spec, nhưng bổ sung để phục vụ RLS/audit:

- Các bảng chính có: `tenant_id`, `created_at`, `updated_at`, `created_by` (nếu phù hợp)
- Status rõ ràng: `draft/published/hidden/processing/failed`

Ghi chú: schema hiện tại đã có `created_at` rộng rãi và có `created_by` ở một số bảng; `updated_at`/audit mở rộng có thể bổ sung ở migration sau.

Versioning/publish:

- `menu_versions(id, restaurant_id, tenant_id, status, published_at, published_by)`
- Ràng buộc: mỗi `restaurant_id` chỉ có **1** version `status='published'` (enforce bằng transaction trong RPC).

## 6) API strategy (Supabase REST) — quy ước thực thi

### Public read (Guest)

- Không dùng anon key để gọi trực tiếp mọi table.
- Tạo VIEW expose an toàn.
- Theo schema hiện tại: dùng view `public.public_menu_items` (đã join `menu_versions` published và lọc `menu_items.is_hidden=false`).
- Public view nên chỉ trả:
  - `item_translations` đã `approved=true`
  - allergens/nutrition/dietary tags đã `confirmed=true`
- Guest query nên dựa trên `restaurant_slug` và `menu_version_id` trong view.

### Admin read/write

- PostgREST trực tiếp tables + RLS theo tenant.

### Actions đặc biệt

- RPC:
  - `publish_menu_version(version_id uuid)` (atomic switch)
- Edge Functions:
  - `process-menu-upload`
  - `generate_item_description`
  - `summarize_reviews`

Quy ước error:

- 401: chưa đăng nhập (admin endpoints)
- 403: không đủ quyền / khác tenant
- 409: conflict/validation (ví dụ publish khi draft invalid)
- 402: vượt quota/gating theo plan (nếu đã implement subscription gating)

## 7) Non-functional (Next.js + Supabase)

### Performance (Guest)

- P95 ≤ 2.5s (ưu tiên “lần truy cập lại” sau cache warm)
- Next.js caching theo route segment nếu phù hợp
- Prefetch menu JSON nhẹ (categories + item summary)
- Images: `next/image` + lazy
- CDN: Supabase Storage + caching headers

### Offline

- `next-pwa` cache:
  - app shell
  - dữ liệu JSON cho `/r/[slug]` (published menu)
- Strategy:
  - First visit online: cache menu
  - Offline later: serve cached menu
  - Reconnect: stale-while-revalidate (refresh theo `menu_version`)

### Availability

- 99.9%: dựa vào Supabase managed; bổ sung monitoring
- Edge Function logs + alert theo error rate

### Security

- TLS mặc định
- RLS bắt buộc
- Password hashing do Supabase Auth
- Audit log: table `audit_logs` (tối thiểu cho publish/edit quan trọng)

## 8) MVP build order (đúng scope)

Phase 1 (MVP):

- Tenant/Auth/RLS nền
- Public published menu read (views)
- Guest PWA: G-01..G-04
- Admin: A-01 upload (manual edit ok), A-02 publish
- Translation cơ bản + fallback VN
- Allergen flags + admin confirm
- Analytics events basic

Phase 2:

- Gemini A-03 + A-04
- Nutrition estimates nâng cấp
- Analytics dashboard đầy đủ

## 9) Assumptions tối thiểu (an toàn)

- OCR/parse/translate/allergen/nutrition chạy qua Edge Function nhưng theo “job queue pattern”:
  - Edge Function chỉ tạo job + cập nhật status
  - Worker/External service xử lý nặng, sau đó update DB
  - Lý do: Edge Function không phù hợp xử lý file nặng lâu.

- Review summary: nhập tay/paste text, không scrape.

## 10) Khi Copilot thực thi tác vụ (quy tắc làm việc)

- Trước khi code: xác định đây là Guest hay Admin hay Supabase (DB/RLS/Edge Function).
- Không tạo thêm page/flow ngoài scope.
- Mọi thay đổi DB/RLS/RPC phải:
  - có migration SQL rõ ràng,
  - có kiểm role/tenant,
  - không mở quyền anon ngoài public views.

## 11) “Chuẩn hoá hợp đồng” (contracts) — dùng khi bạn tạo API/RPC/Edge

### RPC publish_menu_version(version_id)

Mục tiêu: publish atomic, tránh race-condition, đảm bảo mỗi `restaurant` chỉ có 1 `published`.

Yêu cầu bảo mật bắt buộc (vì function thường là `security definer`):

- Verify caller là `authenticated` và map được `auth.uid()` → `app_users`.
- Verify `app_users.tenant_id` khớp `menu_versions.tenant_id` của `p_menu_version_id`.
- Verify role hợp lệ theo schema (`user_role`: `owner` | `manager`) và được phép publish.
- Chỉ publish menu_version có `status='draft'` (nếu không thì trả lỗi 409).
- Atomic transaction:
  - archive current published của cùng restaurant
  - publish target + set `published_at = now()`

Lưu ý quyền: function `security definer` bypass RLS, nên kiểm tenant/role ở trong function là bắt buộc.

### Edge Function: process-menu-upload

Request (JSON):

- `upload_id`, `tenant_id`, `restaurant_id`, `file_path`
  Response:
- `job_id`, `status` (queued/processing/failed/done)

### Edge Function: generate_item_description

Request:

- `item_id`, `language_code`, `tone`, `overwrite=false`
  Response:
- `suggested_description`, `quota_remaining`

### Edge Function: summarize_reviews

Request:

- `language_code`, `reviews:[{text}]`
  Response:
- `summary_text`, `quota_remaining`

Nếu cần “khóa chuẩn Supabase” cho dev, hãy tạo thêm:

- RLS policies mẫu cho: `restaurants`, `menu_versions`, `menu_items`, `item_translations` (admin vs guest)
- SQL RPC `publish_menu_version()` đầy đủ
- OpenAPI-like contracts cho Edge Functions
