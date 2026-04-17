"use client";

import Link from "next/link";
import { useState } from "react";

interface GoalInputStepProps {
  onSubmit: (goal: string) => void;
  loading: boolean;
}

export function GoalInputStep({ onSubmit, loading }: GoalInputStepProps) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim().length >= 5) onSubmit(goal.trim());
  };

  const canSubmit = goal.trim().length >= 5 && !loading;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Intro block — eyebrow / headline / lede.
          Wrapped in .wiz-step-intro so the mobile media query can center it
          without affecting the form below. */}
      <div className="wiz-step-intro">
        {/* Eyebrow label */}
        <p
          className="wiz-step-eyebrow"
          style={{
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "0.7rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--accent-ember)",
            marginBottom: "1.25rem",
          }}
        >
          ◆ &nbsp; Speak Your Ambition &nbsp; ◆
        </p>

        <h1
          className="wiz-step-title"
          style={{
            fontFamily: "var(--font-heading), 'Cinzel', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        >
          Make Your Vow
        </h1>

        <p
          className="wiz-step-body"
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2.5rem",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            maxWidth: 520,
          }}
        >
          Tell us what you&apos;re reaching for. The more you tell us, the
          truer the path we draw.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. I want to learn Python programming from scratch and build my first web app within 3 months…"
          rows={5}
          maxLength={1000}
          className="wiz-textarea w-full p-5 rounded-lg resize-none text-sm leading-relaxed"
        />

        {/* Atmospheric note */}
        <p
          style={{
            fontStyle: "italic",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
          }}
        >
          Your vow is the seed. We read intent — not just the words on the
          page.
        </p>

        {/* Gemini data-handling disclosure — complies with GDPR layered-consent
            best practice. Signup has the one-time agreement; this is the point-
            of-use reminder. */}
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Your goal text is processed by Google Gemini to generate your tree;
          it is not used for AI training.{" "}
          <Link
            href="/privacy#ai"
            target="_blank"
            style={{
              color: "var(--accent-gold)",
              textDecoration: "underline",
              textDecorationColor: "rgba(255,215,0,0.3)",
            }}
          >
            Details
          </Link>
          .
        </p>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {goal.length} / 1000
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="wiz-btn-primary"
          >
            <span>{loading ? "Reading your vow…" : "Speak the Vow →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
