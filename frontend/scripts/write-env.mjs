/**
 * Prebuild script — writes NEXT_PUBLIC_* env vars to .env.local so that
 * Next.js (Turbopack) inlines them into the client bundle during static export.
 *
 * Cloudflare Pages sets env vars at the process level, but Next.js may not
 * pick them up unless they're in a .env* file.  This script bridges the gap.
 */
import { writeFileSync } from "node:fs";

// Dump ALL env vars whose name contains "SUPABASE" or "NEXT_PUBLIC" for debugging
console.log("[write-env] === All NEXT_PUBLIC / SUPABASE env vars ===");
for (const [key, value] of Object.entries(process.env)) {
  if (key.includes("NEXT_PUBLIC") || key.includes("SUPABASE")) {
    // Show the key with char codes to detect invisible characters
    const charCodes = [...key].map((c) => c.charCodeAt(0));
    console.log(
      `[write-env]   "${key}" (${key.length} chars, codes: ${charCodes.join(",")}) = ${value ? value.substring(0, 20) + "..." : "(empty)"}`,
    );
  }
}
console.log("[write-env] === End env var dump ===");

const vars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_API_URL",
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
