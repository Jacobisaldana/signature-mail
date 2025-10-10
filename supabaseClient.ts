import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in signature-mail/.env.local and restart the dev server.');
}

export const supabase = createClient(url, anonKey);

// Simple connectivity helper for browser console
if (typeof window !== 'undefined') {
  const ICONS_BUCKET = (import.meta.env.VITE_SUPABASE_ICONS_BUCKET as string) || 'icons';
  // Expose a quick check on window: run `checkSupabase()` in DevTools
  (window as any).checkSupabase = async () => {
    try {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes?.data?.session || null;

      const { data: pubUrl } = supabase.storage.from(ICONS_BUCKET).getPublicUrl('linkedin.png');
      const iconUrl = pubUrl?.publicUrl;
      const imgOk = await new Promise<boolean>((resolve) => {
        if (!iconUrl) return resolve(false);
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = iconUrl + `#ts=${Date.now()}`; // bust caches
      });

      return { session, iconUrl, storageIconReachable: imgOk };
    } catch (e) {
      return { error: String(e) };
    }
  };
}
