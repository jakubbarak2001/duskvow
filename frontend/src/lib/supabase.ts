import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton Supabase browser client.
 * Use this in all client components and hooks.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
);
