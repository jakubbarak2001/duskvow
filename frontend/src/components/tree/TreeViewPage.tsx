"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Node } from "@xyflow/react";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { useUserStore } from "@/stores/userStore";
import { useTreeStore } from "@/stores/treeStore";
import { Navbar } from "@/components/layout/Navbar";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { TreeHeader } from "@/components/tree/TreeHeader";
import { NodeDetailPanel } from "@/components/tree/NodeDetailPanel";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StatsBar } from "@/components/ui/StatsBar";
import { api } from "@/lib/api";
import type { LevelUpEvent } from "@/components/tree/NodeDetailPanel";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { titleForLevel } from "@/lib/levels";
import type { SkillNode, TalentTree } from "@/types";

export function TreeViewPage() {
  const params = useParams<{ id: string }>();
  const { id: treeId } = params;

  const { user, session, loading: authLoading } = useUser();
  const { profile } = useProfile();
  const addXp = useUserStore((s) => s.addXp);
  const storeSetLevel = useUserStore((s) => s.setLevel);
  const router = useRouter();

  const {
    activeTree, selectedNode,
    setActiveTree, setSelectedNode,
    updateNodeState, incrementCompleted, decrementCompleted,
  } = useTreeStore();

  const [loadingTree, setLoadingTree] = useState(true);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [user, authLoading, router]);

  // Fetch tree (profile comes from store via useProfile)
  useEffect(() => {
    if (!session?.access_token || !treeId) return;
    const token = session.access_token;

    api.getTree(treeId, token).then((treeResult) => {
      if (treeResult.data) {
        setActiveTree(treeResult.data);
      } else {
        setError(treeResult.error?.message ?? "Tree not found.");
      }
      setLoadingTree(false);
    });
  }, [session, treeId, setActiveTree]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const skillNode = activeTree?.nodes.find((n) => n.id === node.id) ?? null;
      setSelectedNode(skillNode);
    },
    [activeTree, setSelectedNode],
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, newState: SkillNode["state"]) => {
      const prevNode = activeTree?.nodes.find((n) => n.id === nodeId);
      const wasCompleted = prevNode?.state === "completed";

      updateNodeState(nodeId, newState);

      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, state: newState });
      }

      if (newState === "completed" && activeTree) {
        const node = activeTree.nodes.find((n) => n.id === nodeId);
        incrementCompleted(node?.xp_reward ?? 0);
      } else if (wasCompleted && newState !== "completed" && activeTree) {
        decrementCompleted(prevNode?.xp_reward ?? 0);
      }

      if (newState === "completed" && activeTree) {
        const updatedNodes = activeTree.nodes.map((n) =>
          n.id === nodeId ? { ...n, state: "completed" as const } : n
        );
        const completedIds = new Set(
          updatedNodes.filter((n) => n.state === "completed").map((n) => n.id)
        );
        for (const n of updatedNodes) {
          if (
            n.state === "locked" &&
            n.prerequisites.length > 0 &&
            n.prerequisites.every((p) => completedIds.has(p))
          ) {
            updateNodeState(n.id, "available");
          }
        }
      }
    },
    [updateNodeState, setSelectedNode, selectedNode, activeTree, incrementCompleted, decrementCompleted],
  );

  const handleXpEarned = useCallback((xp: number) => {
    addXp(xp);
  }, [addXp]);

  const handleLevelUp = useCallback((event: LevelUpEvent) => {
    setLevelUpEvent(event);
    storeSetLevel(event.newLevel, event.newTitle);
  }, [storeSetLevel]);

  if (authLoading || (!user && authLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-abyss)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const tree: TalentTree | null = activeTree;

  return (
    <div
      className="tree-view-shell flex flex-col"
      style={{ backgroundColor: "var(--bg-abyss)" }}
    >
      <Navbar />

      {/* Tree header — manuscript-style artifact block */}
      {tree && <TreeHeader tree={tree} />}

      {/* Profile stats row — level + streak (Nodes column omitted; TreeHeader owns that metric) */}
      {tree && profile && (
        <div
          className="stats-bar-mobile-wrap px-5 pb-3 shrink-0"
          style={{
            backgroundColor: "var(--bg-shadow)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <StatsBar
            totalXp={profile.total_xp}
            currentStreak={profile.current_streak}
            heroLevel={profile.hero_level}
            heroTitle={profile.hero_title}
            streakMultiplier={profile.streak_multiplier}
            lastActivityDate={profile.last_activity_date}
          />
        </div>
      )}

      {/* Canvas + detail panel */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {loadingTree ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ position: "relative" }}
          >
            {/* Skeleton tree nodes */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", opacity: 0.5 }}>
              <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
              <div style={{ display: "flex", gap: "3rem" }}>
                <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
              </div>
              <div style={{ display: "flex", gap: "2rem" }}>
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
              </div>
            </div>
          </div>
        ) : error ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "var(--text-muted)" }}
          >
            {error}
          </div>
        ) : tree ? (
          <>
            <ErrorBoundary>
              <TreeCanvas
                nodes={tree.nodes}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNode?.id}
              />
            </ErrorBoundary>

            {selectedNode && session?.access_token && (
              <NodeDetailPanel
                node={selectedNode}
                token={session.access_token}
                onNodeUpdate={handleNodeUpdate}
                onXpEarned={(xp) => handleXpEarned(xp)}
                onLevelUp={handleLevelUp}
                onClose={() => setSelectedNode(null)}
              />
            )}

            {levelUpEvent && (
              <LevelUpModal
                level={levelUpEvent.newLevel}
                title={levelUpEvent.newTitle}
                previousTitle={titleForLevel(levelUpEvent.previousLevel)}
                xpEarned={levelUpEvent.xpEarned}
                onClose={() => setLevelUpEvent(null)}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
