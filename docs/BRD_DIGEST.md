# BRD_DIGEST — ViMenu (BRD v1.1 — 05/10/2025)

## 1) Scope (in-scope)
### Guest PWA
- **G-01 QR & onboarding**: QR opens PWA; first-visit infographic; can skip.
- **G-02 Bilingual display**: always show Vietnamese + selected language; fallback to Vietnamese when missing.
- **G-03 Item detail**: item image (if any), full description, price, allergens + nutrition (plan-dependent).
- **G-04 “My items”**: local-only list for communicating to staff; **no total price**; no server-side order.
- **G-05 Dietary/religious filters**: Halal/Kosher/Vegetarian/Vegan/Gluten-free filters based on **confirmed** tags.

### Admin Web
- **A-01 Upload & digitize menu**: upload PDF/JPG/PNG/XLS/CSV; AI structures categories/items.
- **A-02 Manual edit + publish**: edit names/prices/descriptions; publish updates to guest PWA.
- **A-03 Gemini generate item description**: available on **Professional/Performance**.
- **A-04 Gemini summarize reviews**: available on **Performance**.

## 2) Out-of-scope (must NOT implement)
- POS / payments / ordering-to-kitchen / invoicing
- Inventory management
- Staff scheduling / time tracking
- Table booking

## 3) Roles (users & permissions)
- **Guest (Alex)**: anonymous user scanning QR to browse menu; can switch language, view item details, use dietary filters, manage “My items”.
- **Waiter/Staff (Minh)**: no login required; consumes “My items” screen shown by guest to confirm requested items.
- **Restaurant owner/manager (Anh Tuấn)**: admin user; uploads menu, reviews AI output, edits, confirms tags (allergens/dietary/nutrition), publishes.

## 4) Primary flows
### Guest flow (scan QR → order communication)
1. Scan QR → open `/r/[slug]`.
2. PWA loads quickly; show onboarding infographic on first visit (skippable).
3. Choose target language (e.g., English).
4. Browse categories (e.g., Phở) and items.
5. Open item detail → see allergens + nutrition (if enabled).
6. Add items to “My items” list.
7. Open “My items” screen and show to staff to communicate the full request.

### Admin flow (upload → review → publish)
1. Admin logs in.
2. Upload menu file (pdf/jpg/png/xls/csv).
3. System processes and generates structured menu data.
4. Admin reviews/edits items and translations; confirms allergens/dietary/nutrition.
5. Admin publishes changes → guest PWA reads published version.

## 5) Non-functional requirements (NFR)
- **Performance**: Guest PWA page load P95 ≤ 2.5s (especially for repeat visits after cache warm).
- **Offline**: usable offline after first load (cache app shell + published menu).
- **Availability**: 99.9%.
- **Security**: TLS; RBAC for admin; strict multi-tenant isolation (RLS).

## 6) Acceptance criteria (by feature)
### G-01 QR & onboarding
- QR links to PWA and loads without app-store install.
- App shell loads within P95 ≤ 2.5s.
- On first visit, show a brief onboarding infographic that can be skipped.

### G-02 Bilingual display
- Prominent language switcher.
- Menu shows Vietnamese + selected language side-by-side.
- Missing translation falls back to Vietnamese.
- Available languages are gated by restaurant subscription plan.

### G-03 Item detail
- Tapping an item opens a detail view.
- Detail includes image (if any), full description, price.
- Shows allergen warnings and nutrition estimates when supported by plan.

### G-04 “My items”
- Each item has an add-to-list action (e.g., ❤️ or +).
- A fixed icon indicates current count.
- Tapping opens a summary screen.
- **Must not** compute subtotal/total price or create a server order.

### G-05 Dietary/religious filters
- Filter UI is visible on the main menu screen.
- Selecting a filter hides non-compliant items.
- Only confirmed tags are used for filtering; admin must confirm tags.

### A-01 Upload & digitize
- Admin can upload supported file types.
- After processing, admin sees structured items to review.

### A-02 Manual edit + publish
- Admin can edit text and key fields directly.
- Publish pushes updates to live guest PWA.

### A-03 Gemini item description
- “✨ Generate description” button exists on item edit.
- Result requires human review/approval.
- Only enabled for Professional/Performance.

### A-04 Gemini review summary
- Admin can paste reviews and request summary.
- Summary highlights themes/popular items/improvement areas.
- Only enabled for Performance.

## 7) Edge cases & constraints
- **Missing translations**: always render Vietnamese; never show blank as primary.
- **Visibility rules**:
  - Guest reads **published** menu only.
  - Guest only sees translations with `approved=true`.
  - Guest only sees allergen/nutrition/dietary signals with `confirmed=true`.
- **“My items” semantics**: communication-only; avoid any UI implying payment/checkout.
- **Offline behavior**: if offline and no cached menu exists, show a clear fallback state.
- **Multi-tenant**: every admin read/write must be tenant-scoped; never leak cross-tenant data.


<!-- Tóm tắt BRD thành: scope / out-of-scope / roles / flows / non-functional / acceptance criteria / edge cases. -->