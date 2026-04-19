"use client";

import type { SkillNode } from "@/types";

const TIER_COLOR: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

interface PublicNodePeekProps {
  node: SkillNode;
  onClose: () => void;
}

/**
 * Read-only detail card for the public tree view. Mirrors NodeDetailPanel's
 * look but strips every mutation affordance (Begin / Complete / Reset) and
 * every profile-gated readout (XP earned, streak bonus, etc.) — public
 * viewers aren't meant to see or trigger state changes.
 */
export function PublicNodePeek({ node, onClose }: PublicNodePeekProps) {
  return (
    <>
      <div
        className="node-detail-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="node-detail-panel flex flex-col"
        style={{ backgroundColor: "var(--bg-shadow)", zIndex: 20 }}
      >
        <div className="node-detail-drag-handle" aria-hidden="true" />

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
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h3
            className="text-lg font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            {node.title}
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            {node.description}
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--text-muted)" }}>XP Reward</span>
              <span style={{ color: "var(--accent-gold)" }}>+{node.xp_reward} XP</span>
            </div>
            {node.estimated_time && (
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Est. Time</span>
                <span style={{ color: "var(--text-secondary)" }}>{node.estimated_time}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
