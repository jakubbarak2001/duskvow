"use client";

import type { NodeProps } from "@xyflow/react";

interface TierLabelData {
  roman: string;
  title: string;
}

/**
 * Decorative tier/chapter label that sits in the left gutter of each row.
 * Rendered as a React Flow node so it pans and zooms with the tree, but it's
 * non-interactive (see `selectable: false` at the call site).
 */
export function TierLabelNode({ data }: NodeProps) {
  const { roman, title } = data as unknown as TierLabelData;

  return (
    <div className="tree-tier-label" aria-hidden="true">
      <span className="tree-tier-label-roman">{roman}</span>
      <span className="tree-tier-label-divider">—</span>
      <span className="tree-tier-label-title">{title}</span>
    </div>
  );
}
