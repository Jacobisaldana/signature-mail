# Repository Guidelines

## Contexto del Proyecto
- Stack: React + Vite + TypeScript (SPA) con Supabase (Auth y Storage).
- Objetivo: Generar firmas de correo profesionales (HTML email‑safe) y facilitar el copiado “renderizado” para Gmail/Outlook.

## Estructura Clave
- `App.tsx`: flujo principal y templates.
- `components/`: UI (Formulario, Preview, Auth).
- `services/signatureGenerator.ts`: genera HTML de cada plantilla (solo tablas, estilos inline, imágenes).
- `auth/`: contexto de sesión Supabase.
- `storage/supabaseStorage.ts`: subida de avatar y URLs públicas de iconos.
- `functions/`: (opcional) funciones serverless legadas; hoy priorizamos Supabase.

## Variables de Entorno (Vite expone solo VITE_)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- `VITE_SUPABASE_AVATARS_BUCKET` (por defecto `avatars`).
- `VITE_SUPABASE_ICONS_BUCKET` (por defecto `icons`).

## Storage
- Buckets: `icons` (público), `avatars` (lectura pública, RLS por usuario en `<userId>/avatar.ext`).
- Evitar icon fonts/SVG remotos en firmas; usar PNG pequeños (12–24px) con `width/height` y `border:0`.

## Copiado con Formato
- El botón “Copiar Firma” copia desde el iframe (execCommand) y, si falla, usa Clipboard API o contenedor contenteditable. Esto preserva columnas y estilos al pegar en Gmail.

## Estilo de Código y CI
- Lint: ESLint + Prettier (ver `.eslintrc.json`, `.prettierrc.json`).
- Node 20 (`.nvmrc`).
- CI: GitHub Actions (`.github/workflows/ci.yml`) ejecuta typecheck, lint y build.

## Convenciones de Plantillas
- Tablas email‑safe: `role="presentation"`, `border="0"`, `table-layout: fixed`.
- Usar `valign="top"`, celdas con `width` fijo para imágenes y `display:block` en `<img>`.
- Estilos inline exclusivamente. Nada de `<style>`/fuentes externas.

## Scripts
- `npm run dev` (local), `npm run build`, `npm run lint`, `npm run typecheck`.

## Próximos Pasos sugeridos
- OAuth (Google), persistencia de firmas por usuario y snapshots/minificación HTML.
