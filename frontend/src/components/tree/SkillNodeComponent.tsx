"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SkillNode } from "@/types";

const TIER_GLOW: Record<string, string> = {
  common: "none",
  uncommon: "0 0 6px rgba(76, 175, 80, 0.5)",
  rare: "0 0 8px rgba(75, 178, 249, 0.5)",
  epic: "0 0 10px rgba(156, 39, 176, 0.6)",
  legendary: "0 0 12px rgba(255, 140, 0, 0.6)",
  mythic: "0 0 16px rgba(255, 215, 0, 0.8)",
};

const BORDER_COLOR: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

function NodeShape({
  nodeType,
  size,
  children,
  style,
  className,
}: {
  nodeType: string;
  size: number;
  children: React.ReactNode;
  style: React.CSSProperties;
  className?: string;
}) {
  if (nodeType === "choice") {
    // Diamond — outer rotated square with inner counter-rotated content
    return (
      <div
        className={className}
        style={{
          ...style,
          width: size * 0.85,
          height: size * 0.85,
          transform: "rotate(45deg)",
        }}
      >
        <div
          style={{
            transform: "rotate(-45deg)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (nodeType === "keystone") {
    // Hexagon via clip-path
    return (
      <div
        className={className}
        style={{
          ...style,
          clipPath:
            "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          borderRadius: 0,
        }}
      >
        {children}
      </div>
    );
  }

  if (nodeType === "habit") {
    // Circle
    return (
      <div
        className={className}
        style={{ ...style, borderRadius: "50%" }}
      >
        {children}
      </div>
    );
  }

  // action — square with slight rounding
  return (
    <div className={className} style={{ ...style, borderRadius: "6px" }}>
      {children}
    </div>
  );
}

export function SkillNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as SkillNode;
  const isLocked = node.state === "locked";
  const isAvailable = node.state === "available";
  const isCompleted = node.state === "completed";
  const isInProgress = node.state === "in_progress";

  const size = node.node_type === "keystone" ? 96 : 76;

  const borderColor = selected
    ? "var(--accent-gold)"
    : isCompleted
      ? "var(--accent-gold)"
      : isAvailable
        ? "var(--state-available)"
        : isInProgress
          ? "var(--state-progress)"
          : "rgba(128, 128, 128, 0.3)";

  const boxShadow = selected
    ? "0 0 0 2px var(--accent-gold), 0 0 16px rgba(255, 215, 0, 0.4)"
    : isCompleted
      ? TIER_GLOW[node.tier] || "none"
      : isAvailable
        ? "0 0 8px rgba(75, 178, 249, 0.4)"
        : isInProgress
          ? "0 0 8px rgba(255, 140, 0, 0.4)"
          : "none";

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    opacity: isLocked ? 0.45 : 1,
    backgroundColor: isCompleted
      ? "rgba(255, 215, 0, 0.08)"
      : "var(--bg-elevated)",
    border: `2px solid ${borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: isLocked ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    boxShadow,
    position: "relative",
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: "none" }}
      />

      <NodeShape
        nodeType={node.node_type}
        size={size}
        style={baseStyle}
        className={isAvailable ? "node-available" : undefined}
      >
        <div
          style={{
            padding: "4px 6px",
            textAlign: "center",
            maxWidth: size - 16,
            overflow: "hidden",
          }}
        >
          {isCompleted && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--accent-gold)",
                marginBottom: "1px",
              }}
            >
              ✦
            </div>
          )}
          <div
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: isLocked
                ? "var(--text-muted)"
                : isCompleted
                  ? "var(--accent-gold)"
                  : "var(--text-primary)",
              lineHeight: 1.25,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {node.title}
          </div>
          {node.node_type === "keystone" && (
            <div
              style={{
                fontSize: "8px",
                marginTop: "2px",
                color: "var(--rarity-mythic)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              ✦ Keystone
            </div>
          )}
        </div>
      </NodeShape>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </>
  );
}
