<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19k3oeTmElB3-IIIjjEe2sG6w623exPpn

## Run Locally

**Prerequisites:** Node.js 20 (see .nvmrc)


1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill values as needed. For Supabase auth, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key is client-safe). Do not inject non-public secrets in client.
3. Run the app: `npm run dev`

Checks:
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`

### Supabase Storage (icons & avatars)
- Crea bucket público `icons` y sube: `linkedin.png`, `twitter.png`, `instagram.png`, `social.png`, `calendar.png`.
- Crea bucket `avatars` (lectura pública) y permite a usuarios autenticados subir/actualizar su propio avatar.

## Supabase Policies (Storage)
Asigna estas políticas a `avatars` (lectura pública y escritura del dueño):

1) Lectura pública (RLS)
```
(bucket_id = 'avatars')
```

2) Usuarios autenticados pueden subir/actualizar su carpeta (`<user_id>/...`)
```
(bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid())
```

## Supabase Authentication
- Set in `.env.local`:
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`
- The app gates UI behind sign-in (email/password). Use the header button to sign out.
- Avatars se suben con Supabase Storage a `avatars/<userId>/avatar.ext` y se usa la `publicUrl`.
