import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in signature-mail/.env.local and restart the dev server.');
}

export const supabase = createClient(url, anonKey);
