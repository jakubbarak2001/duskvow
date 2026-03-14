"use client";

import { useState } from "react";
import type { SkillNode } from "@/types";
import { api } from "@/lib/api";

const TIER_COLOR: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

interface NodeDetailPanelProps {
  node: SkillNode | null;
  token: string;
  onNodeUpdate: (nodeId: string, newState: SkillNode["state"]) => void;
  onXpEarned: (xp: number, totalXp: number) => void;
  onClose: () => void;
}

export function NodeDetailPanel({
  node,
  token,
  onNodeUpdate,
  onXpEarned,
  onClose,
}: NodeDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!node) return null;

  const canStart =
    node.state === "available" && !loading;
  const canComplete =
    (node.state === "available" || node.state === "in_progress") && !loading;
  const canReset =
    (node.state === "in_progress" || node.state === "completed") && !loading;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    const res = await api.startNode(node.id, token);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
    } else {
      onNodeUpdate(node.id, "in_progress");
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    const res = await api.completeNode(node.id, token);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
    } else if (res.data) {
      onNodeUpdate(node.id, "completed");
      onXpEarned(res.data.xp_earned, res.data.total_xp);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    const res = await api.resetNode(node.id, token);
    setLoading(false);
    if (res.error) {
      setError(res.error.message);
    } else {
      onNodeUpdate(node.id, "available");
    }
  };

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 flex flex-col"
      style={{
        backgroundColor: "var(--bg-shadow)",
        borderLeft: "1px solid var(--border-default)",
        zIndex: 10,
        animation: "tree-reveal 0.2s ease-out",
      }}
    >
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
            <span style={{ color: "var(--text-muted)" }}>Type</span>
            <span
              className="capitalize"
              style={{ color: "var(--text-secondary)" }}
            >
              {node.node_type}
            </span>
          </div>
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
            disabled={loading}
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
            disabled={loading}
            className="w-full py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-ember)",
              color: "var(--text-primary)",
            }}
          >
            {loading ? "Marking Complete…" : `Complete (+${node.xp_reward} XP)`}
          </button>
        )}

        {canReset && (
          <button
            onClick={handleReset}
            disabled={loading}
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
  );
}
