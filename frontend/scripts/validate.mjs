/**
 * validate.mjs — Duskvow pre-completion validation
 *
 * Claude MUST run `npm run validate` before declaring any task done.
 * If any step fails, Claude fixes the issue and re-runs.
 *
 * Checks (in order):
 *   1. TypeScript — no type errors
 *   2. ESLint — no lint violations
 *   3. Build — Next.js production build succeeds
 */

import { execSync } from "node:child_process";

const STEPS = [
  {
    name: "TypeScript",
    cmd: "npx tsc --noEmit",
    emoji: "🔷",
    failHint: "Fix type errors before proceeding.",
  },
  {
    name: "ESLint",
    cmd: "npx eslint . --max-warnings 0",
    emoji: "🔶",
    failHint: "Fix lint violations. No warnings allowed.",
  },
  {
    name: "Next.js Build",
    cmd: "npm run build",
    emoji: "🔨",
    failHint: "Build failed. Check the output above for errors.",
  },
];

console.log("\n╔══════════════════════════════════════╗");
console.log("║   DUSKVOW VALIDATION — DO NOT SKIP  ║");
console.log("╚══════════════════════════════════════╝\n");

let passed = 0;
let failed = false;

for (const step of STEPS) {
  process.stdout.write(`${step.emoji}  ${step.name}... `);

  try {
    execSync(step.cmd, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    console.log("✅ PASS");
    passed++;
  } catch (err) {
    console.log("❌ FAIL");
    console.log(`\n--- ${step.name} errors ---`);
    const output = err.stdout?.toString() || err.stderr?.toString() || "";
    // Show last 40 lines max to keep output readable
    const lines = output.trim().split("\n");
    const tail = lines.slice(-40).join("\n");
    if (lines.length > 40) console.log(`  ... (${lines.length - 40} lines truncated)`);
    console.log(tail);
    console.log(`--- end ${step.name} errors ---\n`);
    console.log(`💀 ${step.failHint}\n`);
    failed = true;
    break; // Stop on first failure — no point building if types are broken
  }
}

console.log("\n══════════════════════════════════════");
if (failed) {
  console.log(`❌ VALIDATION FAILED at step ${passed + 1}/${STEPS.length}`);
  console.log("   Fix the errors above, then run: npm run validate");
  console.log("══════════════════════════════════════\n");
  process.exit(1);
} else {
  console.log(`✅ ALL ${STEPS.length} CHECKS PASSED — safe to commit`);
  console.log("══════════════════════════════════════\n");
  process.exit(0);
}
