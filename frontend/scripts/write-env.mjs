/**
 * Prebuild script — writes NEXT_PUBLIC_* env vars to .env.local so that
 * Next.js (Turbopack) inlines them into the client bundle during static export.
 *
 * Cloudflare Pages sets env vars at the process level, but Next.js may not
 * pick them up unless they're in a .env* file.  This script bridges the gap.
 */
import { writeFileSync } from "node:fs";

const vars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_MVP_MODE",
];

const lines = [];

for (const name of vars) {
  const value = process.env[name];
  if (value) {
    lines.push(`${name}=${value}`);
    console.log(`[write-env] ✓ ${name} is set (${value.length} chars)`);
  } else {
    console.warn(`[write-env] ✗ ${name} is NOT set`);
  }
}

if (lines.length > 0) {
  writeFileSync(".env.local", lines.join("\n") + "\n");
  console.log(`[write-env] Wrote ${lines.length} vars to .env.local`);
} else {
  console.warn("[write-env] No env vars found — .env.local not created");
}
