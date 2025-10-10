# Release Notes

## Version: Cropper + Avatar/Icons Improvements (2025-10-10)

Highlights
- Image cropper: proportional zoom, drag, circular viewport, high‑quality canvas export.
- No image distortion: avatars use equal width/height and inline styles email‑safe.
- Social icons in a single row (table‑based) across templates.
- Unified circular avatars with 2px brand border; Vertical template uses a double‑ring for contrast.
- Facebook icon renamed to `facebook.png` (no longer `social.png`).
- Supabase helper: `window.checkSupabase()` to quickly diagnose auth and Storage reachability.

Fixes
- Stale preview after crop: versioned uploads, immediate preview refresh, and unique storage keys to avoid CDN cache collisions.
- Clear file input on select to allow reselection of the same file reliably.

Upgrade Notes
- Ensure `icons` bucket contains `facebook.png`.
- Optional: set `VITE_SUPABASE_ICONS_BUCKET`/`VITE_SUPABASE_AVATARS_BUCKET` if using non‑default names.

## Version: Email Auth + Email‑Safe Signatures (2025-09-24)

Highlights
- Supabase authentication (email/password), `AuthProvider`, and sign‑in screen.
- Avatars: upload to Supabase Storage (`avatars/<userId>/avatar.ext`) and use public URL.
- Icons: load from the `icons` bucket (email, phone, website, social) with fallbacks.
- Rich copy: “Copy Signature” copies the rendered HTML from the iframe; preserves columns in Gmail/Outlook.
- Hardened templates: `role=presentation` tables, `table-layout: fixed`, images with `display:block` and explicit `width/height`; increased padding on “Modern”.
- Tooling/CI: ESLint, Prettier, `.editorconfig`, `.nvmrc`, and GitHub Actions workflow (typecheck, lint, build).

Quick Setup
- Environment in `.env` or `.env.local` (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_AVATARS_BUCKET`, `VITE_SUPABASE_ICONS_BUCKET`.
- Supabase buckets:
  - `icons` (public): `email.png`, `phone.png`, `website.png`, `linkedin.png`, `twitter.png`, `instagram.png`, `facebook.png`, `calendar.png`.
  - `avatars`: public read and RLS for `<userId>/...`.
- Development: `npm install && npm run dev`.

Suggested Next Steps
- OAuth (Google) and magic‑link session recovery.
- Save per‑user signatures (table or Storage) with snapshots/minification.
- In‑app paste guides by client (Gmail, Outlook desktop, Apple Mail).
