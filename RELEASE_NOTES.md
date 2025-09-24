# Notas de Lanzamiento

## Versión: Email Auth + Firmas Email‑Safe (2025-09-24)

Cambios principales
- Autenticación con Supabase (email/password), `AuthProvider` y pantalla de acceso.
- Avatares: subida a Supabase Storage (`avatars/<userId>/avatar.ext`) y uso de URL pública.
- Iconos: carga desde bucket `icons` (email, phone, website, redes) con fallbacks.
- Copiado enriquecido: botón “Copiar Firma” copia el HTML renderizado desde el iframe; mantiene columnas en Gmail/Outlook.
- Plantillas reforzadas: tablas `role=presentation`, `table-layout: fixed`, imágenes con `display:block`, `width/height`; padding ampliado en “Modern”.
- Tooling/CI: ESLint, Prettier, `.editorconfig`, `.nvmrc` y workflow de GitHub Actions (typecheck, lint, build).

Instrucciones rápidas
- Variables en `.env` o `.env.local` (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_AVATARS_BUCKET`, `VITE_SUPABASE_ICONS_BUCKET`.
- Buckets en Supabase:
  - `icons` (público): `email.png`, `phone.png`, `website.png`, `linkedin.png`, `twitter.png`, `instagram.png`, `social.png`, `calendar.png`.
  - `avatars`: lectura pública y RLS para `<userId>/...`.
- Desarrollo: `npm install && npm run dev`.

Próximos pasos sugeridos
- OAuth (Google) y recuperación de sesión mágica.
- Guardar firmas por usuario (tabla o Storage) con snapshots/minificación.
- Guías de pegado por cliente (Gmail, Outlook desktop, Apple Mail) dentro de la app.
