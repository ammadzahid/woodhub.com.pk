import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * DB configured hai ya nahi. Agar nahi, to site `catalog.ts` ke seed data par
 * chalti rehti hai aur admin panel setup screen dikhata hai — kuch crash nahi hota.
 */
export const dbReady = Boolean(url && serviceKey);

let client: SupabaseClient | null = null;

/**
 * Service-role client. SIRF server par — ye key RLS bypass karti hai,
 * is liye kabhi client component me import mat karna.
 */
export function db(): SupabaseClient {
  if (!dbReady) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-application-name': 'woodhub' } },
    });
  }
  return client;
}
