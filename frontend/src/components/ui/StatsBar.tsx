"use client";

interface StatsBarProps {
  totalXp: number;
  currentStreak: number;
  heroLevel?: number;
  heroTitle?: string;
  nodesCompleted?: number;
  totalNodes?: number;
  streakMultiplier?: number;
}

/** XP required to reach a given level: 25 * level^2 */
function xpForLevel(level: number): number {
  return 25 * level * level;
}

/** Streak bonus thresholds — mirrors backend level_unlocks.json */
const STREAK_THRESHOLDS = [
  { days: 3, multiplier: 1.05 },
  { days: 7, multiplier: 1.10 },
  { days: 14, multiplier: 1.15 },
  { days: 30, multiplier: 1.20 },
];

function getNextStreakMilestone(currentStreak: number): { days: number; bonus: number } | null {
  for (const t of STREAK_THRESHOLDS) {
    if (currentStreak < t.days) {
      return { days: t.days, bonus: Math.round((t.multiplier - 1) * 100) };
    }
  }
  return null;
}

export function StatsBar({
  totalXp,
  currentStreak,
  heroLevel,
  heroTitle,
  nodesCompleted,
  totalNodes,
  streakMultiplier,
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
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
            className="text-xs uppercase mb-3"
            style={{ color: "var(--text-secondary)", letterSpacing: "0.2em", fontFamily: "var(--font-heading)" }}
          >
            {title}
          </div>
          {/* XP progress to next level */}
          <div
            className="h-1 rounded-full overflow-hidden w-24"
            style={{ backgroundColor: "var(--bg-highlight)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${xpProgress * 100}%`,
                backgroundColor: "var(--accent-gold)",
                boxShadow: "0 0 6px rgba(255,215,0,0.7)",
              }}
            />
          </div>
          <div
            className="mt-1"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.1em" }}
          >
            {xpToNext} XP to next level
          </div>
        </div>

        {/* Separator */}
        <div
          className="w-px my-4"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        {/* Streak */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <div
            className="text-5xl font-bold mb-1 dash-stat-streak"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--accent-ember)",
            }}
          >
            {currentStreak}
          </div>
          <div
            className="text-xs uppercase"
            style={{ color: "var(--text-muted)", letterSpacing: "0.25em" }}
          >
            Day Streak
          </div>
          {(streakMultiplier ?? 1) > 1.0 && (
            <div
              className="mt-1.5"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3em",
                fontFamily: "var(--font-heading)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "var(--accent-gold)",
                backgroundColor: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: "2px",
                padding: "0.15rem 0.4rem",
              }}
            >
              <span style={{ color: "var(--accent-ember)", fontSize: "0.65rem" }}>&#x25CF;</span>
              +{Math.round(((streakMultiplier ?? 1) - 1) * 100)}% XP
            </div>
          )}
          {(() => {
            const next = getNextStreakMilestone(currentStreak);
            if (!next) return null;
            const daysNeeded = next.days - currentStreak;
            return (
              <div
                className="mt-1"
                style={{
                  fontSize: "0.55rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.05em",
                }}
              >
                {daysNeeded} more day{daysNeeded !== 1 ? "s" : ""} until +{next.bonus}% XP
              </div>
            );
          })()}
        </div>

        {showNodes && (
          <>
            {/* Separator */}
            <div
              className="w-px my-4"
              style={{ backgroundColor: "var(--border-default)" }}
            />

            {/* Nodes */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
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
                Nodes Done
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
