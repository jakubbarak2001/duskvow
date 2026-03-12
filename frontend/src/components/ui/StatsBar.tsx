"use client";

interface StatsBarProps {
  totalXp: number;
  currentStreak: number;
  nodesCompleted: number;
  totalNodes: number;
}

export function StatsBar({ totalXp, currentStreak, nodesCompleted, totalNodes }: StatsBarProps) {
  return (
    <div className="flex gap-6 px-4 py-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{totalXp}</div>
        <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Total XP</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: "var(--accent-ember)" }}>{currentStreak}</div>
        <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Day Streak</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: "var(--state-complete)" }}>{nodesCompleted}/{totalNodes}</div>
        <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Nodes Done</div>
      </div>
    </div>
  );
}
