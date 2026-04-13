"use client";

import type { DailyQuest } from "@/types";
import { useTreeStore } from "@/stores/treeStore";

interface QuestLogPanelProps {
  quests: DailyQuest[];
  onToggle: (quest: DailyQuest) => void;
}

export function QuestLogPanel({ quests, onToggle }: QuestLogPanelProps) {
  // Persisted in treeStore so the panel remembers its state across mounts;
  // defaults to collapsed (rail-only) per T8 — the user mostly wants canvas
  // room and can tap to reveal quests when needed.
  const expanded = useTreeStore((s) => s.questLogExpanded);
  const setExpanded = useTreeStore((s) => s.setQuestLogExpanded);
  const collapsed = !expanded;

  const completedCount = quests.filter((q) => q.completed_today).length;

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        width: "260px",
        backgroundColor: "rgba(18,18,26,0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--border-muted)",
        borderRadius: "8px",
        zIndex: 10,
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Daily Quests
        </span>
        <span
          style={{
            fontSize: "0.65rem",
            color: completedCount === quests.length ? "var(--accent-gold)" : "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          {completedCount}/{quests.length}
        </span>
      </button>

      {/* Quest list — collapsible */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1">
          {quests.map((quest) => (
            <button
              key={quest.id}
              onClick={() => onToggle(quest)}
              className="w-full flex items-center gap-2 py-1 rounded transition-colors"
              style={{ textAlign: "left" }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: "13px",
                  height: "13px",
                  borderRadius: "3px",
                  border: `1.5px solid ${quest.completed_today ? "var(--accent-gold)" : "var(--accent-ember)"}`,
                  backgroundColor: quest.completed_today ? "var(--accent-gold)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {quest.completed_today && (
                  <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="var(--bg-abyss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <span
                className="flex-1"
                style={{
                  fontSize: "0.7rem",
                  color: quest.completed_today ? "var(--text-muted)" : "var(--text-secondary)",
                  textDecoration: quest.completed_today ? "line-through" : "none",
                  lineHeight: 1.3,
                  transition: "all 0.2s ease",
                }}
              >
                {quest.title}
              </span>

              {/* XP */}
              <span
                style={{
                  fontSize: "0.6rem",
                  color: quest.completed_today ? "var(--text-muted)" : "var(--accent-gold)",
                  flexShrink: 0,
                  opacity: quest.completed_today ? 0.5 : 0.8,
                }}
              >
                +{quest.xp_reward}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
