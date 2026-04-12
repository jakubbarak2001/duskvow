"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { useUserStore } from "@/stores/userStore";
import { getSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { HeroNamingModal } from "@/components/ui/HeroNamingModal";
import type { DungeonRun } from "@/types";


export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const { profile, profileLoading } = useProfile();
  const setProfile = useUserStore((s) => s.setProfile);
  const router = useRouter();

  const [activeDungeon, setActiveDungeon] = useState<DungeonRun | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [shakingDoor, setShakingDoor] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showNaming, setShowNaming] = useState(false);
  const [unclaimedLoot, setUnclaimedLoot] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // Check naming once profile loads
  useEffect(() => {
    if (profile && !profile.hero_name) {
      setShowNaming(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    Promise.allSettled([
      api.listTrees(token),
      api.getActiveDungeon(token),
      api.getUnclaimedLootCount(token),
    ]).then(([treesResult, dungeonResult, lootResult]) => {
      if (dungeonResult.status === "fulfilled" && dungeonResult.value.data) {
        setActiveDungeon(dungeonResult.value.data);
      }
      if (lootResult.status === "fulfilled" && lootResult.value.data) {
        setUnclaimedLoot(lootResult.value.data.count);
      }
      setDataLoading(false);
    });
  }, [session]);

  const handleNamingSubmit = async (heroName: string) => {
    if (!session?.access_token) return;
    const res = await api.updateProfile(heroName, session.access_token);
    if (res.error) {
      throw new Error(res.error.message);
    }
    if (res.data) {
      setProfile(res.data);
    }
    setShowNaming(false);
  };

  const handleLockedClick = (doorKey: string) => {
    setShakingDoor(doorKey);
    setTimeout(() => setShakingDoor(null), 500);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
    } finally {
      router.replace("/auth");
    }
  };

  if (loading) return null;
  if (!user) return null;

  // Gate: show naming modal on a clean background before rendering the hub
  if (showNaming) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-abyss)",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <HeroNamingModal onSubmit={handleNamingSubmit} />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: 'url("/images/entry_background.webp")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dark overlay — ensures cards remain readable over background image */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(rgba(10,10,18,0.55), rgba(10,10,18,0.70))",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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


      {/* ── Hub Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(224,216,200,0.07)",
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(10,10,18,0.5)",
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          <span style={{ color: "var(--bone)" }}>Dusk</span>
          <span style={{ color: "var(--logo-ember)" }}>vow</span>
        </Link>

        {/* Hero Level + Streak */}
        {profile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            {/* Hero name (if set) — links to profile */}
            {profile.hero_name && (
              <>
                <Link
                  href="/profile"
                  style={{
                    textAlign: "center",
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "0.1em",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    {profile.hero_name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "0.5rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    {profile.hero_title}
                  </span>
                </Link>

                <div
                  style={{
                    width: "1px",
                    height: "2rem",
                    backgroundColor: "rgba(224,216,200,0.1)",
                  }}
                />
              </>
            )}

            {/* Level */}
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--accent-gold)",
                  letterSpacing: "0.05em",
                  textShadow: "0 0 12px rgba(255,215,0,0.4)",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                Lv.{profile.hero_level}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Level
              </span>
            </div>

            <div
              style={{
                width: "1px",
                height: "2rem",
                backgroundColor: "rgba(224,216,200,0.1)",
              }}
            />

            {/* Streak */}
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--accent-ember)",
                  letterSpacing: "0.05em",
                  textShadow: "0 0 12px rgba(200,75,17,0.5)",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {profile.current_streak}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Day Streak
              </span>
              {profile.streak_multiplier > 1.0 && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "0.2rem",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    color: "var(--accent-gold)",
                    backgroundColor: "rgba(255,215,0,0.1)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: "2px",
                    padding: "0.1rem 0.35rem",
                  }}
                  title="Streak XP bonus"
                >
                  +{Math.round((profile.streak_multiplier - 1) * 100)}%
                </span>
              )}
              {profile.current_streak >= 3 &&
                profile.last_activity_date &&
                profile.last_activity_date !== new Date().toISOString().slice(0, 10) && (
                <span
                  className="dungeon-pulse"
                  style={{
                    display: "block",
                    marginTop: "0.2rem",
                    fontFamily: "var(--font-crimson)",
                    fontStyle: "italic",
                    fontSize: "0.5rem",
                    color: "var(--accent-ember)",
                    opacity: 0.8,
                  }}
                >
                  Your flame dims...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: signingOut ? "not-allowed" : "pointer",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            transition: "color 0.2s",
            opacity: signingOut ? 0.5 : 1,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          {signingOut ? "Leaving…" : "Sign Out"}
        </button>
      </header>

      {/* ── Main Hub Arena ── */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem 4rem",
          gap: "2rem",
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          ◆&nbsp;&nbsp;Choose Your Path&nbsp;&nbsp;◆
        </div>

        {/* Unclaimed loot reminder */}
        {unclaimedLoot > 0 && (
          <Link
            href="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.15)",
              borderRadius: "4px",
              textDecoration: "none",
              transition: "border-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,215,0,0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,215,0,0.15)")}
          >
            <span style={{ fontSize: "0.9rem" }}>&#x2728;</span>
            <span
              style={{
                fontFamily: "var(--font-crimson)",
                fontStyle: "italic",
                fontSize: "0.85rem",
                color: "var(--accent-gold)",
              }}
            >
              Unclaimed spoils await — {unclaimedLoot} run{unclaimedLoot !== 1 ? "s" : ""} with loot
            </span>
          </Link>
        )}

        {/* Three Doors */}
        <div className="hub-doors-grid">
          {/* ── Door 1: The Vow Chamber (UNLOCKED) ── */}
          <Link href="/vows" className="hub-door hub-door-unlocked">
            {/* Anvil: video on desktop, static image on mobile */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "320px", paddingTop: "2rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/anvil_clipped.webp"
                alt="Anvil"
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Vow Chamber</h2>
              <p className="hub-door-subtitle">Forge and walk your talent trees</p>

              <div className="hub-door-status hub-door-status-unlocked">
                Enter the chamber
              </div>
            </div>

          </Link>

          {/* ── Door 2: The Dungeon (UNLOCKED) ── */}
          <Link href="/dungeon" className="hub-door hub-door-unlocked">
            {/* Dungeon image */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "320px", paddingTop: "2rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dungeon_card.webp"
                alt="Dungeon"
                loading="lazy"
                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
              />
            </div>

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Dungeon</h2>
              <p className="hub-door-subtitle">Face the darkness. Master your focus.</p>

              <div className="hub-door-status hub-door-status-unlocked">
                {activeDungeon ? (
                  <span className="dungeon-pulse" style={{ color: "var(--accent-ember)" }}>
                    In progress — Floor {Math.min(activeDungeon.events?.length ?? 0, activeDungeon.total_floors)} of {activeDungeon.total_floors}
                  </span>
                ) : (
                  "Descend"
                )}
              </div>
            </div>
          </Link>

          {/* ── Door 3: The Hearth (LOCKED) ── */}
          <div
            className={`hub-door hub-door-locked${shakingDoor === "hearth" ? " hub-door-shake" : ""}`}
            onClick={() => handleLockedClick("hearth")}
          >
            {/* Brazier image */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "320px", paddingTop: "2rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brazier_clipped.webp" alt="Brazier" loading="lazy" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", opacity: 0.5 }} />
            </div>

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Hearth</h2>
              <p className="hub-door-subtitle">Your sanctum. Your trophies. Your fire.</p>

              <div className="hub-door-status hub-door-status-locked">
                Locked
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
