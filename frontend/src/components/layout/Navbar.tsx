"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getSupabase } from "@/lib/supabase";

export function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await getSupabase().auth.signOut();
    router.replace("/auth");
  };

  return (
    <nav
      className="px-6 py-4 flex items-center justify-between"
      style={{
        backgroundColor: "var(--bg-shadow)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <Link
        href="/"
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

      <div className="flex items-center gap-4">
        {!loading && user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Hub
            </Link>
            <Link
              href="/vows"
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Vow Chamber
            </Link>
            <Link
              href="/tree/new"
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              New Vow
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Sign out
            </button>
          </>
        ) : !loading ? (
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
        ) : null}
      </div>
    </nav>
  );
}
