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
import { StreakFlame } from "@/components/ui/StreakFlame";
import { ResumeStrip } from "@/components/ui/ResumeStrip";
import type { TalentTree, DailyQuest } from "@/types";

// Dashboard mobile menu links. Mirrors the shared Navbar's authed links so
// users get the same navigation surface from either entry point. "Hub" is
// included even though the user is already here — it's a no-op tap, but
// consistency beats cleverness.
const DASH_NAV_LINKS = [
  { href: "/dashboard", label: "Hub" },
  { href: "/vows", label: "Vow Chamber" },
  { href: "/tree/new", label: "New Vow" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
] as const;


export default function DashboardPage() {
  const { user, session, loading } = useUser();
  const { profile } = useProfile();
  const setProfile = useUserStore((s) => s.setProfile);
  const router = useRouter();

  const [primaryTree, setPrimaryTree] = useState<TalentTree | null>(null);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [shakingDoor, setShakingDoor] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showNaming, setShowNaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Lock body scroll while the mobile menu is open. Captures the previous
  // overflow value so we don't stomp page-specific overflow rules.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close menu on Escape — small a11y affordance.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    Promise.allSettled([
      api.listTrees(token),
      api.getTodayQuests(token),
    ]).then(async ([treesResult, questsResult]) => {
      if (questsResult.status === "fulfilled" && questsResult.value.data) {
        setDailyQuests(questsResult.value.data);
      }

      // listTrees returns trees without nodes. To show the "next node" on
      // the resume strip we need the full tree detail for the most-recently
      // updated active tree — fetch it as a follow-up.
      if (treesResult.status === "fulfilled" && treesResult.value.data) {
        const list = treesResult.value.data;
        const mostRecentActive = list
          .filter((t) => t.status === "active")
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
        if (mostRecentActive) {
          const detail = await api.getTree(mostRecentActive.id, token);
          if (detail.data) {
            setPrimaryTree(detail.data);
          } else {
            // Fallback: getTree failed but we know a tree exists — render
            // the active state without a "next node" line rather than
            // showing the empty-state card.
            setPrimaryTree(mostRecentActive);
          }
        }
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
        className="dash-header"
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
          onClick={() => setMenuOpen(false)}
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

        {/* Hero Level + Streak — desktop cluster, hidden below 768px via .dash-header-desktop */}
        {profile && (
          <div
            className="dash-header-desktop"
            style={{
              display: "flex",
              alignItems: "flex-start",
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
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "0.05em",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    {profile.hero_name}
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

            {/* Streak — Duolingo-style number + flame */}
            <StreakFlame
              currentStreak={profile.current_streak}
              lastActivityDate={profile.last_activity_date}
              streakMultiplier={profile.streak_multiplier}
            />
          </div>
        )}

        {/* Sign out — desktop only, hidden via .dash-header-desktop on mobile */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="dash-header-desktop"
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

        {/* Mobile hamburger — visibility gated by CSS (display: none ≥769px). */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="dash-mobile-nav-panel"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="mobile-nav-toggle"
        >
          <span className="mobile-nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {/* Mobile overlay panel — outside the header so it can full-screen.
          CSS (.mobile-nav-overlay) gates visibility above 768px. */}
      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        >
          <div
            id="dash-mobile-nav-panel"
            className="mobile-nav-panel"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            {/* Hero summary at the top of the panel — keeps name/level/streak
                accessible even though the desktop cluster is hidden on mobile. */}
            {profile && (
              <div className="dash-mobile-hero">
                {profile.hero_name && (
                  <div className="dash-mobile-hero-name">
                    <span className="dash-mobile-hero-name-text">{profile.hero_name}</span>
                    {profile.hero_title && (
                      <span className="dash-mobile-hero-title-text">{profile.hero_title}</span>
                    )}
                  </div>
                )}
                <div className="dash-mobile-hero-stats">
                  <span className="dash-mobile-hero-level">Lv.{profile.hero_level}</span>
                  <span className="dash-mobile-hero-sep" aria-hidden="true">◆</span>
                  <StreakFlame
                    currentStreak={profile.current_streak}
                    lastActivityDate={profile.last_activity_date}
                    streakMultiplier={profile.streak_multiplier}
                  />
                </div>
              </div>
            )}

            {DASH_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="mobile-nav-link"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              role="menuitem"
              className="mobile-nav-link mobile-nav-link-signout"
              style={{ textAlign: "left", background: "transparent", width: "100%" }}
            >
              {signingOut ? "Leaving…" : "Sign out"}
            </button>
          </div>
        </div>
      )}

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
        {/* Resume strip — primary CTA */}
        <ResumeStrip
          primaryTree={primaryTree}
          dailyQuests={dailyQuests}
          loading={dataLoading}
        />

        {/* Downgraded eyebrow: frames doors as alternatives to the resume strip */}
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
          ◆&nbsp;&nbsp;Or Explore&nbsp;&nbsp;◆
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

          {/* ── Door 2: The Dungeon (LOCKED — temporarily hidden from early
              testers to reduce scope. Feature is fully built and routes still
              work; this is purely a Hub-level visibility gate. Mirror Hearth's
              locked treatment exactly so flipping back is a one-line revert. */}
          <div
            className={`hub-door hub-door-locked${shakingDoor === "dungeon" ? " hub-door-shake" : ""}`}
            onClick={() => handleLockedClick("dungeon")}
          >
            {/* Dungeon image — same layout as before, but muted with opacity 0.5
                to match Hearth's brazier treatment. */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: "320px", paddingTop: "9rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/dungeon.webp"
                alt="Dungeon"
                loading="lazy"
                style={{ height: "175%", width: "auto", maxWidth: "175%", objectFit: "contain", opacity: 0.5 }}
              />
            </div>

            {/* Door content */}
            <div className="hub-door-content">
              <h2 className="hub-door-title">The Dungeon</h2>
              <p className="hub-door-subtitle">Face the darkness. Master your focus.</p>

              <div className="hub-door-status hub-door-status-locked">
                Locked
              </div>
            </div>
          </div>

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
