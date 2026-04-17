"use client";

import { useRouter } from "next/navigation";
import type { TalentTree } from "@/types";

interface TreeHeaderProps {
  tree: TalentTree;
}

/**
 * Manuscript-style tree header. Replaces the plain title bar with a block
 * that says "this is *your* vow" before the user even looks at a node.
 *
 * Three responsibilities:
 *   1. Atmospheric framing — eyebrow, ornate divider, painted typography
 *   2. Identity injection — the tree title is the page's primary visual mass
 *   3. Build summary — nodes / paths / XP stats collapsed into a single pill row,
 *      so StatsBar on the tree page can focus on profile-level stats (level + streak)
 */
export function TreeHeader({ tree }: TreeHeaderProps) {
  const router = useRouter();

  const completed = tree.completed_nodes;
  const total = tree.total_nodes;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Count unique first-step branches — nodes with no prerequisites represent
  // independent paths the user can pursue. Falls back to 1 if nodes weren't loaded.
  const pathsUnlocked =
    tree.nodes?.filter((n) => n.prerequisites.length === 0).length ?? 1;

  return (
    <div className="tree-header">
      <button
        onClick={() => router.push("/vows")}
        className="tree-header-back"
        aria-label="Back to Vow Chamber"
      >
        ← Vow Chamber
      </button>

      <div className="tree-header-inner">
        <div className="tree-header-eyebrow">◆ &nbsp; Your Vow &nbsp; ◆</div>

        <h1 className="tree-header-title">{tree.title}</h1>

        {tree.description && (
          <p className="tree-header-subtitle">{tree.description}</p>
        )}

        <div className="tree-header-divider" aria-hidden="true">
          <span className="tree-header-divider-line" />
          <span className="tree-header-divider-mark">✦</span>
          <span className="tree-header-divider-line" />
        </div>

        <div className="tree-header-pills">
          <div className="tree-header-pill">
            <span className="tree-header-pill-value">
              {completed}
              <span className="tree-header-pill-value-sep">/</span>
              {total}
            </span>
            <span className="tree-header-pill-label">Nodes</span>
          </div>

          <div className="tree-header-pill-sep" aria-hidden="true" />

          <div className="tree-header-pill">
            <span className="tree-header-pill-value">{pathsUnlocked}</span>
            <span className="tree-header-pill-label">
              {pathsUnlocked === 1 ? "Path" : "Paths"} Open
            </span>
          </div>

          <div className="tree-header-pill-sep" aria-hidden="true" />

          <div className="tree-header-pill">
            <span className="tree-header-pill-value">{pct}%</span>
            <span className="tree-header-pill-label">Walked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
