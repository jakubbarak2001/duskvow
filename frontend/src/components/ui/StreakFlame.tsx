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
 * Three visual states:
 *  - Cold    → user hasn't completed today's activity. Hollow outline flame.
 *  - Ignite  → one-shot transition when flame first flips to burning in a session.
 *  - Burning → today's activity is done. Filled flame with subtle flicker.
 *
 * Cross-navigation ignite detection: the user completes daily activities on
 * /vows or /quests (not /dashboard), so when they come back the profile is
 * already burning. A Zustand slice tracks the last date we played the
 * ignite animation — on first dashboard visit of the day, the animation
 * plays exactly once.
 */
export function StreakFlame({
  currentStreak,
  lastActivityDate,
  streakMultiplier,
}: StreakFlameProps) {
  const today = new Date().toISOString().slice(0, 10);
  const isBurning = lastActivityDate === today;

  const streakAnimatedFor = useUserStore((s) => s.streakAnimatedFor);
  const markStreakAnimated = useUserStore((s) => s.markStreakAnimated);

  // Derive ignite state directly from the store — avoids setState-in-effect.
  // The store flip (900ms later) re-renders and ends the animation.
  const igniting = isBurning && streakAnimatedFor !== today;

  useEffect(() => {
    if (!igniting) return;
    // Delay the store write so the ignite class stays active for the full
    // animation window; cleanup clears the pending write on unmount/change.
    const t = setTimeout(() => markStreakAnimated(today), 900);
    return () => clearTimeout(t);
  }, [igniting, today, markStreakAnimated]);

  const tooltip = isBurning
    ? streakMultiplier && streakMultiplier > 1
      ? `${currentStreak}-day streak \u00b7 +${Math.round((streakMultiplier - 1) * 100)}% XP bonus`
      : `${currentStreak}-day streak \u2014 active today`
    : `${currentStreak}-day streak \u2014 complete today\u2019s activity to relight`;

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
        {currentStreak}
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
