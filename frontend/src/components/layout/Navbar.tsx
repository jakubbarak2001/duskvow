"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "var(--bg-shadow)", borderBottom: "1px solid var(--border-default)" }}>
      <Link href="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}>
        Duskvow
      </Link>
      <div className="flex gap-4">
        <Link href="/dashboard" style={{ color: "var(--text-secondary)" }} className="hover:text-[var(--text-primary)] transition-colors">
          Dashboard
        </Link>
        <Link href="/auth" style={{ color: "var(--text-secondary)" }} className="hover:text-[var(--text-primary)] transition-colors">
          Sign In
        </Link>
      </div>
    </nav>
  );
}
