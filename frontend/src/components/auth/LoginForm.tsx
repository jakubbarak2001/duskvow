"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
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

interface LoginFormProps {
  onForgot: () => void;
  onSwitchToSignUp: () => void;
}

/**
 * Email + password sign-in form. Authenticates via
 * `supabase.auth.signInWithPassword` and redirects to /dashboard on success.
 *
 * Errors from Supabase are mapped through `mapAuthError` so the user sees
 * in-character copy ("Those runes don't match...") rather than raw API
 * strings. The underlying error code is kept in memory only; no network
 * logging is wired up yet.
 */
export function LoginForm({ onForgot, onSwitchToSignUp }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !pending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    const { error: err } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (err) {
      setError(mapAuthError(err));
      setPending(false);
      return;
    }

    // Supabase has set the session cookie; navigate to the hub.
    router.replace("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <GoogleOAuthButton />

      <div style={authOrDividerStyle} aria-hidden="true">
        <span>◆ or ◆</span>
      </div>

      <Field
        id="signin-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
      />
      <Field
        id="signin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        required
      />

      {error && <ErrorLine text={error} />}

      <button
        type="submit"
        disabled={!canSubmit}
        style={authPrimaryButtonStyle(!canSubmit)}
      >
        <span>{pending ? "Signing in…" : "Sign In"}</span>
      </button>

      <div style={linkRowStyle}>
        <button type="button" style={authSecondaryLinkStyle} onClick={onForgot}>
          Forgot your password?
        </button>
      </div>
      <div style={linkRowStyle}>
        <span style={newHereStyle}>
          New here?{" "}
          <button
            type="button"
            style={{ ...authSecondaryLinkStyle, color: "var(--accent-gold)" }}
            onClick={onSwitchToSignUp}
          >
            Sign up
          </button>
        </span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label htmlFor={id} style={authLabelStyle}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        style={authFieldStyle}
        className="wiz-textarea"
      />
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      role="alert"
      style={{
        margin: "0 0 1rem",
        padding: "0.55rem 0.85rem",
        fontSize: "0.8rem",
        color: "var(--accent-blood)",
        backgroundColor: "rgba(139, 0, 0, 0.08)",
        border: "1px solid rgba(139, 0, 0, 0.3)",
        borderRadius: "2px",
      }}
    >
      {text}
    </p>
  );
}

const linkRowStyle: CSSProperties = {
  textAlign: "center",
  marginTop: "0.9rem",
};

const newHereStyle: CSSProperties = {
  fontFamily: "var(--font-crimson), Georgia, serif",
  fontStyle: "italic",
  fontSize: "0.85rem",
  color: "var(--text-muted)",
};
