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

  return (
    <div className="max-w-2xl mx-auto">
      <h1
        className="text-4xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
      >
        Make Your Vow
      </h1>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        What do you want to achieve? Be specific — the more detail you give, the
        better your talent tree will be.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. I want to learn Python programming from scratch"
          rows={4}
          maxLength={1000}
          className="w-full p-4 rounded-lg resize-none text-sm"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent-ember)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-default)")
          }
        />

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {goal.length}/1000
          </span>
          <button
            type="submit"
            disabled={goal.trim().length < 5 || loading}
            className="px-6 py-2 rounded font-medium text-sm transition-opacity"
            style={{
              backgroundColor: "var(--accent-ember)",
              color: "var(--text-primary)",
              opacity: goal.trim().length < 5 || loading ? 0.5 : 1,
              cursor: goal.trim().length < 5 || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Consulting the Oracle…" : "Forge My Path →"}
          </button>
        </div>
      </form>
    </div>
  );
}
