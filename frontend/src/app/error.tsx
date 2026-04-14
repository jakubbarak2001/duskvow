"use client";

import { useEffect } from "react";

/**
 * Route-segment error boundary. Next.js wraps every route with this component
 * automatically — if any page throws, we render this instead of a white screen.
 * The `reset()` callback re-mounts the segment so the user can retry without
 * a full page reload.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, pipe to error tracking (Sentry, etc.)
    if (process.env.NODE_ENV !== "production") {
      console.error("[RouteError]", error);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "3rem 2rem",
        background: "var(--bg-abyss)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--accent-blood)",
        }}
      >
        ◆ The Path Fractured ◆
      </p>

      <h1
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--text-primary)",
          textAlign: "center",
          letterSpacing: "0.05em",
          margin: 0,
          maxWidth: "32rem",
        }}
      >
        Something has gone wrong
      </h1>

      <p
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          color: "var(--text-muted)",
          textAlign: "center",
          maxWidth: "28rem",
          margin: 0,
        }}
      >
        {error.message || "An unexpected error interrupted your passage. You may try to retrace your steps."}
      </p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <button
          onClick={() => reset()}
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-primary)",
            background: "linear-gradient(135deg, var(--accent-ember), #a03a28)",
            border: "none",
            padding: "0.85rem 2.25rem",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(200, 75, 17, 0.25)",
          }}
        >
          Try Again
        </button>
        <a
          href="/dashboard"
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            background: "transparent",
            border: "1px solid var(--border-default)",
            padding: "0.85rem 2.25rem",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Return to Hub
        </a>
      </div>

      {error.digest && (
        <p
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            opacity: 0.5,
            marginTop: "1.5rem",
            letterSpacing: "0.1em",
          }}
        >
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
