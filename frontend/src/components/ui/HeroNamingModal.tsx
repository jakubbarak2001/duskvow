"use client";

import { useEffect, useState } from "react";

interface HeroNamingModalProps {
  onSubmit: (name: string) => Promise<void>;
}

const NAME_REGEX = /^[a-zA-Z][a-zA-Z '\-]{0,29}$/;

export function HeroNamingModal({ onSubmit }: HeroNamingModalProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("A name is required.");
      return;
    }
    if (!NAME_REGEX.test(trimmed)) {
      setError("Letters, spaces, hyphens, and apostrophes only.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch {
      setError("Failed to save. Try again.");
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !submitting) {
      handleSubmit();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: visible ? "rgba(10,10,18,0.97)" : "rgba(10,10,18,0)",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "radial-gradient(ellipse at center, rgba(200,75,17,0.10) 0%, rgba(255,215,0,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          padding: "3rem 3.5rem",
          maxWidth: "440px",
          width: "100%",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          ◆&nbsp;&nbsp;Identity&nbsp;&nbsp;◆
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--accent-gold)",
            textAlign: "center",
            letterSpacing: "0.05em",
            lineHeight: 1.2,
            margin: 0,
            textShadow: "0 0 30px rgba(255,215,0,0.3)",
          }}
        >
          What Shall They Call You?
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-crimson)",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Choose the name that will echo through the dark.
        </p>

        {/* Gold divider */}
        <div
          style={{
            width: "100px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.35), transparent)",
          }}
        />

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
          maxLength={30}
          autoFocus
          style={{
            width: "100%",
            padding: "0.85rem 1.2rem",
            fontFamily: "var(--font-heading)",
            fontSize: "1.1rem",
            letterSpacing: "0.05em",
            textAlign: "center",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "2px",
            outline: "none",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(200,75,17,0.6)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(200,75,17,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {/* Error message */}
        {error && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--accent-ember)",
              margin: 0,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* Character count */}
        <span
          style={{
            fontSize: "0.6rem",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginTop: "-0.5rem",
          }}
        >
          {name.length}/30
        </span>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            padding: "0.8rem 2.5rem",
            borderRadius: "2px",
            cursor: submitting || !name.trim() ? "not-allowed" : "pointer",
            color: "var(--text-primary)",
            background: submitting || !name.trim()
              ? "var(--bg-elevated)"
              : "linear-gradient(135deg, var(--accent-ember), #a03a28)",
            border: submitting || !name.trim()
              ? "1px solid var(--border-default)"
              : "1px solid rgba(200,75,17,0.5)",
            transition: "all 0.2s ease",
            opacity: submitting ? 0.6 : 1,
            boxShadow: submitting || !name.trim() ? "none" : "0 0 20px rgba(200,75,17,0.2)",
          }}
        >
          {submitting ? "Sealing..." : "Seal My Name"}
        </button>
      </div>
    </div>
  );
}
