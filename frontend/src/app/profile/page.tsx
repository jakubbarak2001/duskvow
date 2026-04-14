"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { api } from "@/lib/api";
import { xpForLevel, nextTitleInfo } from "@/lib/levels";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  Achievement,
  InventoryItem,
  LevelUnlock,
  ProfileStats,
} from "@/types";

const ICON_MAP: Record<string, string> = {
  scroll: "◆", shield: "⛊", sword: "⚔", flame: "✦", road: "═",
  chest: "⬡", abyss: "◈", mountain: "▲", crown: "♔", star: "✦",
};

const RARITY_COLORS: Record<string, string> = {
  scroll_of_clarity: "var(--rarity-uncommon)",
  ember_shard: "var(--rarity-rare)",
  shadowsteel_fragment: "var(--rarity-epic)",
  heros_ration: "var(--rarity-common)",
  rune_of_focus: "var(--rarity-legendary)",
  ashen_token: "var(--rarity-uncommon)",
};

const CATEGORY_LABELS: Record<string, string> = {
  tree: "Vow Mastery",
  dungeon: "Dungeon Trials",
  quest: "Quest Pursuits",
  meta: "Legendary Feats",
};

const STAT_ACCENTS: Record<string, string> = {
  "Total XP": "var(--accent-gold)",
  "Trees Completed": "var(--accent-gold)",
  "Trees Active": "var(--accent-gold)",
  "Nodes Completed": "var(--accent-gold)",
  "Dungeons Completed": "var(--accent-ember)",
  "Dungeon Time": "var(--accent-ember)",
  "Quests Completed": "var(--state-available)",
  "Items Collected": "var(--rarity-rare)",
};

export default function ProfilePage() {
  const { user, session, loading } = useUser();
  const { profile } = useProfile();
  const router = useRouter();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [unlocks, setUnlocks] = useState<LevelUnlock[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [usingItem, setUsingItem] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    Promise.allSettled([
      api.getAchievements(token),
      api.getInventory(token, false),
      api.getLevelUnlocks(token),
      api.getProfileStats(token),
    ]).then(([achievementsRes, inventoryRes, unlocksRes, statsRes]) => {
      if (achievementsRes.status === "fulfilled" && achievementsRes.value.data)
        setAchievements(achievementsRes.value.data);
      if (inventoryRes.status === "fulfilled" && inventoryRes.value.data)
        setInventory(inventoryRes.value.data);
      if (unlocksRes.status === "fulfilled" && unlocksRes.value.data)
        setUnlocks(unlocksRes.value.data);
      if (statsRes.status === "fulfilled" && statsRes.value.data)
        setStats(statsRes.value.data);
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

  if (loading) return null;
  if (!user) return null;

  const currentLevelXp = profile ? xpForLevel(profile.hero_level) : 0;
  const nextLevelXp = profile ? xpForLevel(profile.hero_level + 1) : 100;
  const xpProgress = profile ? profile.total_xp - currentLevelXp : 0;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPercent = xpNeeded > 0 ? Math.min(100, (xpProgress / xpNeeded) * 100) : 100;
  const earnedCount = achievements.filter((a) => a.unlocked).length;
  const nextTitle = profile ? nextTitleInfo(profile.hero_level) : null;
  const streakPct = profile && profile.streak_multiplier > 1.0 ? Math.round((profile.streak_multiplier - 1.0) * 100) : 0;
  const levelUnlocks = unlocks.filter((u) => !u.feature.startsWith("streak_"));

  // Group achievements by category
  const achievementsByCategory = achievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    const cat = a.category ?? "meta";
    (acc[cat] ??= []).push(a);
    return acc;
  }, {});

  const statRows = stats && profile ? [
    { label: "Total XP", value: profile.total_xp.toLocaleString() },
    { label: "Trees Completed", value: stats.trees_completed },
    { label: "Trees Active", value: stats.trees_active },
    { label: "Nodes Completed", value: stats.nodes_completed },
    { label: "Dungeons Completed", value: stats.dungeons_completed },
    { label: "Dungeon Time", value: `${Math.floor(stats.total_dungeon_minutes / 60)}h ${stats.total_dungeon_minutes % 60}m` },
    { label: "Quests Completed", value: stats.quests_completed },
    { label: "Items Collected", value: stats.total_loot_collected },
  ] : [];

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh", position: "relative" }}>
      {/* Noise overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: 'url("/noise.png")', backgroundRepeat: "repeat", backgroundSize: "200px 200px", opacity: 0.04, pointerEvents: "none", zIndex: 0 }} />

      {/* Ambient glow behind hero sigil */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse at center, rgba(255,215,0,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", borderBottom: "1px solid rgba(224,216,200,0.07)" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-heading)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}>
          ← Return to Hub
        </Link>
      </header>

      {/* Main content */}
      <main style={{ position: "relative", zIndex: 2, maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* ═══════════ HERO SIGIL ═══════════ */}
        {profile ? (
        <section style={{ textAlign: "center" }}>
          {/* Hexagonal level sigil with XP ring */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              {/* Background track */}
              <circle cx="65" cy="65" r="60" fill="none" stroke="rgba(224,216,200,0.1)" strokeWidth="2.5" />
              {/* XP progress arc */}
              <circle
                cx="65" cy="65" r="60"
                fill="none"
                stroke="var(--accent-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${(xpPercent / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                transform="rotate(-90 65 65)"
                style={{ filter: "drop-shadow(0 0 6px rgba(255,215,0,0.4))", transition: "stroke-dasharray 0.6s ease" }}
              />
              {/* Level number */}
              <text
                x="65" y="65"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "var(--font-heading), 'Cinzel', serif",
                  fontSize: "2.8rem",
                  fontWeight: 700,
                  fill: "var(--accent-gold)",
                }}
              >
                {profile.hero_level}
              </text>
            </svg>
          </div>

          {/* Hero name & title */}
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.1em" }}>
            {profile.hero_name ?? "Unnamed Hero"}
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent-gold)", marginTop: "0.2rem" }}>
            {profile.hero_title}
          </div>

          {/* XP bar with overlaid numbers */}
          <div style={{ maxWidth: "420px", margin: "1.5rem auto 0", position: "relative" }}>
            <div style={{ height: "8px", backgroundColor: "rgba(224,216,200,0.08)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpPercent}%`, background: "linear-gradient(90deg, var(--accent-gold), rgba(255,215,0,0.6))", borderRadius: "4px", transition: "width 0.5s ease", boxShadow: "0 0 12px rgba(255,215,0,0.3)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontFamily: "var(--font-heading)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-gold)" }}>{profile.total_xp.toLocaleString()} XP</span>
              <span>{nextLevelXp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Next title hint */}
          {nextTitle && (
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Next title: <span style={{ color: "var(--text-secondary)" }}>{nextTitle.title}</span> at Lv.{nextTitle.atLevel}
            </div>
          )}

          {/* Streak runes */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
            <StreakRune label="Current Streak" value={profile.current_streak} color="var(--accent-ember)" />
            <StreakRune label="Longest Streak" value={profile.longest_streak} color="var(--text-secondary)" />
            {streakPct > 0 && <StreakRune label="XP Bonus" value={`+${streakPct}%`} color="var(--accent-gold)" />}
          </div>
        </section>
        ) : (
        <section style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Skeleton width="130px" height="130px" borderRadius="50%" />
          <Skeleton width="8rem" height="1rem" />
          <Skeleton width="5rem" height="0.7rem" />
          <Skeleton width="min(400px, 90%)" height="8px" borderRadius="4px" />
        </section>
        )}

        {/* Ornamental divider */}
        <Divider />

        {/* ═══════════ STATS — Dark Souls attribute style ═══════════ */}
        {statRows.length > 0 ? (
          <section>
            <SectionTitle>Hero Stats</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {statRows.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.6rem 0.75rem",
                    borderLeft: `3px solid ${STAT_ACCENTS[stat.label] ?? "var(--text-muted)"}`,
                    backgroundColor: i % 2 === 0 ? "rgba(224,216,200,0.02)" : "transparent",
                    animation: `fadeIn 0.4s ease ${i * 0.06}s both`,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    {stat.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <SectionTitle>Hero Stats</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "2.5rem", borderRadius: "0" }} />
              ))}
            </div>
          </section>
        )}

        {/* Ornamental divider */}
        <Divider />

        {/* ═══════════ ACHIEVEMENTS — grouped by category ═══════════ */}
        <section>
          <SectionTitle>Achievements ({earnedCount} of {achievements.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {Object.entries(achievementsByCategory).map(([cat, achs]) => (
              <div key={cat}>
                {/* Category header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, rgba(224,216,200,0.1))" }} />
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                  <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(224,216,200,0.1), transparent)" }} />
                </div>
                {/* Achievement grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.6rem" }}>
                  {achs.map((a) => (
                    <div
                      key={a.key}
                      title={a.unlocked ? `${a.name}\n${a.description}` : "???"}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
                        padding: "0.75rem 0.5rem",
                        backgroundColor: a.unlocked ? "rgba(255,215,0,0.04)" : "rgba(224,216,200,0.03)",
                        border: `1px solid ${a.unlocked ? "rgba(255,215,0,0.2)" : "rgba(224,216,200,0.1)"}`,
                        borderRadius: "4px",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        border: `2px solid ${a.unlocked ? "var(--accent-gold)" : "rgba(224,216,200,0.2)"}`,
                        backgroundColor: a.unlocked ? "rgba(255,215,0,0.08)" : "rgba(224,216,200,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", color: a.unlocked ? "var(--accent-gold)" : "var(--text-muted)",
                        boxShadow: a.unlocked ? "0 0 12px rgba(255,215,0,0.15)" : "none",
                      }}>
                        {a.unlocked ? (ICON_MAP[a.icon] ?? "◆") : "?"}
                      </div>
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.55rem", letterSpacing: "0.05em", color: a.unlocked ? "var(--text-primary)" : "var(--text-secondary)", textAlign: "center", lineHeight: 1.2 }}>
                        {a.unlocked ? a.name : "???"}
                      </span>
                      {a.unlocked && a.description && (
                        <span style={{ fontSize: "0.5rem", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>
                          {a.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ornamental divider */}
        <Divider />

        {/* ═══════════ INVENTORY — grid cards with rarity ═══════════ */}
        <section>
          <SectionTitle>Inventory ({inventory.length})</SectionTitle>
          {inventory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                Your pack is empty. Delve deeper.
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {inventory.map((item) => {
                const rColor = RARITY_COLORS[item.item_type] ?? "var(--rarity-common)";
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(224,216,200,0.025)",
                      borderTop: `3px solid ${rColor}`,
                      border: `1px solid rgba(224,216,200,0.06)`,
                      borderTopWidth: "3px",
                      borderTopColor: rColor,
                      borderRadius: "4px",
                      display: "flex", flexDirection: "column", gap: "0.4rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: rColor, boxShadow: `0 0 6px ${rColor}`, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
                        {item.item_name}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", lineHeight: 1.4, flex: 1 }}>
                      {item.effect}
                    </div>
                    <button
                      onClick={() => handleUseItem(item.id)}
                      disabled={usingItem === item.id}
                      style={{
                        fontFamily: "var(--font-heading)", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase",
                        padding: "0.35rem 0.6rem", borderRadius: "2px",
                        border: `1px solid ${rColor}33`, backgroundColor: "transparent",
                        color: rColor, cursor: usingItem === item.id ? "not-allowed" : "pointer",
                        opacity: usingItem === item.id ? 0.5 : 1, transition: "all 0.2s", alignSelf: "flex-start",
                      }}
                    >
                      {usingItem === item.id ? "..." : "Use"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Ornamental divider */}
        <Divider />

        {/* ═══════════ PATH OF ASCENSION — vertical timeline ═══════════ */}
        <section>
          <SectionTitle>Path of Ascension</SectionTitle>
          <div style={{ position: "relative", paddingLeft: "2rem" }}>
            {/* Gold timeline line */}
            <div style={{ position: "absolute", left: "0.5rem", top: "0.5rem", bottom: "0.5rem", width: "2px", background: "linear-gradient(180deg, var(--accent-gold), rgba(255,215,0,0.1))" }} />

            {levelUnlocks.map((u, i) => {
              const heroLevel = profile?.hero_level ?? 1;
              const isCurrentLevel = heroLevel >= u.required_level &&
                (i === levelUnlocks.length - 1 || heroLevel < (levelUnlocks[i + 1]?.required_level ?? Infinity));
              return (
                <div
                  key={u.feature}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.5rem 0", position: "relative",
                    opacity: u.unlocked ? 1 : 0.35 - (i * 0.02),
                  }}
                >
                  {/* Timeline node */}
                  <div
                    className={isCurrentLevel ? "glow-breathe" : ""}
                    style={{
                      position: "absolute", left: "-1.65rem",
                      width: "14px", height: "14px", borderRadius: "50%",
                      border: `2px solid ${u.unlocked ? "var(--accent-gold)" : "rgba(224,216,200,0.2)"}`,
                      backgroundColor: u.unlocked ? "var(--accent-gold)" : "transparent",
                      boxShadow: isCurrentLevel ? "0 0 10px rgba(255,215,0,0.5)" : "none",
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.6rem", letterSpacing: "0.05em", color: u.unlocked ? "var(--accent-gold)" : "var(--text-muted)", width: "40px", flexShrink: 0 }}>
                    Lv.{u.required_level}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: u.unlocked ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {u.description}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Sub-components ──

function StreakRune({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "52px", height: "52px", margin: "0 auto 0.3rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        backgroundColor: "rgba(224,216,200,0.03)",
        border: `1px solid ${color}33`,
      }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", fontWeight: 700, color, textShadow: `0 0 10px ${color}55` }}>
          {value}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.45rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.15))" }} />
      <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.6rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        ◆&nbsp;&nbsp;{children}&nbsp;&nbsp;◆
      </span>
      <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(255,215,0,0.15), transparent)" }} />
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: "140px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)", margin: "0 auto" }} />
  );
}
