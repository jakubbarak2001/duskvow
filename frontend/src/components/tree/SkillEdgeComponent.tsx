"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/**
 * Painted edge linking two skill nodes. Two visual states:
 *
 *   - **lit** (source completed) — a thick gold stroke with a soft glow,
 *     plus a crawling dash animation that reads as "power flowing."
 *   - **dim** (source not yet completed) — a muted ember stroke suggesting
 *     potential power, not yet unlocked.
 *
 * The dim/lit choice is driven by `data.completed`, which upstream wiring
 * sets to true whenever the source node is in the `completed` state. That
 * lets us pre-light the entire completed subgraph on mount without any
 * per-frame React state — the animation is pure CSS.
 */
export function SkillEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const isLit = (data as { completed?: boolean })?.completed;

  // Edge routing — rectilinear subway style. Each edge descends
  // vertically out of the source, makes ONE 90° turn at a y-level that
  // always sits halfway between the two handle rows, travels sideways,
  // turns a second time, and descends into the target.
  //
  // Key choices:
  //   borderRadius: 0 — sharp corners. The prior `12` rounded off the
  //     turns so heavily that short lateral offsets looked like a
  //     continuous curve instead of a deliberate step.
  //   centerY: halfway between the handles — forces every edge sharing
  //     the same parent/child row to turn at the same y, so parallel
  //     edges line up as horizontal rails instead of reading as jitter.
  const centerY = sourceY + (targetY - sourceY) / 2;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
    centerY,
  });

  return (
    <g className={isLit ? "skill-edge skill-edge-lit" : "skill-edge skill-edge-dim"}>
      {/* Outer glow — thicker, lower-opacity stroke sitting under the main path */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: isLit ? "rgba(255, 215, 0, 0.45)" : "rgba(200, 75, 17, 0.18)",
          strokeWidth: isLit ? 8 : 5,
          fill: "none",
          pointerEvents: "none",
        }}
      />
      {/* Core stroke — the painted vein */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isLit ? "var(--accent-gold)" : "rgba(200, 75, 17, 0.55)",
          strokeWidth: isLit ? 3 : 2,
          fill: "none",
          strokeLinecap: "round",
          filter: isLit
            ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))"
            : "none",
          transition: "stroke 0.4s ease, stroke-width 0.4s ease",
        }}
        className={isLit ? "skill-edge-core-lit" : "skill-edge-core-dim"}
      />
    </g>
  );
}
