"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { HeroNamingModal } from "@/components/ui/HeroNamingModal";
import type { DungeonRun, UserProfile } from "@/types";


export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeVowCount, setActiveVowCount] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [activeDungeon, setActiveDungeon] = useState<DungeonRun | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [shakingDoor, setShakingDoor] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showNaming, setShowNaming] = useState(false);

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
      api.getActiveDungeon(token),
    ]).then(([profileResult, treesResult, dungeonResult]) => {
      if (profileResult.status === "fulfilled" && profileResult.value.data) {
        setProfile(profileResult.value.data);
        if (!profileResult.value.data.hero_name) {
          setShowNaming(true);
        }
      }
      if (treesResult.status === "fulfilled" && treesResult.value.data) {
        const activeTrees = treesResult.value.data.filter(
          (t: { status: string; earned_xp: number }) => t.status === "active"
        );
        setActiveVowCount(activeTrees.length);
        setEarnedXp(
          activeTrees.reduce(
            (sum: number, t: { earned_xp: number }) => sum + (t.earned_xp ?? 0),
            0
          )
        );
      }
      if (dungeonResult.status === "fulfilled" && dungeonResult.value.data) {
        setActiveDungeon(dungeonResult.value.data);
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

  if (loading || dataLoading || (!user && loading)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-abyss)",
          gap: "1.2rem",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(ellipse at center, rgba(200,75,17,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.4rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: "var(--text-primary)" }}>Dusk</span>
          <span style={{ color: "var(--accent-ember)" }}>vow</span>
        </div>
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
          Entering the sanctum
        </div>
      </div>
    );
  }

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
          href="/"
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
        {!dataLoading && profile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            {/* Hero name (if set) */}
            {profile.hero_name && (
              <>
                <div style={{ textAlign: "center" }}>
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
                </div>

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
