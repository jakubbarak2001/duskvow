"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getSupabase } from "@/lib/supabase";

const AUTHED_LINKS = [
  { href: "/dashboard", label: "Hub" },
  { href: "/vows", label: "Vow Chamber" },
  { href: "/tree/new", label: "New Vow" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const;

export function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await getSupabase().auth.signOut();
    router.replace("/auth");
  };

  // Lock body scroll while the mobile menu is open. Captures the previous
  // overflow value so we don't stomp on any page-specific overflow rules.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close menu on Escape — a small accessibility affordance.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <nav
      className="px-6 py-4 flex items-center justify-between"
      style={{
        backgroundColor: "var(--bg-shadow)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <Link
        href={user ? "/dashboard" : "/"}
        onClick={() => setMenuOpen(false)}
        style={{
          fontFamily: "var(--font-heading), 'Cinzel', serif",
          fontWeight: 700,
          fontSize: "1.3rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        <span style={{ color: "var(--bone)" }}>Dusk</span>
        <span style={{ color: "var(--logo-ember)" }}>vow</span>
      </Link>

      {/* Authed desktop links — hidden below md via .navbar-desktop-links rule */}
      {!loading && user && (
        <div className="navbar-desktop-links flex items-center gap-4">
          {AUTHED_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="text-sm transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Sign out
          </button>
        </div>
      )}

      {/* Unauthed — single Sign In button, visible on every viewport.
          Deliberately outside .navbar-desktop-links so it isn't hidden on mobile. */}
      {!loading && !user && (
        <Link
          href="/auth"
          className="text-sm px-4 py-2 rounded transition-colors"
          style={{
            backgroundColor: "var(--accent-ember)",
            color: "var(--text-primary)",
          }}
        >
          Sign In
        </Link>
      )}

      {/* Mobile hamburger — only rendered for authed users (unauthed already
          has the Sign In button visible inline). */}
      {!loading && user && (
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="mobile-nav-toggle"
        >
          <span className="mobile-nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      )}

      {/* Mobile overlay panel — absolute-positioned outside the nav flow.
          Visibility gated by CSS (display: none above md) and menuOpen state. */}
      {menuOpen && !loading && user && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        >
          <div
            id="mobile-nav-panel"
            className="mobile-nav-panel"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            {AUTHED_LINKS.map((link) => (
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
              role="menuitem"
              className="mobile-nav-link mobile-nav-link-signout"
              style={{ textAlign: "left", background: "transparent", width: "100%" }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
