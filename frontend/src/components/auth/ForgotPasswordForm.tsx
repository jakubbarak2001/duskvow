"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  authFieldStyle,
  authLabelStyle,
  authPrimaryButtonStyle,
  authSecondaryLinkStyle,
  mapAuthError,
} from "@/components/auth/authShared";

interface ForgotPasswordFormProps {
  onCancel: () => void;
}

/**
 * Requests a password-reset email. Supabase handles the rest of the flow
 * (link → token → set new password) — for now the landing target is just
 * the sign-in tab, where the user can paste the reset code if Supabase
 * redirects them back. A dedicated "set new password" surface is a later
 * sprint.
 */
export function ForgotPasswordForm({ onCancel }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 0 && !pending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth`
        : "/auth";

    const { error: err } = await getSupabase().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );

    if (err) {
      setError(mapAuthError(err));
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "0.65rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--accent-gold)",
            marginBottom: "0.9rem",
          }}
        >
          ◆ A rune is on its way ◆
        </div>
        <p style={sentCopyStyle}>
          If an account exists for that email, the relighting rune is in your
          inbox. It expires in one hour.
        </p>
        <button type="button" onClick={onCancel} style={authSecondaryLinkStyle}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: "1.25rem" }}>
        <label htmlFor="forgot-email" style={authLabelStyle}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={authFieldStyle}
          className="wiz-textarea"
        />
      </div>

      {error && (
        <p role="alert" style={errorLineStyle}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={authPrimaryButtonStyle(!canSubmit)}
      >
        <span>{pending ? "Sending…" : "Send Relighting Rune"}</span>
      </button>

      <div style={{ textAlign: "center", marginTop: "1.1rem" }}>
        <button type="button" onClick={onCancel} style={authSecondaryLinkStyle}>
          Back to sign in
        </button>
      </div>
    </form>
  );
}

const sentCopyStyle: CSSProperties = {
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontSize: "0.95rem",
  fontStyle: "italic",
  color: "var(--text-secondary)",
  lineHeight: 1.6,
  margin: "0 0 2rem",
};

const errorLineStyle: CSSProperties = {
  margin: "0 0 1rem",
  padding: "0.55rem 0.85rem",
  fontSize: "0.8rem",
  color: "var(--accent-blood)",
  backgroundColor: "rgba(139, 0, 0, 0.08)",
  border: "1px solid rgba(139, 0, 0, 0.3)",
  borderRadius: "2px",
};
