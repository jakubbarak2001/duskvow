"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { StatsBar } from "@/components/ui/StatsBar";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { UserProfile, TalentTree, GenerationStatus } from "@/types";

export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trees, setTrees] = useState<TalentTree[]>([]);
  const [genStatus, setGenStatus] = useState<GenerationStatus | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    const token = session.access_token;
    Promise.allSettled([
      api.getProfile(token),
      api.listTrees(token),
      api.getGenerationStatus(token),
    ]).then(([profileResult, treesResult, genResult]) => {
      if (profileResult.status === "fulfilled" && profileResult.value.data)
        setProfile(profileResult.value.data);
      if (treesResult.status === "fulfilled" && treesResult.value.data)
        setTrees(treesResult.value.data);
      if (genResult.status === "fulfilled" && genResult.value.data)
        setGenStatus(genResult.value.data);
      setDataLoading(false);
    });
  }, [session]);

  const handleDeleteConfirm = async (treeId: string) => {
    if (!session?.access_token) return;
    setDeleting(true);
    const res = await api.deleteTree(treeId, session.access_token);
    setDeleting(false);
    if (!res.error) {
      setTrees((prev) => prev.filter((t) => t.id !== treeId));
      setConfirmDeleteId(null);
      // Update active count in genStatus
      setGenStatus((prev) => {
        if (!prev) return prev;
        const deleted = trees.find((t) => t.id === treeId);
        const wasActive = deleted?.status === "active";
        return wasActive
          ? { ...prev, active_trees: Math.max(0, prev.active_trees - 1) }
          : prev;
      });
    }
  };

  if (loading || (!user && loading)) {
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

  const activeTrees = trees.filter((t) => t.status === "active");
  const finishedTrees = trees.filter((t) => t.status === "completed");
  const primaryActiveTree = activeTrees[0] ?? null;
  const atActiveCap = (genStatus?.active_trees ?? 0) >= (genStatus?.active_tree_cap ?? 5);
  const outOfGenerations = (genStatus?.generations_remaining ?? 1) === 0;

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-4xl font-bold mb-1"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--accent-gold)",
              }}
            >
              Your Vow Board
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              href="/tree/new"
              className="px-5 py-2 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  atActiveCap || outOfGenerations
                    ? "var(--bg-elevated)"
                    : "var(--accent-ember)",
                color:
                  atActiveCap || outOfGenerations
                    ? "var(--text-muted)"
                    : "var(--text-primary)",
                pointerEvents: atActiveCap || outOfGenerations ? "none" : "auto",
                opacity: atActiveCap || outOfGenerations ? 0.6 : 1,
              }}
            >
              + New Vow
            </Link>
            {genStatus && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span
                  style={{
                    color:
                      genStatus.generations_remaining === 0
                        ? "var(--accent-blood)"
                        : genStatus.generations_remaining === 1
                          ? "var(--accent-ember)"
                          : "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {genStatus.generations_remaining}
                </span>{" "}
                of {genStatus.generations_limit} generations remaining today
                {" · "}
                <span
                  style={{
                    color:
                      genStatus.active_trees >= genStatus.active_tree_cap
                        ? "var(--accent-blood)"
                        : "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {genStatus.active_trees}
                </span>
                /{genStatus.active_tree_cap} active trees
              </p>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {profile && !dataLoading && (
          <div className="mb-8">
            <StatsBar
              totalXp={profile.total_xp}
              currentStreak={profile.current_streak}
              nodesCompleted={primaryActiveTree?.completed_nodes ?? 0}
              totalNodes={primaryActiveTree?.total_nodes ?? 0}
            />
          </div>
        )}

        {dataLoading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading your vows…</p>
        ) : trees.length === 0 ? (
          /* Empty state */
          <div
            className="p-12 rounded-lg text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-3"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--text-primary)",
              }}
            >
              Welcome to Duskvow
            </h2>
            <p className="mb-6" style={{ color: "var(--text-muted)" }}>
              You have no active vows. Make your first vow to begin your journey.
            </p>
            <Link
              href="/tree/new"
              className="px-6 py-3 rounded font-medium"
              style={{
                backgroundColor: "var(--accent-ember)",
                color: "var(--text-primary)",
              }}
            >
              Make Your First Vow
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active trees */}
            {activeTrees.length > 0 && (
              <section>
                <h2
                  className="text-sm font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Active Vows
                </h2>
                <div className="grid gap-4">
                  {activeTrees.map((tree) => (
                    <TreeCard
                      key={tree.id}
                      tree={tree}
                      confirmDeleteId={confirmDeleteId}
                      deleting={deleting}
                      onDeleteRequest={(id) => setConfirmDeleteId(id)}
                      onDeleteCancel={() => setConfirmDeleteId(null)}
                      onDeleteConfirm={handleDeleteConfirm}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Finished trees */}
            {finishedTrees.length > 0 && (
              <section>
                <h2
                  className="text-sm font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Finished Vows
                </h2>
                <div className="grid gap-4">
                  {finishedTrees.map((tree) => (
                    <TreeCard
                      key={tree.id}
                      tree={tree}
                      confirmDeleteId={confirmDeleteId}
                      deleting={deleting}
                      onDeleteRequest={(id) => setConfirmDeleteId(id)}
                      onDeleteCancel={() => setConfirmDeleteId(null)}
                      onDeleteConfirm={handleDeleteConfirm}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TreeCard — extracted to keep the page component readable
// ---------------------------------------------------------------------------

interface TreeCardProps {
  tree: TalentTree;
  confirmDeleteId: string | null;
  deleting: boolean;
  onDeleteRequest: (id: string) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: (id: string) => void;
}

function TreeCard({
  tree,
  confirmDeleteId,
  deleting,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: TreeCardProps) {
  const isFinished = tree.status === "completed";
  const isConfirming = confirmDeleteId === tree.id;

  return (
    <div
      className="p-5 rounded-lg"
      style={{
        backgroundColor: isFinished ? "var(--bg-shadow)" : "var(--bg-surface)",
        border: isFinished
          ? "1px solid rgba(255, 215, 0, 0.2)"
          : "1px solid var(--border-default)",
        opacity: isFinished ? 0.85 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Clickable tree info */}
        <Link
          href={`/tree/${tree.id}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-start justify-between mb-1">
            <h3
              className="text-lg font-semibold"
              style={{
                fontFamily: "var(--font-heading)",
                color: isFinished ? "var(--accent-gold)" : "var(--text-primary)",
              }}
            >
              {tree.title}
            </h3>
            <span
              className="ml-3 shrink-0 text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: isFinished
                  ? "rgba(255, 215, 0, 0.15)"
                  : "var(--bg-elevated)",
                color: isFinished ? "var(--accent-gold)" : "var(--text-muted)",
              }}
            >
              {isFinished ? "Finished" : "Active"}
            </span>
          </div>
          {tree.description && (
            <p
              className="text-sm mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {tree.description}
            </p>
          )}
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {tree.completed_nodes}/{tree.total_nodes} nodes ·{" "}
            {tree.earned_xp}/{tree.total_xp} XP
          </p>
        </Link>

        {/* Delete controls */}
        <div className="shrink-0 flex items-center gap-2">
          {isConfirming ? (
            <>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Are you sure?
              </span>
              <button
                onClick={() => onDeleteConfirm(tree.id)}
                disabled={deleting}
                className="text-xs px-3 py-1 rounded transition-opacity"
                style={{
                  backgroundColor: "rgba(139, 0, 0, 0.4)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--accent-blood)",
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={onDeleteCancel}
                disabled={deleting}
                className="text-xs px-3 py-1 rounded"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => onDeleteRequest(tree.id)}
              className="text-xs px-3 py-1 rounded"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }}
              title="Delete this tree"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="mt-3 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-highlight)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width:
              tree.total_nodes > 0
                ? `${(tree.completed_nodes / tree.total_nodes) * 100}%`
                : "0%",
            backgroundColor: isFinished ? "var(--accent-gold)" : "var(--state-available)",
          }}
        />
      </div>
    </div>
  );
}
