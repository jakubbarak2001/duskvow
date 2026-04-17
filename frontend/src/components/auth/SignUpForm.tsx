"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import {
  authFieldStyle,
  authLabelStyle,
  authOrDividerStyle,
  authPrimaryButtonStyle,
  authSecondaryLinkStyle,
  mapAuthError,
} from "@/components/auth/authShared";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

type PasswordChecks = {
  length: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
};

function evaluatePassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /\d/.test(pw),
  };
}

function allChecksPass(c: PasswordChecks): boolean {
  return c.length && c.lower && c.upper && c.digit;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const checks = evaluatePassword(password);
  const canSubmit =
    email.trim().length > 0 && allChecksPass(checks) && accepted && !pending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard`
        : "/dashboard";

    const { data, error: err } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo },
    });

    if (err) {
      setError(mapAuthError(err));
      setPending(false);
      return;
    }

    // With email confirmations on, signUp returns a user but no session.
    // Show a "check your email" screen instead of redirecting.
    if (!data.session) {
      setSentEmail(email.trim());
      setPending(false);
      return;
    }

    // Fallback: confirmations are off (local dev). Redirect directly.
    router.replace("/dashboard");
  };

  if (sentEmail) {
    return <CheckYourEmail email={sentEmail} onSwitchToSignIn={onSwitchToSignIn} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <GoogleOAuthButton />

      <div style={authOrDividerStyle} aria-hidden="true">
        <span>◆ or ◆</span>
      </div>

      <div style={{ marginBottom: "1.1rem" }}>
        <label htmlFor="signup-email" style={authLabelStyle}>
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={authFieldStyle}
          className="wiz-textarea"
        />
      </div>

      <div style={{ marginBottom: "0.35rem" }}>
        <label htmlFor="signup-password" style={authLabelStyle}>
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          style={authFieldStyle}
          className="wiz-textarea"
        />
      </div>

      <PasswordStrength checks={checks} />

      <label style={consentWrapperStyle}>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{ marginTop: "0.2rem", flexShrink: 0 }}
        />
        <span style={consentTextStyle}>
          I agree to the{" "}
          <Link href="/terms" target="_blank" style={consentLinkStyle}>
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="/privacy" target="_blank" style={consentLinkStyle}>
            Privacy Policy
          </Link>
          . My goal text is sent to Google Gemini to generate my tree.
        </span>
      </label>

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
        <span>{pending ? "Creating…" : "Create Account"}</span>
      </button>

      <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <span style={alreadyStyle}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            style={{ ...authSecondaryLinkStyle, color: "var(--accent-gold)" }}
          >
            Sign in
          </button>
        </span>
      </p>
    </form>
  );
}

function PasswordStrength({ checks }: { checks: PasswordChecks }) {
  return (
    <ul style={checksListStyle} aria-live="polite">
      <Check passed={checks.length} label="At least 8 characters" />
      <Check passed={checks.lower} label="Lowercase letter" />
      <Check passed={checks.upper} label="Uppercase letter" />
      <Check passed={checks.digit} label="A digit" />
    </ul>
  );
}

function Check({ passed, label }: { passed: boolean; label: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: passed ? "var(--state-complete)" : "var(--text-muted)",
        fontSize: "0.7rem",
        fontFamily: "var(--font-inter), sans-serif",
        lineHeight: 1.6,
      }}
    >
      <span aria-hidden="true" style={{ width: 12, display: "inline-block" }}>
        {passed ? "✓" : "◦"}
      </span>
      {label}
    </li>
  );
}

function CheckYourEmail({
  email,
  onSwitchToSignIn,
}: {
  email: string;
  onSwitchToSignIn: () => void;
}) {
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
        ◆ The flame is lit ◆
      </div>
      <p
        style={{
          fontFamily: "var(--font-crimson), Georgia, serif",
          fontSize: "1rem",
          color: "var(--text-primary)",
          lineHeight: 1.65,
          margin: "0 0 0.75rem",
        }}
      >
        We sent a confirmation rune to{" "}
        <span style={{ color: "var(--accent-gold)" }}>{email}</span>.
      </p>
      <p
        style={{
          fontFamily: "var(--font-crimson), Georgia, serif",
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: "var(--text-secondary)",
          margin: "0 0 2rem",
        }}
      >
        Click the link in the email to enter the realm. You can close this tab.
      </p>
      <button
        type="button"
        onClick={onSwitchToSignIn}
        style={authSecondaryLinkStyle}
      >
        Back to sign in
      </button>
    </div>
  );
}

// ---------- Styles ----------

const consentWrapperStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.65rem",
  margin: "1.25rem 0",
  cursor: "pointer",
};

const consentTextStyle: CSSProperties = {
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontSize: "0.8rem",
  color: "var(--text-secondary)",
  lineHeight: 1.55,
};

const consentLinkStyle: CSSProperties = {
  color: "var(--accent-gold)",
  textDecoration: "underline",
  textDecorationColor: "rgba(255, 215, 0, 0.35)",
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

const alreadyStyle: CSSProperties = {
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontStyle: "italic",
  fontSize: "0.85rem",
  color: "var(--text-muted)",
};

const checksListStyle: CSSProperties = {
  listStyle: "none",
  margin: "0.55rem 0 0.25rem",
  padding: 0,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "1rem",
  rowGap: "0.1rem",
};
