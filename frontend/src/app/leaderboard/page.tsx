"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { LeaderboardEntry, LeaderboardRank } from "@/types";

type Metric = "total_xp" | "current_streak";
type Period = "weekly" | "all_time";

function leagueTier(rank: number): { name: string; color: string } {
  if (rank <= 3) return { name: "Mythic", color: "var(--rarity-mythic)" };
  if (rank <= 10) return { name: "Legendary", color: "var(--rarity-legendary)" };
  if (rank <= 25) return { name: "Epic", color: "var(--rarity-epic)" };
  if (rank <= 50) return { name: "Rare", color: "var(--rarity-rare)" };
  return { name: "Common", color: "var(--rarity-common)" };
}

function rankMedal(rank: number): string {
  if (rank === 1) return "\u{1F947}";
  if (rank === 2) return "\u{1F948}";
  if (rank === 3) return "\u{1F949}";
  return `#${rank}`;
}

function displayName(entry: LeaderboardEntry): string {
  return entry.hero_name || entry.display_name || "Unknown Hero";
}

function formatScore(score: number, metric: Metric): string {
  if (metric === "current_streak") return `${score}d`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}

/* ── Skeleton rows ── */
function LeaderboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: "56px",
            borderRadius: "8px",
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user, session, loading: authLoading } = useUser();
  const router = useRouter();

  const [metric, setMetric] = useState<Metric>("total_xp");
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardRank | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth");
  }, [user, authLoading, router]);

  // Fetch leaderboard whenever the session or active filters change.
  // The loading flag is flipped at the event source (tab handlers below) so
  // this effect has no synchronous setState in its body.
  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    let cancelled = false;
    Promise.all([
      api.getLeaderboard(token, metric, period),
      api.getMyRank(token, metric, period),
    ]).then(([boardRes, rankRes]) => {
      if (cancelled) return;
      if (boardRes.data) setEntries(boardRes.data);
      if (rankRes.data) setMyRank(rankRes.data);
      setLoadingData(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session, metric, period]);

  const handleMetricChange = (m: Metric) => {
    if (m === metric) return;
    setLoadingData(true);
    setMetric(m);
  };

  const handlePeriodChange = (p: Period) => {
    if (p === period) return;
    setLoadingData(true);
    setPeriod(p);
  };

  if (authLoading) {
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

  const metricLabel = metric === "total_xp" ? "XP Earned" : "Day Streak";
  const periodLabel = period === "weekly" ? "This Week" : "All Time";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-abyss)" }}
    >
      <Navbar />

      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              color: "var(--accent-gold)",
            }}
          >
            The Hall of Flames
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Where heroes are tempered by the walk.
          </p>
        </div>

        {/* Tab bar: Metric selector */}
        <div
          className="flex gap-1 p-1 rounded-lg mb-4"
          style={{ backgroundColor: "var(--bg-shadow)" }}
        >
          {(["total_xp", "current_streak"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => handleMetricChange(m)}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  metric === m ? "var(--bg-elevated)" : "transparent",
                color:
                  metric === m
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                border:
                  metric === m
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
              }}
            >
              {m === "total_xp" ? "XP Earned" : "Day Streak"}
            </button>
          ))}
        </div>

        {/* Period toggle */}
        <div
          className="flex gap-1 p-1 rounded-lg mb-6"
          style={{ backgroundColor: "var(--bg-shadow)" }}
        >
          {(["weekly", "all_time"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  period === p ? "var(--bg-elevated)" : "transparent",
                color:
                  period === p
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                border:
                  period === p
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
              }}
            >
              {p === "weekly" ? "This Week" : "All Time"}
            </button>
          ))}
        </div>

        {/* Your Rank card */}
        {myRank && !loadingData && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              backgroundColor: "var(--bg-shadow)",
              border: "1px solid var(--accent-ember)",
              boxShadow: "0 0 20px rgba(200, 75, 17, 0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "var(--bg-elevated)",
                    border: `1px solid ${leagueTier(myRank.rank).color}`,
                    fontFamily: "var(--font-heading), 'Cinzel', serif",
                    color: leagueTier(myRank.rank).color,
                    fontWeight: 700,
                    fontSize: myRank.rank <= 3 ? "1.4rem" : "0.9rem",
                  }}
                >
                  {rankMedal(myRank.rank)}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Your Rank
                  </p>
                  <p
                    className="font-bold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-heading), 'Cinzel', serif",
                    }}
                  >
                    {myRank.hero_name || "Unknown Hero"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {formatScore(myRank.score, metric)}
                </p>
                <p
                  className="text-xs"
                  style={{ color: leagueTier(myRank.rank).color }}
                >
                  {leagueTier(myRank.rank).name} League
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info label */}
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {metricLabel} — {periodLabel}
          </p>
          {myRank && !loadingData && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {myRank.total_participants} participant
              {myRank.total_participants !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Leaderboard list */}
        {loadingData ? (
          <LeaderboardSkeleton />
        ) : entries.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              backgroundColor: "var(--bg-shadow)",
              border: "1px solid var(--border-default)",
            }}
          >
            <p
              className="text-lg mb-2"
              style={{
                fontFamily: "var(--font-heading), 'Cinzel', serif",
                color: "var(--text-secondary)",
              }}
            >
              The flames await
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No heroes have entered the hall yet. Be the first.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--bg-shadow)",
              border: "1px solid var(--border-default)",
            }}
          >
            {entries.map((entry) => {
              const isMe = entry.id === user.id;
              const isTop3 = entry.rank <= 3;
              const tier = leagueTier(entry.rank);

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{
                    backgroundColor: isMe
                      ? "rgba(200, 75, 17, 0.08)"
                      : "transparent",
                    borderBottom: "1px solid var(--border-muted)",
                    borderLeft: isMe
                      ? "3px solid var(--accent-ember)"
                      : "3px solid transparent",
                  }}
                >
                  {/* Rank */}
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: isTop3 ? "8px" : "50%",
                      backgroundColor: isTop3
                        ? "var(--bg-elevated)"
                        : "transparent",
                      border: isTop3
                        ? `1px solid ${tier.color}`
                        : "none",
                      fontFamily: "var(--font-heading), 'Cinzel', serif",
                      color: isTop3
                        ? tier.color
                        : "var(--text-muted)",
                      fontWeight: 700,
                      fontSize: isTop3 ? "1.1rem" : "0.85rem",
                    }}
                  >
                    {rankMedal(entry.rank)}
                  </div>

                  {/* Hero info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      style={{
                        color: isMe
                          ? "var(--accent-gold)"
                          : "var(--text-primary)",
                      }}
                    >
                      {displayName(entry)}
                      {isMe && (
                        <span
                          className="ml-2 text-xs"
                          style={{ color: "var(--accent-ember)" }}
                        >
                          (you)
                        </span>
                      )}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Lv. {entry.hero_level} {entry.hero_title}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p
                      className="font-bold text-sm"
                      style={{
                        color: isTop3
                          ? tier.color
                          : "var(--text-primary)",
                        fontFamily: "var(--font-heading), 'Cinzel', serif",
                      }}
                    >
                      {formatScore(entry.score, metric)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: tier.color, opacity: 0.7 }}
                    >
                      {tier.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
