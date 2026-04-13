"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SkillNode } from "@/types";
import { NodeFrame } from "@/components/tree/NodeFrame";
import { NodeTooltip } from "@/components/tree/NodeTooltip";

/** Map the domain node_type to the frame shape. */
const SHAPE_BY_TYPE = {
  habit: "circle",
  action: "square",
  choice: "diamond",
  keystone: "hex",
} as const;

/** Rune glyphs used when no per-node icon art is available. */
const FALLBACK_GLYPH_BY_TYPE: Record<SkillNode["node_type"], string> = {
  habit: "\u25C7", // ◇  open diamond — daily ritual
  action: "\u25A2", // ▢  square rune — one-time act
  choice: "\u273F", // ✿  rosette — branching choice
  keystone: "\u2726", // ✦  four-pointed star — keystone
};

/*
 * Painted node tile — outer frame (rarity-tinted SVG) + inner icon slot + label strip below.
 * The icon slot prefers a painted <img> at public/images/nodes/{node_type}.webp when present;
 * otherwise falls back to a rune glyph. Images are user-generated per CLAUDE.md policy.
 *
 * AI generation prompts for fallback art (user generates externally):
 * - habit.webp:    "Dark fantasy circular icon, daily ritual symbol, ember glow, hand-painted texture, 128x128"
 * - action.webp:   "Dark fantasy squared icon, ancient rune of action, gold inlay, hand-painted, 128x128"
 * - choice.webp:   "Dark fantasy diamond icon, branching path symbol, ember and shadow, hand-painted, 128x128"
 * - keystone.webp: "Dark fantasy hexagonal icon, monumental seal of power, radiant gold, hand-painted, 128x128"
 */
export function SkillNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as SkillNode;
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isLocked = node.state === "locked";
  const frameSize = node.node_type === "keystone" ? 120 : 88;
  const shape = SHAPE_BY_TYPE[node.node_type] ?? "square";
  const iconPath = `/images/nodes/${node.node_type}.webp`;

  const glyph = (
    <>
      {!imgFailed && (
        <img
          src={iconPath}
          alt=""
          className="skill-frame-img"
          style={{ opacity: imgLoaded ? 1 : 0 }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          draggable={false}
        />
      )}
      {/* Rune glyph fallback — visible until the painted icon loads, then under it */}
      <span
        className="skill-frame-rune"
        style={{ opacity: imgLoaded && !imgFailed ? 0 : 1 }}
        aria-hidden="true"
      >
        {FALLBACK_GLYPH_BY_TYPE[node.node_type]}
      </span>
    </>
  );

  return (
    <div
      className="skill-node-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ opacity: isLocked ? 0.55 : 1 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: "none" }}
      />

      <NodeFrame
        shape={shape}
        rarity={node.tier}
        state={node.state}
        size={frameSize}
        glyph={glyph}
        selected={selected}
      />

      {/* Label strip — readable at 1.0 zoom, Cinzel 11px */}
      <div className="skill-node-label" style={{ maxWidth: frameSize + 40 }}>
        {node.title}
      </div>

      {/* Hover tooltip — richer detail without needing a click */}
      {hovered && <NodeTooltip node={node} />}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
