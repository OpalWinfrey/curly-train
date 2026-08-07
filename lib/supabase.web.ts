import { createClient } from '@supabase/supabase-js';

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { localStorage.removeItem(key); return Promise.resolve(); },
};

const _env = process.env as unknown as Record<string, string>;
// Fall back to placeholders so createClient doesn't throw at module load time when
// env vars aren't set (e.g. local build without .env.local). Auth calls will fail
// gracefully and the user will remain on the sign-in screen.
const supabaseUrl = _env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = _env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: webStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
