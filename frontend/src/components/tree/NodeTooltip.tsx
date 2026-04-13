"use client";

import type { SkillNode } from "@/types";

interface NodeTooltipProps {
  node: SkillNode;
}

/**
 * Lightweight hover card that surfaces a node's title, description, tier,
 * XP reward and prerequisite state — so the user can scan the tree without
 * opening the full NodeDetailPanel. Positioned absolutely above the node.
 */
export function NodeTooltip({ node }: NodeTooltipProps) {
  const stateLabel = node.state.replace("_", " ");
  const hasPrereqs = node.prerequisites.length > 0;

  return (
    <div className="node-tooltip" role="tooltip">
      <div className="node-tooltip-header">
        <span className={`node-tooltip-tier node-tooltip-tier-${node.tier}`}>
          {node.tier}
        </span>
        <span className="node-tooltip-xp">+{node.xp_reward} XP</span>
      </div>

      <div className="node-tooltip-title">{node.title}</div>

      {node.description && (
        <p className="node-tooltip-desc">{node.description}</p>
      )}

      <div className="node-tooltip-meta">
        <span className={`node-tooltip-state node-tooltip-state-${node.state}`}>
          {stateLabel}
        </span>
        {node.estimated_time && (
          <span className="node-tooltip-time">{node.estimated_time}</span>
        )}
      </div>

      {hasPrereqs && node.state === "locked" && (
        <div className="node-tooltip-prereqs">
          Requires {node.prerequisites.length} prerequisite
          {node.prerequisites.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
