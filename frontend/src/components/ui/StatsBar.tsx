"use client";

interface StatsBarProps {
  totalXp: number;
  currentStreak: number;
  nodesCompleted: number;
  totalNodes: number;
}

const XP_MILESTONE = 500;

export function StatsBar({ totalXp, currentStreak, nodesCompleted, totalNodes }: StatsBarProps) {
  const xpInMilestone = totalXp % XP_MILESTONE;
  const xpProgress = xpInMilestone / XP_MILESTONE;
  const xpToNext = XP_MILESTONE - xpInMilestone;

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
        {/* XP */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <div
            className="text-5xl font-bold mb-1 dash-stat-xp"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--accent-gold)",
            }}
          >
            {totalXp.toLocaleString()}
          </div>
          <div
            className="text-xs uppercase mb-3"
            style={{ color: "var(--text-muted)", letterSpacing: "0.25em" }}
          >
            Total XP
          </div>
          {/* Mini XP progress bar */}
          <div
            className="h-1 rounded-full overflow-hidden w-20"
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
            {xpToNext} XP to milestone
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
        </div>

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
      </div>
    </div>
  );
}
