import type { CSSProperties } from "react";
import type { AuthError } from "@supabase/supabase-js";

/**
 * Map a Supabase auth error to an in-character, user-facing message.
 * Raw API strings never make it to the UI — if the error doesn't match
 * a known case we fall back to a generic "something shifted" line.
 *
 * Extend this as new Supabase error codes appear in production. The
 * mapping is deliberately small so the tone stays consistent.
 */
export function mapAuthError(err: AuthError): string {
  const msg = (err.message ?? "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Those runes don't match. Try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Check your email — the flame is still being lit.";
  }
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already")
  ) {
    return "A vow already burns for that email. Try signing in.";
  }
  if (msg.includes("password should be") || msg.includes("weak password")) {
    return "That pass-rune is too frail. 8+ characters, mixing letters and digits.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many attempts. Wait a moment before trying again.";
  }
  if (msg.includes("email rate limit")) {
    return "Too many emails sent — give us a minute before asking again.";
  }
  return "Something shifted in the dark. Try again in a moment.";
}

// ---------- Shared style primitives used by LoginForm / SignUpForm / ForgotPasswordForm.

export const authFieldStyle: CSSProperties = {
  width: "100%",
  padding: "0.85rem 1rem",
  fontSize: "0.9rem",
  fontFamily: "var(--font-inter), sans-serif",
  borderRadius: "2px",
  color: "var(--text-primary)",
};

export const authLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.4rem",
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "0.62rem",
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

export const authOrDividerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "1.5rem 0",
  fontFamily: "var(--font-heading), 'Cinzel', serif",
  fontSize: "0.6rem",
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: "var(--gold-dim)",
};

export function authPrimaryButtonStyle(disabled: boolean): CSSProperties {
  return {
    width: "100%",
    marginTop: "0.5rem",
    padding: "0.95rem 1rem",
    fontFamily: "var(--font-heading), 'Cinzel', serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "var(--text-primary)",
    background: disabled
      ? "var(--bg-elevated)"
      : "linear-gradient(135deg, var(--accent-ember), #a03a28)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.3s ease",
  };
}

export const authSecondaryLinkStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  color: "var(--text-secondary)",
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontSize: "0.85rem",
  fontStyle: "italic",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: "rgba(255, 215, 0, 0.25)",
  textUnderlineOffset: "2px",
};
