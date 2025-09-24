# Repository Guidelines

## Project Context
- Stack: React + Vite + TypeScript (SPA) with Supabase (Auth and Storage).
- Goal: Generate professional, email‑safe HTML signatures and enable “rendered” copy for Gmail/Outlook.

## Key Structure
- `App.tsx`: main flow and templates.
- `components/`: UI (Form, Preview, Auth).
- `services/signatureGenerator.ts`: generates HTML for each template (tables only, inline styles, images).
- `auth/`: Supabase session context.
- `storage/supabaseStorage.ts`: avatar upload and public icon URLs.
- `functions/`: optional legacy serverless functions; Supabase is preferred now.

## Environment Variables (Vite exposes only VITE_)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `VITE_SUPABASE_AVATARS_BUCKET` (default `avatars`).
- `VITE_SUPABASE_ICONS_BUCKET` (default `icons`).

## Storage
- Buckets: `icons` (public), `avatars` (public read; RLS per user at `<userId>/avatar.ext`).
- Avoid icon fonts/remote SVGs in signatures; use small PNGs (12–24px) with explicit `width/height` and `border:0`.

## Rich Copy
- The “Copy Signature” button copies from the iframe (execCommand) and, if it fails, uses the Clipboard API or a contenteditable fallback. This preserves columns and styles when pasting into Gmail.

## Code Style and CI
- Lint: ESLint + Prettier (see `.eslintrc.json`, `.prettierrc.json`).
- Node 20 (`.nvmrc`).
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs typecheck, lint, and build.

## Template Conventions
- Email‑safe tables: `role="presentation"`, `border="0"`, `table-layout: fixed`.
- Use `valign="top"`, fixed `width` cells for images, and `display:block` on `<img>`.
- Inline styles only. No `<style>` tags or external fonts.

## Scripts
- `npm run dev` (local), `npm run build`, `npm run lint`, `npm run typecheck`.

## Suggested Next Steps
- OAuth (Google), per‑user signature persistence and HTML snapshots/minification.
