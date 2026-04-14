"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must render <html> and <body> because it replaces the root layout on error.
 * Styling is inlined (no globals.css) because the error may have prevented
 * Tailwind/tokens from loading.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0A0A12",
          color: "#E0D8C8",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#8B0000",
            fontFamily: "'Cinzel', serif",
            margin: 0,
          }}
        >
          ◆ All is dark ◆
        </p>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 400,
            letterSpacing: "0.05em",
            margin: "1.5rem 0 1rem",
            fontFamily: "'Cinzel', serif",
            color: "#E0D8C8",
            maxWidth: "32rem",
          }}
        >
          Duskvow has encountered a fatal error
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: "#6B6358",
            maxWidth: "28rem",
            margin: "0 0 2rem",
          }}
        >
          {error.message || "The application could not recover from an unexpected failure. A reload may restore it."}
        </p>

        <button
          onClick={() => reset()}
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#E0D8C8",
            background: "linear-gradient(135deg, #C84B11, #a03a28)",
            border: "none",
            padding: "0.85rem 2.25rem",
            cursor: "pointer",
            fontFamily: "'Cinzel', serif",
            boxShadow: "0 0 20px rgba(200, 75, 17, 0.3)",
          }}
        >
          Reload
        </button>

        {error.digest && (
          <p
            style={{
              fontSize: "0.65rem",
              color: "#6B6358",
              opacity: 0.5,
              marginTop: "1.5rem",
              letterSpacing: "0.1em",
            }}
          >
            ref: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
