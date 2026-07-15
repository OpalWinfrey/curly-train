import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Chunks large values to work around SecureStore's 2048-byte limit
const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const nStr = await SecureStore.getItemAsync(`${key}_n`);
    if (!nStr) return null;
    const n = parseInt(nStr, 10);
    const parts = await Promise.all(
      Array.from({ length: n }, (_, i) => SecureStore.getItemAsync(`${key}_${i}`))
    );
    return parts.every(p => p !== null) ? parts.join('') : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const size = 1800;
    const parts: string[] = [];
    for (let i = 0; i < value.length; i += size) parts.push(value.slice(i, i + size));
    await SecureStore.setItemAsync(`${key}_n`, String(parts.length));
    await Promise.all(parts.map((p, i) => SecureStore.setItemAsync(`${key}_${i}`, p)));
  },
  async removeItem(key: string): Promise<void> {
    const nStr = await SecureStore.getItemAsync(`${key}_n`);
    if (!nStr) return;
    const n = parseInt(nStr, 10);
    await Promise.all([
      SecureStore.deleteItemAsync(`${key}_n`),
      ...Array.from({ length: n }, (_, i) => SecureStore.deleteItemAsync(`${key}_${i}`)),
    ]);
  },
};

// Expo's process.env type doesn't include custom vars — cast is safe here
const _env = process.env as unknown as Record<string, string>;
const supabaseUrl = _env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = _env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: LargeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
