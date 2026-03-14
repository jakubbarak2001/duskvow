"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

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
  const isCompleted = (data as { completed?: boolean })?.completed;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: isCompleted ? "var(--accent-gold)" : "var(--border-default)",
        strokeWidth: isCompleted ? 2 : 1.5,
        opacity: isCompleted ? 0.8 : 0.5,
        transition: "all 0.3s ease",
      }}
    />
  );
}
