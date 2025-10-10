# Release Notes

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
