import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-initialized Supabase browser client.
 *
 * Created on first access rather than at module-evaluation time so that
 * static-site-generation (output: "export") can import this module without
 * crashing when env vars are not yet available in the build environment.
 */
let _client: SupabaseClient | null = null;
let _initError: string | null = null;

export function getSupabase(): SupabaseClient {
  if (_initError) {
    throw new Error(_initError);
  }

  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      _initError =
        "Supabase is not configured. " +
        `NEXT_PUBLIC_SUPABASE_URL=${url ? "SET" : "MISSING"}, ` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${key ? "SET" : "MISSING"}. ` +
        "These must be set as build-time environment variables.";
      throw new Error(_initError);
    }

    _client = createBrowserClient(url, key);
  }
  return _client;
}

/**
 * Returns true if the Supabase env vars are configured.
 * Safe to call without throwing.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
