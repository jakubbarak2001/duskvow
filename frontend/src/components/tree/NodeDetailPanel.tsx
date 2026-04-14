"use client";

import { useState } from "react";
import type { SkillNode } from "@/types";
import { api } from "@/lib/api";
import { useTreeStore } from "@/stores/treeStore";
import { useAchievementToast } from "@/components/ui/AchievementProvider";

const TIER_COLOR: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

export interface LevelUpEvent {
  newLevel: number;
  previousLevel: number;
  newTitle: string;
  xpEarned: number;
}

interface NodeDetailPanelProps {
  node: SkillNode | null;
  token: string;
  onNodeUpdate: (nodeId: string, newState: SkillNode["state"]) => void;
  onXpEarned: (xp: number, totalXp: number) => void;
  onLevelUp?: (event: LevelUpEvent) => void;
  onClose: () => void;
}

export function NodeDetailPanel({
  node,
  token,
  onNodeUpdate,
  onXpEarned,
  onLevelUp,
  onClose,
}: NodeDetailPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [lastEarned, setLastEarned] = useState<{ base: number; bonus: number } | null>(null);
  const { completionPending, setCompletionPending } = useTreeStore();
  const { showAchievements, showStreakMilestone } = useAchievementToast();

  if (!node) return null;

  const canStart = node.state === "available";
  const canComplete = node.state === "available" || node.state === "in_progress";
  const canReset = node.state === "in_progress" || node.state === "completed";

  const handleStart = async () => {
    setError(null);
    onNodeUpdate(node.id, "in_progress");
    const res = await api.startNode(node.id, token);
    if (res.error) {
      onNodeUpdate(node.id, "available");
      setError(res.error.message);
    }
  };

  const handleComplete = async () => {
    if (completionPending) return;
    setError(null);
    setCompletionPending(true);
    onNodeUpdate(node.id, "completed");
    const res = await api.completeNode(node.id, token);
    setCompletionPending(false);
    if (res.error) {
      onNodeUpdate(node.id, node.state);
      setError(res.error.message);
    } else if (res.data) {
      onXpEarned(res.data.xp_earned, res.data.total_xp);
      setLastEarned({ base: res.data.base_xp, bonus: res.data.streak_bonus_xp });
      if (res.data.leveled_up && onLevelUp) {
        onLevelUp({
          newLevel: res.data.new_level,
          previousLevel: res.data.previous_level,
          newTitle: res.data.new_title,
          xpEarned: res.data.xp_earned,
        });
      }
      if (res.data.new_achievements?.length) {
        showAchievements(res.data.new_achievements);
      }
      if (res.data.streak_milestone) {
        showStreakMilestone(res.data.streak_milestone);
      }
    }
  };

  const handleReset = async () => {
    setError(null);
    onNodeUpdate(node.id, "available");
    const res = await api.resetNode(node.id, token);
    if (res.error) {
      onNodeUpdate(node.id, node.state);
      setError(res.error.message);
    }
  };

  return (
    <>
      {/* Mobile-only backdrop — tap to dismiss. Hidden on desktop via CSS. */}
      <div
        className="node-detail-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="node-detail-panel flex flex-col"
        style={{
          backgroundColor: "var(--bg-shadow)",
          borderLeft: "1px solid var(--border-default)",
          zIndex: 20,
        }}
      >
        {/* Drag handle — visible only on mobile, purely decorative affordance */}
        <div className="node-detail-drag-handle" aria-hidden="true" />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
        <span
          className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${TIER_COLOR[node.tier]}20`,
            color: TIER_COLOR[node.tier],
          }}
        >
          {node.tier}
        </span>
        <button
          onClick={onClose}
          style={{ color: "var(--text-muted)" }}
          className="text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h3
          className="text-lg font-bold mb-3"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
          }}
        >
          {node.title}
        </h3>

        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          {node.description}
        </p>

        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: "var(--text-muted)" }}>XP Reward</span>
            <span style={{ color: "var(--accent-gold)" }}>
              +{node.xp_reward} XP
            </span>
          </div>
          {node.estimated_time && (
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-muted)" }}>Est. Time</span>
              <span style={{ color: "var(--text-secondary)" }}>
                {node.estimated_time}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: "var(--text-muted)" }}>Status</span>
            <span
              className="capitalize"
              style={{
                color:
                  node.state === "completed"
                    ? "var(--state-complete)"
                    : node.state === "in_progress"
                      ? "var(--state-progress)"
                      : node.state === "available"
                        ? "var(--state-available)"
                        : "var(--text-muted)",
              }}
            >
              {node.state.replace("_", " ")}
            </span>
          </div>
        </div>

        {node.is_optional && (
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Optional — you can skip this node.
          </p>
        )}

        {error && (
          <p
            className="text-xs mb-4 p-3 rounded"
            style={{
              backgroundColor: "rgba(139, 0, 0, 0.2)",
              color: "var(--text-primary)",
              border: "1px solid var(--accent-blood)",
            }}
          >
            {error}
          </p>
        )}

        {lastEarned && node.state === "completed" && (
          <div
            className="text-xs mb-4 p-3 rounded text-center"
            style={{
              backgroundColor: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.15)",
            }}
          >
            <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>
              +{lastEarned.base} XP
            </span>
            {lastEarned.bonus > 0 && (
              <span style={{ color: "var(--accent-ember)" }}>
                {" "}(+{lastEarned.bonus} streak bonus)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        className="px-5 py-4 flex flex-col gap-2"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        {node.state === "locked" && (
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Complete prerequisites to unlock this node.
          </p>
        )}

        {canStart && (
          <button
            onClick={handleStart}
            disabled={false}
            className="w-full py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--state-progress)",
              border: "1px solid var(--state-progress)",
            }}
          >
            Start Node
          </button>
        )}

        {canComplete && (
          <button
            onClick={handleComplete}
            disabled={completionPending}
            className="w-full py-2 rounded text-sm font-medium transition-opacity"
            style={{
              backgroundColor: "var(--accent-ember)",
              color: "var(--text-primary)",
              opacity: completionPending ? 0.5 : 1,
              cursor: completionPending ? "not-allowed" : "pointer",
            }}
          >
            {completionPending ? "Saving…" : `Complete (+${node.xp_reward} XP)`}
          </button>
        )}

        {canReset && (
          <button
            onClick={handleReset}
            disabled={false}
            className="w-full py-2 rounded text-sm"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border-default)",
            }}
          >
            Reset Node
          </button>
        )}
        </div>
      </div>
    </>
  );
}
