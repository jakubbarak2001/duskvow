"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

interface GoogleOAuthButtonProps {
  redirectPath?: string;
}

/**
 * Custom Google OAuth button — renders the Google "G" mark alongside dark
 * ember-bordered chrome so it visually integrates with the rest of the
 * Duskvow UI (instead of importing the Supabase auth-ui defaults).
 *
 * Clicking triggers `supabase.auth.signInWithOAuth`, which redirects to
 * Google. After the OAuth round-trip Supabase redirects the browser back
 * to `redirectTo`, where the session cookie is established.
 */
export function GoogleOAuthButton({
  redirectPath = "/dashboard",
}: GoogleOAuthButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (pending) return;
    setPending(true);
    setError(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}${redirectPath}`
        : redirectPath;

    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (err) {
      setError("The rite of passage failed. Try again in a moment.");
      setPending(false);
    }
    // On success the browser navigates away; no need to reset state.
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          width: "100%",
          padding: "0.85rem 1rem",
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid rgba(224, 216, 200, 0.12)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-heading), 'Cinzel', serif",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: pending ? "wait" : "pointer",
          opacity: pending ? 0.6 : 1,
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          if (pending) return;
          e.currentTarget.style.backgroundColor = "var(--bg-highlight)";
          e.currentTarget.style.borderColor = "rgba(200, 75, 17, 0.4)";
          e.currentTarget.style.boxShadow = "0 2px 20px rgba(200, 75, 17, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
          e.currentTarget.style.borderColor = "rgba(224, 216, 200, 0.12)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <GoogleGMark />
        <span>{pending ? "Opening Google…" : "Continue with Google"}</span>
      </button>
      {error && (
        <p
          style={{
            margin: "0.5rem 0 0",
            fontSize: "0.75rem",
            color: "var(--accent-blood)",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
    </>
  );
}

function GoogleGMark() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
