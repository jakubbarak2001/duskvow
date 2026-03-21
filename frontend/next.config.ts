import type { NextConfig } from "next";

/**
 * Public defaults for the Supabase browser client.
 * These are NOT secrets — they are designed for browser use and protected by
 * Row Level Security.  Env vars override them when available.
 */
const SUPABASE_URL_DEFAULT = "https://kptwaetlydqfzcvlgnke.supabase.co";
const SUPABASE_ANON_KEY_DEFAULT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdHdhZXRseWRxZnpjdmxnbmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjMzMzMsImV4cCI6MjA1Nzg5OTMzM30.G_d_rqyTU3sjcSUJBrYKYUe1wmTNXTPFRIpy97KjseA";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_DEFAULT,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_DEFAULT,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  },
};

export default nextConfig;
