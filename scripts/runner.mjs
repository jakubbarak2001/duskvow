/**
 * runner.mjs — Duskvow Overnight Task Runner
 *
 * Reads TASKS.md, picks the next QUEUED task, feeds it to Claude Code,
 * runs validation, updates task status, and moves to the next task.
 *
 * Usage:
 *   node scripts/runner.mjs              # Run all queued tasks
 *   node scripts/runner.mjs --dry-run    # Show what would run, don't execute
 *   node scripts/runner.mjs --once       # Run only the next queued task, then stop
 *   node scripts/runner.mjs --skip-baseline  # Skip pre-run validation check
 *
 * Prerequisites:
 *   - Claude Code CLI installed (`claude` command available)
 *   - Run from the project root (where TASKS.md, STATE.md, CLAUDE.md live)
 *   - Codebase must pass `npm run validate` BEFORE running (baseline check)
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";

// ─── Configuration ───────────────────────────────────────────────────────────

const PROJECT_ROOT = process.cwd();
const TASKS_FILE = resolve(PROJECT_ROOT, "TASKS.md");
const STATE_FILE = resolve(PROJECT_ROOT, "STATE.md");
const LOG_FILE = resolve(PROJECT_ROOT, "runner.log");
const FRONTEND_DIR = resolve(PROJECT_ROOT, "frontend");

const DRY_RUN = process.argv.includes("--dry-run");
const ONCE = process.argv.includes("--once");
const SKIP_BASELINE = process.argv.includes("--skip-baseline");

// Max time for Claude Code to work on a single task (25 minutes)
const TASK_TIMEOUT_MS = 25 * 60 * 1000;
// Max time for validation (5 minutes)
const VALIDATE_TIMEOUT_MS = 5 * 60 * 1000;

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

function logSeparator() {
  log("═".repeat(60));
}

// ─── TASKS.md Parser ─────────────────────────────────────────────────────────

function parseTasks() {
  const content = readFileSync(TASKS_FILE, "utf-8");
  const lines = content.split("\n");
  const tasks = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### TASK ")) {
      if (current) {
        current.endLine = i - 1;
        current.body = lines.slice(current.startLine, current.endLine + 1).join("\n");
        tasks.push(current);
      }

      const titleMatch = line.match(/### (TASK \S+):\s*(.*)/);
      current = {
        id: titleMatch ? titleMatch[1] : `UNKNOWN_${i}`,
        title: titleMatch ? titleMatch[2].trim() : line,
        startLine: i,
        endLine: null,
        status: null,
        branch: null,
        body: null,
      };
    }

    if (current && line.includes("**Status**")) {
      const statusMatch = line.match(/`(\w+)`/);
      if (statusMatch) current.status = statusMatch[1];
    }

    if (current && line.includes("**Branch**")) {
      const branchMatch = line.match(/`([^`]+)`/);
      if (branchMatch) current.branch = branchMatch[1];
    }

    if (current && i > current.startLine && (line.trim() === "---" || line.startsWith("## "))) {
      current.endLine = i - 1;
      current.body = lines.slice(current.startLine, current.endLine + 1).join("\n");
      tasks.push(current);
      current = null;
    }
  }

  if (current) {
    current.endLine = lines.length - 1;
    current.body = lines.slice(current.startLine, current.endLine + 1).join("\n");
    tasks.push(current);
  }

  return tasks;
}

function updateTaskStatus(taskId, newStatus) {
  const taskHeaderPattern = new RegExp(
    `### ${taskId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`
  );
  const lines = readFileSync(TASKS_FILE, "utf-8").split("\n");
  let inTask = false;

  for (let i = 0; i < lines.length; i++) {
    if (taskHeaderPattern.test(lines[i])) inTask = true;
    if (inTask && lines[i].includes("**Status**")) {
      lines[i] = lines[i].replace(/`\w+`/, `\`${newStatus}\``);
      break;
    }
  }

  writeFileSync(TASKS_FILE, lines.join("\n"));
}

// ─── Git Operations ──────────────────────────────────────────────────────────

function gitCheckout(branch) {
  try {
    execSync(`git rev-parse --verify ${branch}`, { cwd: PROJECT_ROOT, stdio: "pipe" });
    execSync(`git checkout ${branch}`, { cwd: PROJECT_ROOT, stdio: "pipe" });
    log(`Checked out existing branch: ${branch}`);
  } catch {
    execSync(`git checkout -b ${branch}`, { cwd: PROJECT_ROOT, stdio: "pipe" });
    log(`Created and checked out new branch: ${branch}`);
  }
}

function gitCommit(message) {
  try {
    execSync("git add -A", { cwd: PROJECT_ROOT, stdio: "pipe" });
    execSync(`git commit -m "${message}"`, { cwd: PROJECT_ROOT, stdio: "pipe" });
    log(`Committed: ${message}`);
  } catch {
    log("Nothing to commit or commit failed.");
  }
}

function gitCurrentBranch() {
  try {
    return execSync("git branch --show-current", { cwd: PROJECT_ROOT, stdio: "pipe" }).toString().trim();
  } catch {
    return "unknown";
  }
}

// ─── Claude Code Invocation ──────────────────────────────────────────────────

function buildPrompt(task) {
  return [
    "You are executing an automated task from the Duskvow task queue.",
    "Follow these steps EXACTLY:",
    "",
    "1. Read STATE.md in the project root — understand the project context, visual identity, and coding standards.",
    "2. Read CLAUDE.md in the project root — understand the technical architecture and conventions.",
    "3. Execute the task below completely. Follow every specific instruction.",
    "4. After completing all changes, run: cd frontend && npm run validate",
    "5. If validate fails, fix ALL errors and re-run validate until it passes.",
    "6. Do NOT ask questions. Do NOT skip steps. Do NOT add features not specified.",
    "7. Do NOT modify files outside of the ones listed in the task spec unless absolutely necessary.",
    "",
    "══════════════════════════════════════════════════════════",
    `TASK: ${task.id} — ${task.title}`,
    "══════════════════════════════════════════════════════════",
    "",
    task.body,
    "",
    "══════════════════════════════════════════════════════════",
    "REMINDER: Run `cd frontend && npm run validate` before finishing.",
    "If it fails, fix the issues. Do not stop until validate passes.",
    "══════════════════════════════════════════════════════════",
  ].join("\n");
}

/**
 * Run Claude Code with the task prompt using spawnSync.
 * Passes prompt directly as argument — no shell, no truncation.
 */
function runClaudeCode(prompt) {
  log(`Prompt length: ${prompt.length} chars`);

  const result = spawnSync(
    "claude",
    ["-p", prompt, "--dangerously-skip-permissions"],
    {
      cwd: PROJECT_ROOT,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: TASK_TIMEOUT_MS,
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
      // NO shell: true — avoids Windows command-line length limits
    }
  );

  const stdout = result.stdout?.toString() || "";
  const stderr = result.stderr?.toString() || "";
  const output = stdout + (stderr ? "\n[STDERR]\n" + stderr : "");

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  if (result.signal === "SIGTERM") {
    return { success: false, output: output + "\n[TIMED OUT]" };
  }

  return { success: result.status === 0, output };
}

// ─── Validation ──────────────────────────────────────────────────────────────

function runValidation() {
  try {
    const result = execSync("npm run validate", {
      cwd: FRONTEND_DIR,
      stdio: "pipe",
      timeout: VALIDATE_TIMEOUT_MS,
    });
    return { passed: true, output: result.toString() };
  } catch (err) {
    return {
      passed: false,
      output: err.stdout?.toString() || err.stderr?.toString() || "Validation failed",
    };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  log("╔══════════════════════════════════════════════╗");
  log("║   DUSKVOW OVERNIGHT RUNNER                  ║");
  log("╚══════════════════════════════════════════════╝");
  log(`Current branch: ${gitCurrentBranch()}`);

  if (!existsSync(TASKS_FILE)) { log("FATAL: TASKS.md not found."); process.exit(1); }
  if (!existsSync(STATE_FILE)) { log("FATAL: STATE.md not found."); process.exit(1); }

  try { execSync("claude --version", { stdio: "pipe" }); }
  catch { log("FATAL: Claude Code CLI not found."); process.exit(1); }

  const allTasks = parseTasks();
  const queuedTasks = allTasks.filter((t) => t.status === "QUEUED");

  log(`Found ${allTasks.length} total tasks, ${queuedTasks.length} queued.`);

  if (queuedTasks.length === 0) {
    log("No queued tasks. Nothing to do.");
    process.exit(0);
  }

  if (DRY_RUN) {
    log("\n[DRY RUN] Would execute these tasks in order:");
    for (const task of queuedTasks) {
      log(`  → ${task.id}: ${task.title} (branch: ${task.branch || "none"})`);
    }
    process.exit(0);
  }

  // ─── Baseline Check ─────────────────────────────────────────────────────

  if (!SKIP_BASELINE) {
    log("Running baseline validation...");
    const baseline = runValidation();
    if (!baseline.passed) {
      log("═".repeat(60));
      log("❌ BASELINE VALIDATION FAILED");
      log("Your codebase has pre-existing errors. Fix them BEFORE running tasks.");
      log("");
      log(baseline.output.slice(-800));
      log("═".repeat(60));
      log("Fix these errors, commit, then re-run the runner.");
      log("Or use --skip-baseline to proceed anyway (not recommended).");
      process.exit(1);
    }
    log("✅ Baseline clean — codebase passes validation.");
  } else {
    log("⚠️  Skipping baseline validation.");
  }

  // ─── Task Loop ───────────────────────────────────────────────────────────

  const tasksToRun = ONCE ? [queuedTasks[0]] : queuedTasks;
  let completedCount = 0;

  for (const task of tasksToRun) {
    logSeparator();
    log(`STARTING: ${task.id} — ${task.title}`);
    log(`Branch: ${task.branch || "(none)"}`);
    logSeparator();

    // 1. Checkout branch
    if (task.branch) {
      try {
        gitCheckout(task.branch);
      } catch (err) {
        log(`ERROR: Branch checkout failed: ${err.message}`);
        updateTaskStatus(task.id, "FAILED");
        break;
      }
    }

    // 2. Mark in progress
    updateTaskStatus(task.id, "IN_PROGRESS");

    // 3. Run Claude Code
    log("Invoking Claude Code...");
    const startTime = Date.now();
    const result = runClaudeCode(buildPrompt(task));
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log(`Claude Code finished in ${Math.floor(elapsed / 60)}m ${elapsed % 60}s (exit: ${result.success ? "OK" : "FAIL"})`);

    appendFileSync(LOG_FILE, `\n--- Claude Output for ${task.id} ---\n${result.output}\n--- End Output ---\n`);

    // Check Claude actually did work
    const didWork = result.output.length > 200
      && !result.output.includes("got cut off")
      && !result.output.includes("What did you want");

    if (!didWork) {
      log("⚠️  Claude Code did not execute the task properly.");
      log(`Output preview: ${result.output.slice(0, 300)}`);
      updateTaskStatus(task.id, "FAILED");
      log(`❌ ${task.id} FAILED — Claude did not produce meaningful output`);
      break;
    }

    // 4. Validate
    log("Running validation...");
    const validation = runValidation();

    if (validation.passed) {
      log("✅ Validation PASSED");
      if (task.branch) gitCommit(`feat: ${task.id} — ${task.title}`);
      updateTaskStatus(task.id, "DONE");
      log(`✅ ${task.id} COMPLETED`);
      completedCount++;
    } else {
      log("❌ Validation FAILED");
      log(validation.output.slice(-500));
      updateTaskStatus(task.id, "FAILED");
      log(`❌ ${task.id} FAILED — validation did not pass`);
      appendFileSync(LOG_FILE, `\n--- Validation Failure ---\n${validation.output}\n--- End ---\n`);
      log("Stopping queue. Fix and re-run.");
      break;
    }

    logSeparator();
  }

  // ─── Summary ─────────────────────────────────────────────────────────────

  log("");
  logSeparator();
  log(`DONE: ${completedCount}/${tasksToRun.length} tasks completed.`);
  if (completedCount === tasksToRun.length) {
    log("All tasks succeeded.");
  } else {
    log("Some tasks remaining. Check runner.log.");
  }
  logSeparator();
}

main();
