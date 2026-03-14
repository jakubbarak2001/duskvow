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
      <h2
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
      >
        Sharpen Your Vision
      </h2>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        Answer these questions to forge a more powerful talent tree.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p
              className="text-sm font-medium mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {idx + 1}. {q.text}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((option) => {
                const selected = answers[q.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                    className="p-3 rounded-lg text-sm text-left transition-all"
                    style={{
                      backgroundColor: selected
                        ? "rgba(200, 75, 17, 0.2)"
                        : "var(--bg-elevated)",
                      border: selected
                        ? "1px solid var(--accent-ember)"
                        : "1px solid var(--border-default)",
                      color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={!allAnswered || loading}
          className="self-end px-6 py-2 rounded font-medium text-sm transition-opacity"
          style={{
            backgroundColor: "var(--accent-ember)",
            color: "var(--text-primary)",
            opacity: !allAnswered || loading ? 0.5 : 1,
            cursor: !allAnswered || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Weaving your fate…" : "Generate My Tree →"}
        </button>
      </form>
    </div>
  );
}
