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

export default function TreeViewPage() {
  const params = useParams<{ id: string }>();
  const { id: treeId } = params;

  const { user, session, loading: authLoading } = useUser();
  const router = useRouter();

  const { activeTree, selectedNode, setActiveTree, setSelectedNode, updateNodeState } =
    useTreeStore();

  const [loadingTree, setLoadingTree] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [user, authLoading, router]);

  // Fetch tree
  useEffect(() => {
    if (!session?.access_token || !treeId) return;

    api.getTree(treeId, session.access_token).then((res) => {
      if (res.data) {
        setActiveTree(res.data);
      } else {
        setError(res.error?.message ?? "Tree not found.");
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
      updateNodeState(nodeId, newState);
      // Update selected node panel to reflect the new state
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, state: newState });
      }
      // Re-fetch tree on completion to reveal newly unlocked nodes
      if (newState === "completed" && session?.access_token) {
        api.getTree(treeId, session.access_token).then((res) => {
          if (res.data) setActiveTree(res.data);
        });
      }
    },
    [updateNodeState, setSelectedNode, selectedNode, treeId, session, setActiveTree],
  );

  const handleXpEarned = useCallback((_xp: number, newTotal: number) => {
    setTotalXp(newTotal);
  }, []);

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
            onClick={() => router.push("/dashboard")}
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            ← Dashboard
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
            totalXp={totalXp || tree.earned_xp}
            currentStreak={0}
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
                onXpEarned={handleXpEarned}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
