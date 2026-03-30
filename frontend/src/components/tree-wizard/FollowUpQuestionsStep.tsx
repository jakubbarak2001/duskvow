"use client";

import { useState } from "react";
import type { FollowUpQuestion } from "@/types";

interface FollowUpQuestionsStepProps {
  questions: FollowUpQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  loading: boolean;
}

export function FollowUpQuestionsStep({
  questions,
  onSubmit,
  loading,
}: FollowUpQuestionsStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const allAnswered = questions.every((q) => answers[q.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allAnswered) onSubmit(answers);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eyebrow label */}
      <p
        style={{
          fontFamily: "var(--font-heading), 'Cinzel', serif",
          fontSize: "0.7rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "var(--accent-ember)",
          marginBottom: "1.25rem",
        }}
      >
        ◆ &nbsp; Choose Your Path &nbsp; ◆
      </p>

      <h2
        style={{
          fontFamily: "var(--font-heading), 'Cinzel', serif",
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          fontWeight: 900,
          lineHeight: 1.15,
          color: "var(--accent-gold)",
          marginBottom: "0.75rem",
        }}
      >
        Sharpen Your Vision
      </h2>
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "3rem",
          fontSize: "1rem",
          lineHeight: 1.8,
          fontStyle: "italic",
        }}
      >
        Each answer shapes the branches of your tree. Choose wisely.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p
              style={{
                fontFamily: "var(--font-heading), 'Cinzel', serif",
                fontSize: "0.9rem",
                letterSpacing: "0.04em",
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              {idx + 1}. {q.text}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {q.options.map((option) => {
                const selected = answers[q.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                    className={`wiz-option-card p-4 rounded-lg text-sm${selected ? " wiz-option-selected" : ""}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!allAnswered || loading}
            className="wiz-btn-primary"
          >
            <span>{loading ? "Weaving your fate…" : "Generate My Tree →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
