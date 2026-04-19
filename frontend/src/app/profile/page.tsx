"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { getSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { xpForLevel, nextTitleInfo } from "@/lib/levels";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  Achievement,
  LevelUnlock,
  ProfileStats,
} from "@/types";

const ICON_MAP: Record<string, string> = {
  scroll: "◆", shield: "⛊", sword: "⚔", flame: "✦", road: "═",
  chest: "⬡", abyss: "◈", mountain: "▲", crown: "♔", star: "✦",
};

const CATEGORY_LABELS: Record<string, string> = {
  tree: "Vow Mastery",
  meta: "Legendary Feats",
};

const STAT_ACCENTS: Record<string, string> = {
  "Total XP": "var(--accent-gold)",
  "Trees Completed": "var(--accent-gold)",
  "Trees Active": "var(--accent-gold)",
  "Nodes Completed": "var(--accent-gold)",
};

// MVP scope: hide dungeon + prestige features from the Path of Ascension
// until those systems ship. Backend keeps serving them — we just don't
// paint them in the UI.
const MVP_HIDDEN_UNLOCK_PREFIXES = ["dungeon_", "prestige", "streak_"] as const;

function isMvpUnlock(feature: string): boolean {
  return !MVP_HIDDEN_UNLOCK_PREFIXES.some((p) => feature.startsWith(p));
}

export default function ProfilePage() {
  const { user, session, loading } = useUser();
  const { profile } = useProfile();
  const router = useRouter();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocks, setUnlocks] = useState<LevelUnlock[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    Promise.allSettled([
      api.getAchievements(token),
      api.getLevelUnlocks(token),
      api.getProfileStats(token),
    ]).then(([achievementsRes, unlocksRes, statsRes]) => {
      if (achievementsRes.status === "fulfilled" && achievementsRes.value.data)
        setAchievements(achievementsRes.value.data);
      if (unlocksRes.status === "fulfilled" && unlocksRes.value.data)
        setUnlocks(unlocksRes.value.data);
      if (statsRes.status === "fulfilled" && statsRes.value.data)
        setStats(statsRes.value.data);
    });
  }, [session]);

  const handleExportData = async () => {
    if (!session?.access_token || exporting) return;
    setExporting(true);
    try {
      const res = await api.fetchDataExport(session.access_token);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const date = new Date().toISOString().slice(0, 10);
      anchor.download = `duskvow-export-${date}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    const res = await api.deleteAccount(deletePhrase, session.access_token);
    if (res.error) {
      setDeleteError(
        res.error.message ??
          "Something shifted in the dark. Try again in a moment.",
      );
      setDeleting(false);
      return;
    }
    // Account is gone — sign out to clear the local session, then home.
    await getSupabase().auth.signOut();
    router.replace("/");
  };

  if (loading) return null;
  if (!user) return null;

  const currentLevelXp = profile ? xpForLevel(profile.hero_level) : 0;
  const nextLevelXp = profile ? xpForLevel(profile.hero_level + 1) : 100;
  const xpProgress = profile ? profile.total_xp - currentLevelXp : 0;
  const xpNeeded = nextLevelXp - currentLevelXp;
  // Clamp to [0, 100]. Without the floor clamp, an edge case (e.g. stale
  // hero_level > levelForXp(total_xp)) could push xpProgress negative; the
  // resulting `width: "-33%"` is invalid CSS and browsers fall back to
  // `auto`, painting the bar fully filled. Belt + suspenders.
  const xpPercent = xpNeeded > 0
    ? Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100))
    : 100;
  // MVP scope: tree-mastery + meta achievements only. Dungeon achievements
  // are still earned server-side but hidden from the UI until dungeons ship.
  const mvpAchievements = achievements.filter((a) => (a.category ?? "meta") !== "dungeon");
  const earnedCount = mvpAchievements.filter((a) => a.unlocked).length;
  const nextTitle = profile ? nextTitleInfo(profile.hero_level) : null;
  const streakPct = profile && profile.streak_multiplier > 1.0
    ? Math.round((profile.streak_multiplier - 1.0) * 100)
    : 0;
  const levelUnlocks = unlocks.filter((u) => isMvpUnlock(u.feature));

  // Group achievements by category (post-filter)
  const achievementsByCategory = mvpAchievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    const cat = a.category ?? "meta";
    (acc[cat] ??= []).push(a);
    return acc;
  }, {});

  const statRows = stats && profile ? [
    { label: "Total XP", value: profile.total_xp.toLocaleString() },
    { label: "Trees Completed", value: stats.trees_completed },
    { label: "Trees Active", value: stats.trees_active },
    { label: "Nodes Completed", value: stats.nodes_completed },
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
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "2.5rem", borderRadius: "0" }} />
              ))}
            </div>
          </section>
        )}

        {/* Ornamental divider */}
        <Divider />

        {/* ═══════════ ACHIEVEMENTS — grouped by category ═══════════ */}
        <section>
          <SectionTitle>Achievements ({earnedCount} of {mvpAchievements.length})</SectionTitle>
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

        {/* ═══════════ PATH OF ASCENSION — milestone waypoints ═══════════ */}
        <section>
          <SectionTitle>Path of Ascension</SectionTitle>
          <AscensionPath
            unlocks={levelUnlocks}
            heroLevel={profile?.hero_level ?? 1}
          />
        </section>

        {/* ── Danger Zone ── GDPR Art. 17 (erasure) + Art. 20 (portability) */}
        <section style={{ marginTop: "4rem" }}>
          <SectionTitle>Unbind Your Vow</SectionTitle>

          <div
            style={{
              background: "var(--bg-shadow)",
              border: "1px solid rgba(139, 0, 0, 0.3)",
              padding: "1.75rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-crimson), Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Take what is yours, or extinguish your flame. Either is your
              right, and either is final.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                style={{
                  fontFamily: "var(--font-heading), 'Cinzel', serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  background: "var(--bg-elevated)",
                  border: "1px solid rgba(224, 216, 200, 0.15)",
                  padding: "0.65rem 1.4rem",
                  cursor: exporting ? "wait" : "pointer",
                  opacity: exporting ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {exporting ? "Gathering…" : "Export My Data"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setDeletePhrase("");
                  setDeleteError(null);
                }}
                style={{
                  fontFamily: "var(--font-heading), 'Cinzel', serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--accent-blood)",
                  background: "transparent",
                  border: "1px solid var(--accent-blood)",
                  padding: "0.65rem 1.4rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(139, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Unbind Your Vow
              </button>
            </div>
          </div>
        </section>

        {confirmDelete && (
          <DeleteAccountModal
            phrase={deletePhrase}
            onPhraseChange={setDeletePhrase}
            deleting={deleting}
            error={deleteError}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──

function DeleteAccountModal({
  phrase,
  onPhraseChange,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  phrase: string;
  onPhraseChange: (v: string) => void;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm = phrase.trim() === "DELETE MY VOW" && !deleting;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 10, 18, 0.78)",
        backdropFilter: "blur(6px)",
        padding: "1.5rem",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--bg-shadow)",
          border: "1px solid rgba(139, 0, 0, 0.4)",
          boxShadow:
            "0 0 40px rgba(139, 0, 0, 0.15), 0 20px 60px rgba(0, 0, 0, 0.6)",
          padding: "2rem 1.75rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--accent-blood)",
            margin: "0 0 0.75rem",
          }}
        >
          Extinguish the flame?
        </h2>
        <p
          style={{
            fontFamily: "var(--font-crimson), Georgia, serif",
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            margin: "0 0 1.25rem",
          }}
        >
          This deletes your account and every vow, node, ember, dungeon run,
          and achievement tied to it. It cannot be undone.
        </p>
        <p
          style={{
            fontFamily: "var(--font-crimson), Georgia, serif",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            margin: "0 0 0.4rem",
          }}
        >
          Type <code style={{ color: "var(--accent-blood)" }}>DELETE MY VOW</code>{" "}
          to confirm.
        </p>
        <input
          type="text"
          value={phrase}
          onChange={(e) => onPhraseChange(e.target.value)}
          className="wiz-textarea"
          autoFocus
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            fontFamily: "ui-monospace, monospace",
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        />

        {error && (
          <p
            role="alert"
            style={{
              margin: "0 0 1rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.8rem",
              color: "var(--accent-blood)",
              background: "rgba(139, 0, 0, 0.1)",
              border: "1px solid rgba(139, 0, 0, 0.35)",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid rgba(224, 216, 200, 0.15)",
              padding: "0.65rem 1.4rem",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-primary)",
              background: canConfirm ? "var(--accent-blood)" : "var(--bg-elevated)",
              border: "none",
              padding: "0.65rem 1.4rem",
              cursor: canConfirm ? "pointer" : "not-allowed",
              opacity: canConfirm ? 1 : 0.5,
            }}
          >
            {deleting ? "Extinguishing…" : "Extinguish My Flame"}
          </button>
        </div>
      </div>
    </div>
  );
}


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

// ── Path of Ascension ─────────────────────────────────────────────────

const ROMAN_SMALL: [number, string][] = [
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string {
  let out = "";
  let r = n;
  for (const [v, s] of ROMAN_SMALL) {
    while (r >= v) {
      out += s;
      r -= v;
    }
  }
  return out;
}

// Tiny symbol per unlock type. Kept minimal so the copy reads as the hero
// and the mark reads as a footnote — no icon font, just runes.
function unlockSigil(feature: string): string {
  if (feature.startsWith("gen_limit_")) return "✦"; // daily generation slot
  if (feature.startsWith("tree_cap_")) return "◈";  // active tree capacity
  return "⛊"; // discrete feature toggle (hero_profile, fog_of_war_toggle…)
}

interface AscensionPathProps {
  unlocks: LevelUnlock[];
  heroLevel: number;
}

function AscensionPath({ unlocks, heroLevel }: AscensionPathProps) {
  // Group by required_level — kills the "Lv.1 × 3" stacked-pin redundancy.
  const byLevel = new Map<number, LevelUnlock[]>();
  for (const u of unlocks) {
    const arr = byLevel.get(u.required_level) ?? [];
    arr.push(u);
    byLevel.set(u.required_level, arr);
  }
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  // "Current" waypoint = highest level the hero has cleared. Lets us render
  // exactly one ember-ring marker instead of gold-highlighting every past
  // waypoint (which reads as "all of this is now") and dulls the sense of
  // where the hero is standing.
  const currentLevel = levels.reduce(
    (acc, l) => (heroLevel >= l && l > acc ? l : acc),
    0,
  );

  return (
    <div className="ascension-path">
      {levels.map((level, idx) => {
        const entries = byLevel.get(level) ?? [];
        const unlocked = heroLevel >= level;
        const isCurrent = level === currentLevel;
        const isLast = idx === levels.length - 1;
        const state = isCurrent ? "current" : unlocked ? "past" : "future";
        return (
          <div
            key={level}
            className={`ascension-waypoint ascension-waypoint-${state}`}
          >
            <div className="ascension-rail" aria-hidden="true">
              <span className="ascension-pin" />
              {!isLast && <span className="ascension-line" />}
            </div>
            <div className="ascension-body">
              <div className="ascension-rank">
                <span className="ascension-rank-roman">{toRoman(level)}</span>
                <span className="ascension-rank-label">Lv.{level}</span>
                {isCurrent && (
                  <span className="ascension-rank-badge">You are here</span>
                )}
              </div>
              <ul className="ascension-unlocks">
                {entries.map((u) => (
                  <li key={u.feature} className="ascension-unlock">
                    <span className="ascension-unlock-sigil" aria-hidden="true">
                      {unlockSigil(u.feature)}
                    </span>
                    <span className="ascension-unlock-text">{u.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
