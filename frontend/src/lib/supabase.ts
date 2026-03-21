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

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Set these environment variables in your deployment platform.",
      );
    }

    _client = createBrowserClient(url, key);
  }
  return _client;
}
