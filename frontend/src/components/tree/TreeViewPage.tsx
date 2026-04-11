"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Node } from "@xyflow/react";
import { useUser } from "@/hooks/useUser";
import { useTreeStore } from "@/stores/treeStore";
import { Navbar } from "@/components/layout/Navbar";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { NodeDetailPanel } from "@/components/tree/NodeDetailPanel";
import { QuestLogPanel } from "@/components/tree/QuestLogPanel";
import { StatsBar } from "@/components/ui/StatsBar";
import { api } from "@/lib/api";
import type { LevelUpEvent } from "@/components/tree/NodeDetailPanel";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { useAchievementToast } from "@/components/ui/AchievementProvider";
import type { SkillNode, TalentTree, DailyQuest } from "@/types";

function titleForLevel(level: number): string {
  if (level >= 50) return "Vow Eternal";
  if (level >= 40) return "Mythbreaker";
  if (level >= 30) return "Shadowforged";
  if (level >= 20) return "Duskwalker";
  if (level >= 15) return "Flamewarden";
  if (level >= 10) return "Ironsworn";
  if (level >= 5) return "Oath-Bound";
  return "Wanderer";
}

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

  const { showAchievements, showStreakMilestone } = useAchievementToast();

  const [loadingTree, setLoadingTree] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [heroLevel, setHeroLevel] = useState(1);
  const [heroTitle, setHeroTitle] = useState("Wanderer");
  const [profileTotalXp, setProfileTotalXp] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const [treeQuests, setTreeQuests] = useState<DailyQuest[]>([]);
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
      api.getTodayQuests(token),
    ]).then(([treeResult, profileResult, questsResult]) => {
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
        setHeroLevel(profileResult.value.data.hero_level);
        setHeroTitle(profileResult.value.data.hero_title);
        setProfileTotalXp(profileResult.value.data.total_xp);
        setStreakMultiplier(profileResult.value.data.streak_multiplier);
      }
      if (questsResult.status === "fulfilled" && questsResult.value.data) {
        // Only keep quests for this specific tree
        setTreeQuests(questsResult.value.data.filter((q) => q.tree_id === treeId));
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
    setProfileTotalXp((prev) => prev + xp);
  }, []);

  const handleLevelUp = useCallback((event: LevelUpEvent) => {
    setLevelUpEvent(event);
    setHeroLevel(event.newLevel);
    setHeroTitle(event.newTitle);
  }, []);

  const handleQuestToggle = useCallback(
    async (quest: DailyQuest) => {
      if (!session?.access_token) return;
      const token = session.access_token;

      // Optimistic update
      setTreeQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, completed_today: !q.completed_today } : q,
        ),
      );

      if (!quest.completed_today) {
        const res = await api.completeQuest(quest.id, token);
        if (res.error) {
          setTreeQuests((prev) =>
            prev.map((q) =>
              q.id === quest.id ? { ...q, completed_today: false } : q,
            ),
          );
        } else if (res.data) {
          setProfileTotalXp(res.data.total_xp);
          if (res.data.leveled_up) {
            setLevelUpEvent({
              newLevel: res.data.new_level,
              previousLevel: res.data.previous_level,
              newTitle: res.data.new_title,
              xpEarned: res.data.xp_earned,
            });
            setHeroLevel(res.data.new_level);
            setHeroTitle(res.data.new_title);
          }
          if (res.data.new_achievements?.length) {
            showAchievements(res.data.new_achievements);
          }
          if (res.data.streak_milestone) {
            showStreakMilestone(res.data.streak_milestone);
          }
        }
      } else {
        const res = await api.uncompleteQuest(quest.id, token);
        if (res.error) {
          setTreeQuests((prev) =>
            prev.map((q) =>
              q.id === quest.id ? { ...q, completed_today: true } : q,
            ),
          );
        }
      }
    },
    [session],
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
            totalXp={profileTotalXp}
            currentStreak={currentStreak}
            heroLevel={heroLevel}
            heroTitle={heroTitle}
            nodesCompleted={tree.completed_nodes}
            totalNodes={tree.total_nodes}
            streakMultiplier={streakMultiplier}
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

            {treeQuests.length > 0 && (
              <QuestLogPanel
                quests={treeQuests}
                onToggle={handleQuestToggle}
              />
            )}

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
