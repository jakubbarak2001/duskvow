"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TalentTree } from "@/types";

interface TreeHeaderProps {
  tree: TalentTree;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onShareClick?: () => void;
}

/**
 * Slim one-row tree bar. Back · title · pills · info · focus.
 * Description lives behind the info button (popover) instead of
 * consuming ~50px of vertical space by default — the tree is the
 * product, not the framing.
 */
export function TreeHeader({
  tree,
  onToggleFullscreen,
  isFullscreen,
  onShareClick,
}: TreeHeaderProps) {
  const router = useRouter();
  const [descOpen, setDescOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const completed = tree.completed_nodes;
  const total = tree.total_nodes;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pathsUnlocked =
    tree.nodes?.filter((n) => n.prerequisites.length === 0).length ?? 1;

  useEffect(() => {
    if (!descOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDescOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setDescOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [descOpen]);

  return (
    <div className="tree-header-slim">
      <button
        onClick={() => router.push("/vows")}
        className="tree-header-slim-back"
        aria-label="Back to Vow Chamber"
      >
        <span aria-hidden="true">←</span>
        <span className="tree-header-slim-back-label">Vow Chamber</span>
      </button>

      <div className="tree-header-slim-divider" aria-hidden="true" />

      <h1 className="tree-header-slim-title" title={tree.title}>
        {tree.title}
      </h1>

      <div className="tree-header-slim-info-wrap" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setDescOpen((o) => !o)}
          aria-expanded={descOpen}
          aria-label="Show vow details"
          className="tree-header-slim-info"
        >
          i
        </button>
        {descOpen && (
          <div className="tree-header-slim-popover" role="dialog">
            {tree.description && (
              <p className="tree-header-slim-popover-text">{tree.description}</p>
            )}
            <div className="tree-header-slim-popover-stats">
              <div className="tree-header-slim-popover-stat">
                <span className="tree-header-slim-popover-stat-value">
                  {completed}<span className="tree-header-slim-pill-sep">/</span>{total}
                </span>
                <span className="tree-header-slim-popover-stat-label">Steps</span>
              </div>
              <div className="tree-header-slim-popover-stat">
                <span className="tree-header-slim-popover-stat-value">{pathsUnlocked}</span>
                <span className="tree-header-slim-popover-stat-label">
                  {pathsUnlocked === 1 ? "Path" : "Paths"} Open
                </span>
              </div>
              <div className="tree-header-slim-popover-stat">
                <span className="tree-header-slim-popover-stat-value">{pct}%</span>
                <span className="tree-header-slim-popover-stat-label">Walked</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tree-header-slim-pills">
        <div className="tree-header-slim-pill">
          <span className="tree-header-slim-pill-value">
            {completed}
            <span className="tree-header-slim-pill-sep">/</span>
            {total}
          </span>
          <span className="tree-header-slim-pill-label">Steps</span>
        </div>
        <div className="tree-header-slim-pill">
          <span className="tree-header-slim-pill-value">{pathsUnlocked}</span>
          <span className="tree-header-slim-pill-label">
            {pathsUnlocked === 1 ? "Path" : "Paths"}
          </span>
        </div>
        <div className="tree-header-slim-pill">
          <span className="tree-header-slim-pill-value">{pct}%</span>
          <span className="tree-header-slim-pill-label">Walked</span>
        </div>
      </div>

      {onShareClick && (
        <button
          type="button"
          onClick={onShareClick}
          className="tree-header-slim-focus"
          aria-label={tree.is_public ? "Manage share link" : "Share vow"}
          title={tree.is_public ? "Manage share link" : "Share vow"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {tree.is_public && <span className="tree-header-slim-share-dot" aria-hidden="true" />}
        </button>
      )}

      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="tree-header-slim-focus"
          aria-label={isFullscreen ? "Exit focus mode (F)" : "Focus mode (F)"}
          title={isFullscreen ? "Exit focus mode (F)" : "Focus mode (F)"}
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3v4H4M16 3v4h4M8 21v-4H4M16 21v-4h4" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8V4h4M21 8V4h-4M3 16v4h4M21 16v4h-4" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
