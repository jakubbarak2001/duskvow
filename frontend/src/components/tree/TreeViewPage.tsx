"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Node } from "@xyflow/react";
import { useUser } from "@/hooks/useUser";
import { useTreeStore } from "@/stores/treeStore";
import { Navbar } from "@/components/layout/Navbar";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { NodeDetailPanel } from "@/components/tree/NodeDetailPanel";
import { StatsBar } from "@/components/ui/StatsBar";
import { api } from "@/lib/api";
import type { SkillNode, TalentTree } from "@/types";

export function TreeViewPage() {
  const params = useParams<{ id: string }>();
  const { id: treeId } = params;

  const { user, session, loading: authLoading } = useUser();
  const router = useRouter();

  const {
    activeTree, selectedNode,
    setActiveTree, setSelectedNode,
    updateNodeState, incrementCompleted, decrementCompleted,
  } = useTreeStore();

  const [loadingTree, setLoadingTree] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [user, authLoading, router]);

  // Fetch tree + profile (for streak)
  useEffect(() => {
    if (!session?.access_token || !treeId) return;
    const token = session.access_token;

    Promise.allSettled([
      api.getTree(treeId, token),
      api.getProfile(token),
    ]).then(([treeResult, profileResult]) => {
      if (treeResult.status === "fulfilled" && treeResult.value.data) {
        setActiveTree(treeResult.value.data);
      } else {
        setError(
          treeResult.status === "fulfilled"
            ? (treeResult.value.error?.message ?? "Tree not found.")
            : "Failed to load tree.",
        );
      }
      if (profileResult.status === "fulfilled" && profileResult.value.data) {
        setCurrentStreak(profileResult.value.data.current_streak);
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
      className="flex flex-col"
      style={{ backgroundColor: "var(--bg-abyss)", height: "100vh" }}
    >
      <Navbar />

      {/* Tree header bar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{
          backgroundColor: "var(--bg-shadow)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/vows")}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            ← Vow Chamber
          </button>
          {tree && (
            <h1
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--accent-gold)",
              }}
            >
              {tree.title}
            </h1>
          )}
        </div>

        {tree && (
          <StatsBar
            totalXp={tree.earned_xp}
            currentStreak={currentStreak}
            nodesCompleted={tree.completed_nodes}
            totalNodes={tree.total_nodes}
          />
        )}
      </div>

      {/* Canvas + detail panel */}
      <div className="flex-1 relative overflow-hidden">
        {loadingTree ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "var(--text-muted)" }}
          >
            Summoning your talent tree…
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
            <TreeCanvas
              nodes={tree.nodes}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id}
            />

            {selectedNode && session?.access_token && (
              <NodeDetailPanel
                node={selectedNode}
                token={session.access_token}
                onNodeUpdate={handleNodeUpdate}
                onXpEarned={() => {}}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
