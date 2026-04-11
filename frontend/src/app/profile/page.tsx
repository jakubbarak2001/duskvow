"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { useAchievementToast } from "@/components/ui/AchievementProvider";
import type {
  UserProfile,
  Achievement,
  InventoryItem,
  LevelUnlock,
  ProfileStats,
} from "@/types";

const ICON_MAP: Record<string, string> = {
  scroll: "◆",
  shield: "⛊",
  sword: "⚔",
  flame: "✦",
  road: "═",
  chest: "⬡",
  abyss: "◈",
  mountain: "▲",
  crown: "♔",
  star: "✦",
};

const RARITY_COLORS: Record<string, string> = {
  scroll_of_clarity: "var(--rarity-uncommon)",
  ember_shard: "var(--rarity-rare)",
  shadowsteel_fragment: "var(--rarity-epic)",
  heros_ration: "var(--rarity-common)",
  rune_of_focus: "var(--rarity-legendary)",
  ashen_token: "var(--rarity-uncommon)",
};

function xpForLevel(level: number): number {
  return level * level * 25;
}

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

function nextTitleInfo(level: number): { title: string; atLevel: number } | null {
  const thresholds = [
    { level: 5, title: "Oath-Bound" },
    { level: 10, title: "Ironsworn" },
    { level: 15, title: "Flamewarden" },
    { level: 20, title: "Duskwalker" },
    { level: 30, title: "Shadowforged" },
    { level: 40, title: "Mythbreaker" },
    { level: 50, title: "Vow Eternal" },
  ];
  for (const t of thresholds) {
    if (t.level > level) return { title: t.title, atLevel: t.level };
  }
  return null;
}

export default function ProfilePage() {
  const { user, session, loading } = useUser();
  const router = useRouter();
  const { showAchievements: _showAchievements } = useAchievementToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [unlocks, setUnlocks] = useState<LevelUnlock[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [usingItem, setUsingItem] = useState<string | null>(null);

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
      api.getAchievements(token),
      api.getInventory(token, false),
      api.getLevelUnlocks(token),
      api.getProfileStats(token),
    ]).then(([profileRes, achievementsRes, inventoryRes, unlocksRes, statsRes]) => {
      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        setProfile(profileRes.value.data);
      }
      if (achievementsRes.status === "fulfilled" && achievementsRes.value.data) {
        setAchievements(achievementsRes.value.data);
      }
      if (inventoryRes.status === "fulfilled" && inventoryRes.value.data) {
        setInventory(inventoryRes.value.data);
      }
      if (unlocksRes.status === "fulfilled" && unlocksRes.value.data) {
        setUnlocks(unlocksRes.value.data);
      }
      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
      setDataLoading(false);
    });
  }, [session]);

  const handleUseItem = async (itemId: string) => {
    if (!session?.access_token || usingItem) return;
    setUsingItem(itemId);
    const res = await api.useItem(itemId, session.access_token);
    setUsingItem(null);
    if (!res.error) {
      setInventory((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  if (loading || dataLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-abyss)",
        }}
      >
        <div
          className="dungeon-pulse"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.55rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Loading profile
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const currentLevelXp = xpForLevel(profile.hero_level);
  const nextLevelXp = xpForLevel(profile.hero_level + 1);
  const xpProgress = profile.total_xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPercent = xpNeeded > 0 ? Math.min(100, (xpProgress / xpNeeded) * 100) : 100;

  const earnedCount = achievements.filter((a) => a.unlocked).length;
  const nextTitle = nextTitleInfo(profile.hero_level);

  const streakPct = profile.streak_multiplier > 1.0
    ? Math.round((profile.streak_multiplier - 1.0) * 100)
    : 0;

  // Separate level-gated unlocks from streak bonuses
  const levelUnlocks = unlocks.filter((u) => !u.feature.startsWith("streak_"));

  return (
    <div
      style={{
        backgroundColor: "var(--bg-abyss)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
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

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(224,216,200,0.07)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          ← Return to Hub
        </Link>
      </header>

      {/* Main content */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "700px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        {/* ── Hero Identity ── */}
        <section style={{ textAlign: "center" }}>
          {/* Level badge */}
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "3.5rem",
              fontWeight: 700,
              color: "var(--accent-gold)",
              textShadow: "0 0 40px rgba(255,215,0,0.4)",
              lineHeight: 1,
            }}
          >
            {profile.hero_level}
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            Level
          </div>

          {/* Hero name & title */}
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "0.1em",
              }}
            >
              {profile.hero_name ?? "Unnamed Hero"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--accent-gold)",
                marginTop: "0.2rem",
              }}
            >
              {profile.hero_title}
            </div>
          </div>

          {/* XP Progress bar */}
          <div style={{ marginTop: "1.25rem", maxWidth: "400px", margin: "1.25rem auto 0" }}>
            <div
              style={{
                height: "6px",
                backgroundColor: "rgba(224,216,200,0.08)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${xpPercent}%`,
                  background: "linear-gradient(90deg, var(--accent-gold), rgba(255,215,0,0.6))",
                  borderRadius: "3px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.35rem",
                fontFamily: "var(--font-heading)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
              }}
            >
              <span>{profile.total_xp.toLocaleString()} XP</span>
              <span>{nextLevelXp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Next title */}
          {nextTitle && (
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                marginTop: "0.5rem",
              }}
            >
              Next title: <span style={{ color: "var(--text-secondary)" }}>{nextTitle.title}</span> at Lv.{nextTitle.atLevel}
            </div>
          )}

          {/* Streak */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--accent-ember)",
                  textShadow: "0 0 12px rgba(200,75,17,0.5)",
                }}
              >
                {profile.current_streak}
              </span>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Current Streak
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {profile.longest_streak}
              </span>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Longest Streak
              </div>
            </div>
            {streakPct > 0 && (
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--accent-gold)",
                    textShadow: "0 0 12px rgba(255,215,0,0.3)",
                  }}
                >
                  +{streakPct}%
                </span>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  XP Bonus
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Gold divider */}
        <div
          style={{
            width: "120px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.25), transparent)",
            margin: "0 auto",
          }}
        />

        {/* ── Stats Grid ── */}
        {stats && (
          <section>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.6rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              ◆&nbsp;&nbsp;Hero Stats&nbsp;&nbsp;◆
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {[
                { label: "Total XP", value: profile.total_xp.toLocaleString() },
                { label: "Trees Completed", value: stats.trees_completed },
                { label: "Trees Active", value: stats.trees_active },
                { label: "Nodes Completed", value: stats.nodes_completed },
                { label: "Dungeons Completed", value: stats.dungeons_completed },
                { label: "Dungeon Time", value: `${Math.floor(stats.total_dungeon_minutes / 60)}h ${stats.total_dungeon_minutes % 60}m` },
                { label: "Quests Completed", value: stats.quests_completed },
                { label: "Items Collected", value: stats.total_loot_collected },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(224,216,200,0.03)",
                    border: "1px solid rgba(224,216,200,0.06)",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.5rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Achievements ── */}
        <section>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            ◆&nbsp;&nbsp;Achievements ({earnedCount} of {achievements.length})&nbsp;&nbsp;◆
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {achievements.map((a) => (
              <div
                key={a.key}
                title={a.unlocked ? `${a.name}\n${a.description}` : "???"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.75rem 0.5rem",
                  backgroundColor: a.unlocked ? "rgba(255,215,0,0.04)" : "rgba(224,216,200,0.02)",
                  border: `1px solid ${a.unlocked ? "rgba(255,215,0,0.2)" : "rgba(224,216,200,0.05)"}`,
                  borderRadius: "4px",
                  opacity: a.unlocked ? 1 : 0.3,
                  cursor: a.unlocked ? "default" : "not-allowed",
                  transition: "opacity 0.2s",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: `2px solid ${a.unlocked ? "var(--accent-gold)" : "rgba(224,216,200,0.15)"}`,
                    backgroundColor: a.unlocked ? "rgba(255,215,0,0.08)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    color: a.unlocked ? "var(--accent-gold)" : "var(--text-muted)",
                  }}
                >
                  {a.unlocked ? (ICON_MAP[a.icon] ?? "◆") : "?"}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.05em",
                    color: a.unlocked ? "var(--text-primary)" : "var(--text-muted)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {a.unlocked ? a.name : "???"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Inventory ── */}
        <section>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            ◆&nbsp;&nbsp;Inventory ({inventory.length})&nbsp;&nbsp;◆
          </div>
          {inventory.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-heading)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                padding: "2rem 0",
              }}
            >
              Your pack is empty. Delve deeper.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {inventory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(224,216,200,0.03)",
                    border: `1px solid ${RARITY_COLORS[item.item_type] ?? "rgba(224,216,200,0.06)"}33`,
                    borderRadius: "4px",
                  }}
                >
                  {/* Rarity dot */}
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: RARITY_COLORS[item.item_type] ?? "var(--rarity-common)",
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${RARITY_COLORS[item.item_type] ?? "var(--rarity-common)"}`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.item_name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.effect}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseItem(item.id)}
                    disabled={usingItem === item.id}
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "2px",
                      border: "1px solid rgba(255,215,0,0.3)",
                      backgroundColor: "transparent",
                      color: "var(--accent-gold)",
                      cursor: usingItem === item.id ? "not-allowed" : "pointer",
                      opacity: usingItem === item.id ? 0.5 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    {usingItem === item.id ? "..." : "Use"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Path of Ascension (Level Unlocks) ── */}
        <section>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: "1rem",
            }}
          >
            ◆&nbsp;&nbsp;Path of Ascension&nbsp;&nbsp;◆
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {levelUnlocks.map((u) => (
              <div
                key={u.feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  opacity: u.unlocked ? 1 : 0.45,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.7rem",
                    color: u.unlocked ? "var(--accent-gold)" : "var(--text-muted)",
                    width: "20px",
                    textAlign: "center",
                  }}
                >
                  {u.unlocked ? "✓" : "⬡"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.05em",
                    color: "var(--text-muted)",
                    width: "40px",
                    flexShrink: 0,
                  }}
                >
                  Lv.{u.required_level}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: u.unlocked ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {u.description}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
