"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

interface StreakFlameProps {
  currentStreak: number;
  lastActivityDate: string | null;
  streakMultiplier?: number;
}

/**
 * Duolingo-style streak indicator: just a number and a flame.
 *
 * The backend only resets `current_streak` when the user takes an action
 * that runs `update_streak_atomic`. Between a missed day and the user's
 * next action, the stored value is stale ("still says 6 even though I
 * skipped yesterday"). We don't trust the stored number for display:
 *
 *   - lastActivity === today      → burning, show currentStreak
 *   - lastActivity === yesterday  → at-risk, show currentStreak (cold flame)
 *   - lastActivity >= 2 days ago  → broken, show 0 (cold flame)
 *   - lastActivity null           → never started, show 0 (cold flame)
 *
 * This keeps the display honest regardless of when the backend next
 * recalculates. A real completion action will refresh the data and line
 * the display up with the fresh server value.
 */
export function StreakFlame({
  currentStreak,
  lastActivityDate,
  streakMultiplier,
}: StreakFlameProps) {
  const today = new Date().toISOString().slice(0, 10);

  const daysSince = daysSinceActivity(lastActivityDate, today);
  // Broken if no activity recorded or the last one was 2+ days ago; the
  // stored number is not trustworthy in that case.
  const broken = daysSince === null || daysSince >= 2;
  const displayStreak = broken ? 0 : currentStreak;
  const isBurning = daysSince === 0;

  const streakAnimatedFor = useUserStore((s) => s.streakAnimatedFor);
  const markStreakAnimated = useUserStore((s) => s.markStreakAnimated);

  // Derive ignite state directly from the store — avoids setState-in-effect.
  // The store flip (900ms later) re-renders and ends the animation.
  const igniting = isBurning && streakAnimatedFor !== today;

  useEffect(() => {
    if (!igniting) return;
    const t = setTimeout(() => markStreakAnimated(today), 900);
    return () => clearTimeout(t);
  }, [igniting, today, markStreakAnimated]);

  const tooltip = isBurning
    ? streakMultiplier && streakMultiplier > 1
      ? `${displayStreak}-day streak \u00b7 +${Math.round((streakMultiplier - 1) * 100)}% XP bonus`
      : `${displayStreak}-day streak \u2014 active today`
    : broken
      ? "Streak broken. Complete something today to start a new one."
      : `${displayStreak}-day streak \u2014 complete today\u2019s activity before midnight to keep it`;

  const stateClass = isBurning
    ? igniting
      ? "streak-flame-ignite"
      : "streak-flame-burning"
    : "streak-flame-cold";

  return (
    <div className="streak-flame-wrap" title={tooltip} aria-label={tooltip}>
      <span
        className="streak-flame-num"
        style={{
          color: isBurning ? "var(--accent-ember)" : "var(--text-muted)",
        }}
      >
        {displayStreak}
      </span>
      <svg
        className={`streak-flame-icon ${stateClass}`}
        viewBox="0 0 24 32"
        aria-hidden="true"
      >
        {/* Outer teardrop flame silhouette */}
        <path
          className="streak-flame-outer"
          d="M12 2 C 8 8, 4 12, 4 18 C 4 25, 8 30, 12 30 C 16 30, 20 25, 20 18 C 20 14, 17 12, 15 8 C 14 11, 13 12, 12 11 C 12 8, 13 5, 12 2 Z"
        />
        {/* Inner hot core — only visible when burning */}
        <path
          className="streak-flame-core"
          d="M12 14 C 10 17, 9 19, 9 22 C 9 26, 10 28, 12 28 C 14 28, 15 26, 15 22 C 15 19, 13 17, 12 14 Z"
        />
      </svg>
    </div>
  );
}

/**
 * Whole-day difference between today and the last activity, using UTC
 * (matches the backend's `CURRENT_DATE`). Returns null if the input is
 * missing or unparsable.
 */
function daysSinceActivity(
  lastActivity: string | null,
  todayIso: string,
): number | null {
  if (!lastActivity) return null;
  // YYYY-MM-DD comparison: parse both as UTC midnight, diff in days.
  const lastMs = Date.parse(`${lastActivity}T00:00:00Z`);
  const todayMs = Date.parse(`${todayIso}T00:00:00Z`);
  if (Number.isNaN(lastMs) || Number.isNaN(todayMs)) return null;
  return Math.floor((todayMs - lastMs) / 86_400_000);
}
