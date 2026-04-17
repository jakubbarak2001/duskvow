"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type AuthMode = "signin" | "signup" | "forgot";

const COPY: Record<AuthMode, { eyebrow: string; h1: string; sub: string }> = {
  signin: {
    eyebrow: "Return, wanderer",
    h1: "Sign In",
    sub: "Your flame waits.",
  },
  signup: {
    eyebrow: "The first bite",
    h1: "Create Your Account",
    sub: "Takes a minute. Your first goal comes after.",
  },
  forgot: {
    eyebrow: "Rekindle",
    h1: "Reset Your Password",
    sub: "We'll send a reset link to your email.",
  },
};

interface AuthCardProps {
  mode: AuthMode;
  onModeChange: (next: "signin" | "signup") => void;
  children: ReactNode;
}

/**
 * Shared chrome for the auth surface. Renders the Duskvow wordmark,
 * the Sign In / Create Vow tab row, the mode-specific heading block,
 * and then any children (email form, forgot-password form, etc).
 *
 * The tabs are hidden when `mode === 'forgot'` so the user isn't
 * tempted to context-switch away from the reset flow.
 */
export function AuthCard({ mode, onModeChange, children }: AuthCardProps) {
  const copy = COPY[mode];
  const showTabs = mode !== "forgot";

  return (
    <div style={cardShellStyle}>
      <Link href="/" style={logoStyle}>
        Dusk<span style={{ color: "var(--accent-ember)" }}>vow</span>
      </Link>

      <div style={goldDividerStyle} aria-hidden="true" />

      {showTabs && (
        <div role="tablist" aria-label="Authentication mode" style={tabsRowStyle}>
          <TabButton
            active={mode === "signin"}
            onClick={() => onModeChange("signin")}
          >
            Sign In
          </TabButton>
          <TabButton
            active={mode === "signup"}
            onClick={() => onModeChange("signup")}
          >
            Sign Up
          </TabButton>
        </div>
      )}

      <p style={eyebrowStyle}>
        — {copy.eyebrow.toUpperCase()} —
      </p>
      <h1 style={h1Style}>{copy.h1}</h1>
      <p style={subStyle}>{copy.sub}</p>

      {children}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link href="/" style={returnLinkStyle}>
          ← Return to the Gates
        </Link>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        padding: "0.65rem 0",
        cursor: "pointer",
        fontFamily: "var(--font-heading), 'Cinzel', serif",
        fontSize: "0.7rem",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        borderBottom: active
          ? "2px solid var(--accent-ember)"
          : "2px solid transparent",
        transition: "color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

// ---------- Styles ----------

const cardShellStyle: CSSProperties = {
  backgroundColor: "var(--bg-shadow)",
  border: "1px solid rgba(200, 75, 17, 0.25)",
  boxShadow:
    "0 0 40px rgba(200, 75, 17, 0.08), 0 0 80px rgba(200, 75, 17, 0.04), 0 20px 60px rgba(0,0,0,0.55), inset 0 0 40px rgba(0,0,0,0.25)",
  padding: "3.5rem 2.75rem 2.5rem",
  width: "100%",
  maxWidth: 480,
  position: "relative",
  zIndex: 20,
};

const logoStyle: CSSProperties = {
  display: "block",
  textAlign: "center",
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "1.2rem",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--text-primary)",
  textDecoration: "none",
};

const goldDividerStyle: CSSProperties = {
  height: 1,
  background:
    "linear-gradient(90deg, transparent, var(--gold-dim), transparent)",
  margin: "1.75rem 0 1.25rem",
};

const tabsRowStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  borderBottom: "1px solid var(--border-muted)",
  marginBottom: "1.75rem",
};

const eyebrowStyle: CSSProperties = {
  textAlign: "center",
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "0.65rem",
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: "var(--accent-ember)",
  margin: "0 0 1rem",
};

const h1Style: CSSProperties = {
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "clamp(1.75rem, 4vw, 2.3rem)",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textAlign: "center",
  color: "var(--text-primary)",
  margin: "0 0 0.5rem",
  lineHeight: 1.2,
};

const subStyle: CSSProperties = {
  textAlign: "center",
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontStyle: "italic",
  fontSize: "0.95rem",
  color: "var(--text-secondary)",
  margin: "0 0 2rem",
};

const returnLinkStyle: CSSProperties = {
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "0.65rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  textDecoration: "none",
  transition: "color 0.3s ease",
};
