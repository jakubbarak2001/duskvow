"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { StatsBar } from "@/components/ui/StatsBar";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { UserProfile, TalentTree } from "@/types";

export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trees, setTrees] = useState<TalentTree[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    const token = session.access_token;
    Promise.all([api.getProfile(token), api.listTrees(token)]).then(
      ([profileRes, treesRes]) => {
        if (profileRes.data) setProfile(profileRes.data);
        if (treesRes.data) setTrees(treesRes.data);
        setDataLoading(false);
      },
    );
  }, [session]);

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

  const activeTree = trees.find((t) => t.status === "active") ?? null;

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
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

          <Link
            href="/tree/new"
            className="px-5 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent-ember)",
              color: "var(--text-primary)",
            }}
          >
            + New Vow
          </Link>
        </div>

        {/* Stats bar */}
        {profile && !dataLoading && (
          <div className="mb-8">
            <StatsBar
              totalXp={profile.total_xp}
              currentStreak={profile.current_streak}
              nodesCompleted={activeTree?.completed_nodes ?? 0}
              totalNodes={activeTree?.total_nodes ?? 0}
            />
          </div>
        )}

        {/* Tree list */}
        {dataLoading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading your vows…</p>
        ) : trees.length === 0 ? (
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
          <div className="grid gap-4">
            {trees.map((tree) => (
              <Link
                key={tree.id}
                href={`/tree/${tree.id}`}
                className="block p-5 rounded-lg transition-colors"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {tree.title}
                    </h3>
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
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        tree.status === "completed"
                          ? "rgba(255, 215, 0, 0.15)"
                          : "var(--bg-elevated)",
                      color:
                        tree.status === "completed"
                          ? "var(--accent-gold)"
                          : "var(--text-muted)",
                    }}
                  >
                    {tree.status}
                  </span>
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
                      backgroundColor: "var(--accent-gold)",
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
