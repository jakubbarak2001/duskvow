"use client";

import { useEffect, useRef, useState } from "react";
import { xpForLevel } from "@/lib/levels";

interface StatsBarProps {
  totalXp: number;
  currentStreak: number;
  heroLevel?: number;
  heroTitle?: string;
  nodesCompleted?: number;
  totalNodes?: number;
  streakMultiplier?: number;
  lastActivityDate?: string | null;
}

export function StatsBar({
  totalXp,
  currentStreak,
  heroLevel,
  heroTitle,
  nodesCompleted,
  totalNodes,
  streakMultiplier,
  lastActivityDate,
}: StatsBarProps) {
  const showNodes = nodesCompleted !== undefined && totalNodes !== undefined;
  const level = heroLevel ?? 1;
  const title = heroTitle ?? "Wanderer";

  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpProgress = xpNeeded > 0 ? Math.min(1, Math.max(0, xpIntoLevel / xpNeeded)) : 1;
  const xpToNext = Math.max(0, nextLevelXp - totalXp);

  // XP pop animation — track previous XP to detect gains.
  // A timestamp-keyed pop (not a counter) forces React to remount the span
  // on each gain, replaying the CSS animation even when successive deltas
  // happen to repeat, without needing a functional-updater setState.
  const prevXpRef = useRef(totalXp);
  const [pop, setPop] = useState<{ key: number; delta: number } | null>(null);
  const [barFlash, setBarFlash] = useState(false);

  useEffect(() => {
    const prev = prevXpRef.current;
    if (totalXp > prev && prev > 0) {
      const gained = totalXp - prev;
      setPop({ key: Date.now(), delta: gained });
      setBarFlash(true);
      const timer = setTimeout(() => {
        setPop(null);
        setBarFlash(false);
      }, 1200);
      prevXpRef.current = totalXp;
      return () => clearTimeout(timer);
    }
    prevXpRef.current = totalXp;
  }, [totalXp]);

  return (
    <div
      className="w-full rounded-lg"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,215,0,0.05)",
      }}
    >
      <div className="flex items-stretch">
        {/* Level + Title */}
        <div className="stats-bar-cell flex-1 flex flex-col items-center justify-center px-6 py-6 relative">
          <div
            className="text-5xl font-bold mb-1 dash-stat-xp"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--accent-gold)",
              textShadow: "0 0 18px rgba(255,215,0,0.35)",
            }}
          >
            {level}
          </div>
          <div
            className="stats-bar-title text-xs uppercase mb-3"
            style={{ color: "var(--text-secondary)", letterSpacing: "0.2em", fontFamily: "var(--font-heading)" }}
          >
            {title}
          </div>
          {/* XP progress to next level */}
          <div
            className={`stats-bar-xp-track h-1 rounded-full overflow-hidden w-24${barFlash ? " xp-bar-flash" : ""}`}
            style={{ backgroundColor: "var(--bg-highlight)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${xpProgress * 100}%`,
                backgroundColor: "var(--accent-gold)",
                boxShadow: "0 0 6px rgba(255,215,0,0.7)",
                transition: "width 0.4s ease-out",
              }}
            />
          </div>
          <div
            className="stats-bar-xp-caption mt-1"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em" }}
          >
            {xpToNext} XP to next level
          </div>

          {/* Floating +XP pop */}
          {pop !== null && (
            <span key={pop.key} className="xp-pop" style={{ top: "0.5rem", right: "1rem" }}>
              +{pop.delta} XP
            </span>
          )}
        </div>

        {/* Separator */}
        <div
          className="stats-bar-separator w-px my-4"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        {/* Streak — Brilliant-style minimal: big number + flame, tooltip carries the rest */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const isBurning = lastActivityDate === today;
          const bonusPct = Math.round(((streakMultiplier ?? 1) - 1) * 100);
          const tooltip =
            !isBurning
              ? `${currentStreak}-day streak \u2014 complete today\u2019s activity to relight`
              : bonusPct > 0
                ? `${currentStreak}-day streak \u00b7 +${bonusPct}% XP bonus`
                : `${currentStreak}-day streak \u2014 active today`;
          return (
            <div
              className="stats-bar-cell flex-1 flex items-center justify-center px-6 py-6"
              title={tooltip}
              aria-label={tooltip}
            >
              <div
                className="flex items-center gap-3"
                style={{
                  color: isBurning ? "var(--accent-ember)" : "var(--text-muted)",
                }}
              >
                <span
                  className="text-5xl font-bold dash-stat-streak"
                  style={{
                    fontFamily: "var(--font-heading)",
                    lineHeight: 1,
                  }}
                >
                  {currentStreak}
                </span>
                <svg
                  className={
                    isBurning
                      ? "stats-bar-streak-flame streak-flame-icon streak-flame-burning"
                      : "stats-bar-streak-flame streak-flame-icon streak-flame-cold"
                  }
                  viewBox="0 0 24 32"
                  aria-hidden="true"
                  style={{ width: "2.25rem", height: "3rem" }}
                >
                  <path
                    className="streak-flame-outer"
                    d="M12 2 C 8 8, 4 12, 4 18 C 4 25, 8 30, 12 30 C 16 30, 20 25, 20 18 C 20 14, 17 12, 15 8 C 14 11, 13 12, 12 11 C 12 8, 13 5, 12 2 Z"
                  />
                  <path
                    className="streak-flame-core"
                    d="M12 14 C 10 17, 9 19, 9 22 C 9 26, 10 28, 12 28 C 14 28, 15 26, 15 22 C 15 19, 13 17, 12 14 Z"
                  />
                </svg>
              </div>
            </div>
          );
        })()}

        {showNodes && (
          <>
            {/* Separator */}
            <div
              className="w-px my-4"
              style={{ backgroundColor: "var(--border-default)" }}
            />

            {/* Nodes */}
            <div className="stats-bar-cell flex-1 flex flex-col items-center justify-center px-6 py-6">
              <div
                className="text-5xl font-bold mb-1 dash-stat-nodes"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span style={{ color: "var(--state-complete)" }}>{nodesCompleted}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "2rem" }}>/{totalNodes}</span>
              </div>
              <div
                className="text-xs uppercase"
                style={{ color: "var(--text-muted)", letterSpacing: "0.25em" }}
              >
                Steps Walked
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
