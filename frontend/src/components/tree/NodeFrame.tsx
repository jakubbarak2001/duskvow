"use client";

/**
 * NodeFrame — a painted SVG frame that wraps a skill node's icon slot.
 *
 * Handles both shape (per node_type) and rarity treatment in one component.
 * The actual rune/icon glyph is passed as the `glyph` prop so the frame
 * component stays purely visual. Background colors and border styles are
 * wired to CSS custom properties so they respect the global design tokens.
 */

import type { SkillNode } from "@/types";

type Shape = "circle" | "square" | "diamond" | "hex";
type Rarity = SkillNode["tier"];
type NodeState = SkillNode["state"];

interface NodeFrameProps {
  shape: Shape;
  rarity: Rarity;
  state: NodeState;
  size: number;
  glyph: React.ReactNode;
  selected?: boolean;
}

const RARITY_CLASS: Record<Rarity, string> = {
  common: "skill-frame-common",
  uncommon: "skill-frame-uncommon",
  rare: "skill-frame-rare",
  epic: "skill-frame-epic",
  legendary: "skill-frame-legendary",
  mythic: "skill-frame-mythic",
};

/** Return the SVG path for the frame shape at the given size. */
function shapePath(shape: Shape, size: number, inset: number): string {
  const s = size;
  const i = inset;
  const c = s / 2;
  const r = c - i;

  if (shape === "circle") {
    return `M ${c} ${i} A ${r} ${r} 0 1 1 ${c} ${s - i} A ${r} ${r} 0 1 1 ${c} ${i} Z`;
  }

  if (shape === "square") {
    const rad = 10;
    return [
      `M ${i + rad} ${i}`,
      `L ${s - i - rad} ${i}`,
      `Q ${s - i} ${i}, ${s - i} ${i + rad}`,
      `L ${s - i} ${s - i - rad}`,
      `Q ${s - i} ${s - i}, ${s - i - rad} ${s - i}`,
      `L ${i + rad} ${s - i}`,
      `Q ${i} ${s - i}, ${i} ${s - i - rad}`,
      `L ${i} ${i + rad}`,
      `Q ${i} ${i}, ${i + rad} ${i}`,
      "Z",
    ].join(" ");
  }

  if (shape === "diamond") {
    return [
      `M ${c} ${i}`,
      `L ${s - i} ${c}`,
      `L ${c} ${s - i}`,
      `L ${i} ${c}`,
      "Z",
    ].join(" ");
  }

  // hex — flat-top hexagon
  const dx = (s - 2 * i) * 0.25;
  return [
    `M ${i + dx} ${i}`,
    `L ${s - i - dx} ${i}`,
    `L ${s - i} ${c}`,
    `L ${s - i - dx} ${s - i}`,
    `L ${i + dx} ${s - i}`,
    `L ${i} ${c}`,
    "Z",
  ].join(" ");
}

export function NodeFrame({
  shape,
  rarity,
  state,
  size,
  glyph,
  selected,
}: NodeFrameProps) {
  const outerPath = shapePath(shape, size, 2);
  const innerPath = shapePath(shape, size, 6);

  const isLocked = state === "locked";
  const isAvailable = state === "available";
  const isInProgress = state === "in_progress";
  const isCompleted = state === "completed";

  const stateClass = isLocked
    ? "skill-frame-locked"
    : isCompleted
      ? "skill-frame-completed"
      : isAvailable
        ? "skill-frame-available"
        : isInProgress
          ? "skill-frame-in-progress"
          : "";

  // Unique gradient id scoped to this rendered node — prevents cross-node bleed.
  const gradId = `sf-grad-${rarity}-${shape}-${size}`;
  const glowId = `sf-glow-${rarity}`;

  return (
    <div
      className={`skill-frame ${RARITY_CLASS[rarity]} ${stateClass}${selected ? " skill-frame-selected" : ""}`}
      style={{ width: size, height: size }}
      data-shape={shape}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="skill-frame-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="skill-frame-grad-start" />
            <stop offset="50%" className="skill-frame-grad-mid" />
            <stop offset="100%" className="skill-frame-grad-end" />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop
              offset="100%"
              className="skill-frame-glow-stop"
            />
          </radialGradient>
        </defs>

        {/* Outer painted frame — stroke carries the rarity gradient */}
        <path
          d={outerPath}
          className="skill-frame-outer"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Inner fill — the tile itself */}
        <path d={innerPath} className="skill-frame-inner" />

        {/* Inner radial glow wash for epic+ tiers */}
        <path d={innerPath} fill={`url(#${glowId})`} className="skill-frame-glow-wash" />

        {/* Mythic rotating sweep — only rendered for mythic; CSS hides on others */}
        <g className="skill-frame-sweep">
          <path d={innerPath} className="skill-frame-sweep-path" />
        </g>
      </svg>

      {/* Icon glyph slot — sits absolutely over the SVG */}
      <div className="skill-frame-glyph-slot">{glyph}</div>
    </div>
  );
}
