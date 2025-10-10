# Repository Guidelines

## Project Structure & Module Organization
- `src/App.tsx`: main app flow and template orchestration.
- `src/components/`: UI (Form, Preview, Auth).
- `src/services/signatureGenerator.ts`: table‑only, inline‑styled HTML generation.
- `src/auth/`: Supabase session context.
- `src/storage/supabaseStorage.ts`: avatar upload and public icon URLs.
- `functions/`: legacy serverless functions (prefer Supabase).
- `public/`: static assets (favicons, images).
- `.github/workflows/ci.yml`: CI for typecheck, lint, build.

## Build, Test, and Development Commands
- `nvm use` (Node 20) then `npm i` to install deps.
- `npm run dev`: start Vite dev server.
- `npm run build`: production build output.
- `npm run lint`: run ESLint + Prettier checks.
- `npm run typecheck`: TypeScript diagnostics.

Env vars (Vite exposes only `VITE_*`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_SUPABASE_AVATARS_BUCKET` (default `avatars`), `VITE_SUPABASE_ICONS_BUCKET` (default `icons`).

## Coding Style & Naming Conventions
- TypeScript + React + Vite. Format with Prettier; lint with ESLint.
- Components `PascalCase` (e.g., `UserForm.tsx`); variables/functions `camelCase`.
- Email‑safe HTML: use tables with `role="presentation"`, `border="0"`, fixed widths, `valign="top"`.
- Inline styles only. No `<style>` tags or external fonts.
- Images: small PNGs (12–24px) with explicit `width`/`height`, `border:0`, and `display:block`.

## Testing Guidelines
- No formal test suite yet. If adding tests, use Vitest + React Testing Library.
- Place tests near sources as `*.test.ts`/`*.test.tsx`. Focus on HTML generation and rich‑copy behavior.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). Keep commits focused.
- PRs: clear description, linked issues, screenshots/GIFs for UI changes, and note any env/config impacts.
- CI must pass (typecheck, lint, build). Update docs when behavior changes.

## Security & Configuration Tips
- Vite exposes only `VITE_*` env vars.
- Supabase buckets: `icons` (public) and `avatars` (public read; per‑user RLS at `<userId>/avatar.ext`).
- Prefer Supabase Auth/Storage over legacy functions. Avoid remote SVGs/icon fonts in signatures.
- “Copy Signature” uses an iframe to preserve formatting; keep templates compatible with Gmail/Outlook.

