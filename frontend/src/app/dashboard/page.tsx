"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { UserProfile } from "@/types";

// Slow, atmospheric ember particles for the hub
const HUB_PARTICLES = [
  { left: "5%",  delay: "0s",    dur: "14s", anim: "wiz-float-a", size: 3 },
  { left: "18%", delay: "3s",    dur: "18s", anim: "wiz-float-b", size: 2 },
  { left: "33%", delay: "7s",    dur: "12s", anim: "wiz-float-c", size: 2 },
  { left: "52%", delay: "1.5s",  dur: "16s", anim: "wiz-float-a", size: 3 },
  { left: "68%", delay: "5s",    dur: "20s", anim: "wiz-float-b", size: 2 },
  { left: "82%", delay: "9s",    dur: "13s", anim: "wiz-float-c", size: 2 },
  { left: "91%", delay: "2s",    dur: "17s", anim: "wiz-float-a", size: 2 },
  { left: "44%", delay: "11s",   dur: "15s", anim: "wiz-float-b", size: 3 },
];

export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeVowCount, setActiveVowCount] = useState<number | null>(null);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [shakingDoor, setShakingDoor] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
    ]).then(([profileResult, treesResult]) => {
      if (profileResult.status === "fulfilled" && profileResult.value.data)
        setProfile(profileResult.value.data);
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
      setDataLoading(false);
    });
  }, [session]);

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

  if (loading || (!user && loading)) {
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
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!user) return null;

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
          background: "linear-gradient(rgba(10,10,18,0.75), rgba(10,10,18,0.85))",
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

      {/* Central radial glow — warm torchlight in the room */}
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "1000px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(200,75,17,0.12) 0%, rgba(200,75,17,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Stone floor vignette */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          background:
            "linear-gradient(to top, rgba(10,10,18,0.92) 0%, rgba(18,18,26,0.5) 50%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Ember particles */}
      {HUB_PARTICLES.map((p, i) => (
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
            boxShadow: `0 0 ${p.size * 2 + 2}px ${p.size}px rgba(200,75,17,0.6)`,
            opacity: 0,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

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

        {/* Compact XP + Streak */}
        {!dataLoading && profile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
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
                {profile.total_xp.toLocaleString()}
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
                XP
              </span>
            </div>

            <div
              style={{
                width: "1px",
                height: "2rem",
                backgroundColor: "rgba(224,216,200,0.1)",
              }}
            />

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
            <div
              className="hub-door-glow-ring"
              style={{
                opacity:
                  activeVowCount === null || activeVowCount === 0
                    ? 0.4
                    : activeVowCount <= 2
                    ? 0.75
                    : 1,
              }}
            />

            {/* Anvil: video on desktop, static image on mobile */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <video autoPlay loop muted playsInline className="hub-anvil-desktop" style={{ maxHeight: "140px", objectFit: "contain" }}>
                <source src="/images/anvil_video.webm" type="video/webm" />
                <source src="/images/anvil_video.mp4" type="video/mp4" />
              </video>
              <picture>
                <img
                  src="/images/anvil.webp"
                  alt="Anvil"
                  className="hub-anvil-mobile"
                  style={{ maxHeight: "140px", objectFit: "contain" }}
                />
              </picture>
            </div>

            {/* Archway frame */}
            <div className="hub-door-arch hub-door-arch-unlocked" />

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Vow Chamber</h2>
              <p className="hub-door-subtitle">Forge and walk your talent trees</p>

              {/* Status — active vow count + XP */}
              {dataLoading ? (
                <div className="hub-door-status hub-door-status-unlocked">
                  Enter
                </div>
              ) : activeVowCount === 0 ? (
                <div className="hub-door-status hub-door-status-unlocked">
                  Begin your journey
                </div>
              ) : (
                <div
                  className="hub-door-status hub-door-status-unlocked"
                  style={{ flexDirection: "column", gap: "0.2rem", alignItems: "center" }}
                >
                  <span>
                    {activeVowCount} active {activeVowCount === 1 ? "vow" : "vows"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      color: "var(--accent-gold)",
                      opacity: 0.85,
                    }}
                  >
                    {earnedXp.toLocaleString()} XP earned
                  </span>
                </div>
              )}
            </div>

            {/* Ember leak at base */}
            <div className="hub-door-ember-leak" />
          </Link>

          {/* ── Door 2: The Dungeon (LOCKED) ── */}
          <div
            className={`hub-door hub-door-locked${shakingDoor === "dungeon" ? " hub-door-shake" : ""}`}
            onClick={() => handleLockedClick("dungeon")}
          >
            {/* Sealed door image — the chains tell the story */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <picture>
                <source srcSet="/images/sealed_door.webp" type="image/webp" />
                <img
                  src="/images/sealed_door.jpg"
                  alt="Sealed Door"
                  loading="lazy"
                  style={{
                    maxHeight: "140px",
                    objectFit: "contain",
                    animation: "ember-pulse 3s ease-in-out infinite",
                  }}
                />
              </picture>
            </div>

            {/* Chains overlay */}
            <div className="hub-door-chains" />

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Dungeon</h2>
              <p className="hub-door-subtitle">Face the darkness. Earn your spoils.</p>
            </div>
          </div>

          {/* ── Door 3: The Hearth (UNLOCKED) ── */}
          <Link href="/hearth" className="hub-door hub-door-unlocked">
            <div className="hub-door-glow-ring" style={{ opacity: 0.5 }} />

            {/* Brazier image */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <picture>
                <source srcSet="/images/brazier.webp" type="image/webp" />
                <img src="/images/brazier.jpg" alt="Brazier" loading="lazy" style={{ maxHeight: "140px", objectFit: "contain" }} />
              </picture>
            </div>

            {/* Archway frame */}
            <div className="hub-door-arch hub-door-arch-unlocked" />

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Hearth</h2>
              <p className="hub-door-subtitle">Your sanctum. Your trophies. Your fire.</p>

              <div className="hub-door-status hub-door-status-unlocked">
                Tend your brazier
              </div>
            </div>

            {/* Ember leak at base */}
            <div className="hub-door-ember-leak" />
          </Link>
        </div>
      </main>
    </div>
  );
}
