"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const AuthForm = dynamic(
  () => import("@/components/auth/AuthForm").then((m) => ({ default: m.AuthForm })),
  { ssr: false },
);

export default function AuthPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-abyss)",
        position: "relative",
        overflow: "hidden",
        padding: "2rem 1rem",
      }}
    >
      {/* Noise overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.45,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Radial ember glow — low center, bleeds upward */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80vw",
          height: "65vh",
          background: "radial-gradient(ellipse at center bottom, rgba(200,75,17,0.13) 0%, rgba(139,0,0,0.05) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Secondary top glow — faint gold haze */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "40vh",
          background: "radial-gradient(ellipse at center top, rgba(255,215,0,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Floating ember particles */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10, overflow: "hidden" }}
      >
        {/* 2px small — ember red */}
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "10%",  animation: "wiz-float-c 14s linear 0.5s  infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "38%",  animation: "wiz-float-c  9s linear 4s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "79%",  animation: "wiz-float-c 12s linear 7s    infinite", opacity: 0 }} />
        {/* 3px medium — ember red */}
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "22%",  animation: "wiz-float-a 10s linear 1.5s  infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "58%",  animation: "wiz-float-b  8s linear 3s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "91%",  animation: "wiz-float-a 16s linear 2s    infinite", opacity: 0 }} />
        {/* 4px — alternating ember/gold */}
        <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 7px 2px rgba(232,101,63,0.65)", left: "6%",   animation: "wiz-float-b 11s linear 6s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 7px 2px rgba(201,168,76,0.65)", left: "47%",  animation: "wiz-float-a  7s linear 1s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 7px 2px rgba(201,168,76,0.65)", left: "86%",  animation: "wiz-float-c 13s linear 5.5s  infinite", opacity: 0 }} />
        {/* 6px large */}
        <div style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 10px 3px rgba(232,101,63,0.7)", left: "32%",  animation: "wiz-float-a 18s linear 0s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 10px 3px rgba(201,168,76,0.7)", left: "68%",  animation: "wiz-float-b 15s linear 4.5s  infinite", opacity: 0 }} />
      </div>

      {/* Auth card */}
      <div
        style={{
          backgroundColor: "var(--bg-shadow)",
          border: "1px solid rgba(200, 75, 17, 0.25)",
          boxShadow: "0 0 40px rgba(200, 75, 17, 0.08), 0 0 80px rgba(200, 75, 17, 0.04), 0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.2)",
          padding: "3rem 2.5rem 2.5rem",
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 20,
        }}
      >
        {/* Logo — links back to landing */}
        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "var(--text-primary)",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          Dusk<span style={{ color: "var(--accent-ember)" }}>vow</span>
        </Link>

        {/* Gold gradient divider */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold-dim), transparent)",
            marginBottom: "2rem",
          }}
        />

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "clamp(1.75rem, 4vw, 2.3rem)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textAlign: "center",
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
            lineHeight: 1.2,
          }}
        >
          Enter the Realm
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            color: "var(--text-muted)",
            marginBottom: "2.5rem",
          }}
        >
          Sign in to forge your path
        </p>

        <AuthForm />

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            ← Return to the Gates
          </Link>
        </div>
      </div>
    </main>
  );
}
