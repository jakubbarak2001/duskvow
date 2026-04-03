"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { StatsBar } from "@/components/ui/StatsBar";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { UserProfile, TalentTree, GenerationStatus } from "@/types";

const PARTICLES = [
  { left: "8%",  delay: "0s",   dur: "9s",  anim: "wiz-float-a", size: 3 },
  { left: "22%", delay: "2.5s", dur: "11s", anim: "wiz-float-b", size: 2 },
  { left: "40%", delay: "5s",   dur: "8s",  anim: "wiz-float-c", size: 2 },
  { left: "60%", delay: "1s",   dur: "10s", anim: "wiz-float-a", size: 3 },
  { left: "78%", delay: "3.5s", dur: "12s", anim: "wiz-float-b", size: 2 },
  { left: "91%", delay: "7s",   dur: "9s",  anim: "wiz-float-c", size: 2 },
];

export default function VowChamberPage() {
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
  const atActiveCap = (genStatus?.active_trees ?? 0) >= (genStatus?.active_tree_cap ?? 5);
  const outOfGenerations = (genStatus?.generations_remaining ?? 1) === 0;
  const ctaDisabled = atActiveCap || outOfGenerations;

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Noise overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: 'url("/noise.png")',
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Radial background glow */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          background: "radial-gradient(ellipse at center, rgba(200,75,17,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Ember particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: p.left,
            bottom: "-5%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: "var(--accent-ember)",
            opacity: 0,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              {/* Back link */}
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  marginBottom: "0.75rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← Return to Hub
              </Link>

              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--text-primary)",
                  fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  lineHeight: 1.1,
                  marginBottom: "0.4rem",
                }}
              >
                The Vow Chamber
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                {user.email}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 mt-1">
              <Link
                href="/tree/new"
                className={ctaDisabled ? "" : "wiz-btn-primary"}
                style={
                  ctaDisabled
                    ? {
                        display: "inline-block",
                        padding: "0.75rem 2rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontFamily: "var(--font-heading)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                        opacity: 0.5,
                      }
                    : {}
                }
              >
                <span>+ New Vow</span>
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
            <div className="mb-10">
              <StatsBar
                totalXp={profile.total_xp}
                currentStreak={profile.current_streak}
              />
            </div>
          )}


          {dataLoading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading your vows…</p>
          ) : trees.length === 0 ? (
            /* Empty state — atmospheric */
            <div
              className="p-14 rounded-lg text-center relative overflow-hidden"
              style={{
                backgroundColor: "var(--bg-shadow)",
                border: "1px solid rgba(255,215,0,0.12)",
                boxShadow: "0 0 60px rgba(200,75,17,0.06), inset 0 0 40px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at center, rgba(200,75,17,0.08) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "1.2rem",
                  }}
                >
                  ◆  The Journey Awaits  ◆
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    color: "var(--text-primary)",
                    marginBottom: "0.8rem",
                  }}
                >
                  Welcome to Duskvow
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "2.5rem",
                    maxWidth: "420px",
                    margin: "0 auto 2.5rem",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  You have made no vows yet. Speak your ambition — and watch it take form.
                </p>
                <Link href="/tree/new" className="wiz-btn-primary">
                  <span>Make Your First Vow</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Active trees */}
              {activeTrees.length > 0 && (
                <section>
                  <SectionHeader label="Active Vows" />
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
                  <SectionHeader label="Finished Vows" />
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-4 mb-3">
        <div
          style={{
            height: "1px",
            flex: 1,
            background: "linear-gradient(90deg, transparent, rgba(138,115,64,0.35))",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          ◆  {label}  ◆
        </span>
        <div
          style={{
            height: "1px",
            flex: 1,
            background: "linear-gradient(90deg, rgba(138,115,64,0.35), transparent)",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TreeCard
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

  const accentColor = isFinished ? "var(--accent-gold)" : "var(--state-available)";

  return (
    <div
      className="dash-tree-card p-5 rounded-lg"
      style={{
        backgroundColor: isFinished ? "var(--bg-shadow)" : "var(--bg-surface)",
        border: `1px solid ${isFinished ? "rgba(255,215,0,0.15)" : "var(--border-default)"}`,
        borderLeft: `3px solid ${accentColor}`,
        opacity: isFinished ? 0.88 : 1,
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
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "0.03em",
              }}
            >
              {tree.title}
            </h3>
            <span
              className="ml-3 shrink-0 text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: isFinished
                  ? "rgba(255, 215, 0, 0.12)"
                  : "var(--bg-elevated)",
                color: isFinished ? "var(--accent-gold)" : "var(--text-muted)",
                fontFamily: "var(--font-heading)",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
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
        className="mt-4 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-highlight)" }}
      >
        <div
          className={isFinished ? "dash-progress-fill-complete" : "dash-progress-fill-active"}
          style={{
            height: "100%",
            borderRadius: "9999px",
            transition: "width 0.3s ease",
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
