"use client";

import Link from "next/link";
import { useState } from "react";
import type { Node } from "@xyflow/react";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { PublicNodePeek } from "@/components/tree/PublicNodePeek";
import type { SkillNode, TalentTree } from "@/types";

interface PublicTreeViewProps {
  tree: TalentTree & { hero_name: string | null };
}

/**
 * Read-only public view. Uses the same TreeCanvas so visitors see the
 * tree exactly as the owner does — but clicks open a no-action peek
 * (title + description + XP) instead of the Begin / Complete / Reset
 * panel. There's no auth context and no mutation path.
 */
export function PublicTreeView({ tree }: PublicTreeViewProps) {
  const [peek, setPeek] = useState<SkillNode | null>(null);

  const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
    const skillNode = tree.nodes.find((n) => n.id === node.id) ?? null;
    setPeek(skillNode);
  };

  const completed = tree.completed_nodes;
  const total = tree.total_nodes;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const byline = tree.hero_name ?? "a fellow walker";

  return (
    <div
      className="tree-view-shell flex flex-col"
      style={{ backgroundColor: "var(--bg-abyss)" }}
    >
      <div className="public-tree-bar">
        <Link href="/" className="public-tree-brand" aria-label="Duskvow home">
          <span className="public-tree-brand-dusk">Dusk</span>
          <span className="public-tree-brand-vow">vow</span>
        </Link>

        <div className="public-tree-bar-divider" aria-hidden="true" />

        <div className="public-tree-meta">
          <h1 className="public-tree-title" title={tree.title}>{tree.title}</h1>
          <span className="public-tree-byline">by {byline}</span>
        </div>

        <div className="public-tree-pills">
          <div className="public-tree-pill">
            <span className="public-tree-pill-value">{total}</span>
            <span className="public-tree-pill-label">Steps</span>
          </div>
          <div className="public-tree-pill">
            <span className="public-tree-pill-value">{pct}%</span>
            <span className="public-tree-pill-label">Walked</span>
          </div>
        </div>

        <Link href="/auth" className="public-tree-cta">
          Start Your Own Vow
        </Link>
      </div>

      <div className="flex-1 relative overflow-hidden min-h-0">
        <TreeCanvas
          nodes={tree.nodes}
          onNodeClick={handleNodeClick}
          selectedNodeId={peek?.id}
        />

        {peek && <PublicNodePeek node={peek} onClose={() => setPeek(null)} />}
      </div>
    </div>
  );
}
