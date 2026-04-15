"use client";

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
          What do you want to achieve? Be specific — the more detail you give,
          the more powerful your talent tree will be.
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
          Your vow becomes the seed from which your talent tree grows.
          The Oracle reads intent — not just words.
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
            <span>{loading ? "Consulting the Oracle…" : "Forge My Path →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
