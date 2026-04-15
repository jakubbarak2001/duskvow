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
  const [freetextOpen, setFreetextOpen] = useState<Record<string, boolean>>({});
  const [freetextValues, setFreetextValues] = useState<Record<string, string>>({});

  const allAnswered = questions.every((q) => {
    if (freetextOpen[q.id]) {
      return (freetextValues[q.id] ?? "").trim().length >= 3;
    }
    return !!answers[q.id];
  });

  const handleSelectOption = (qId: string, option: string) => {
    setFreetextOpen((prev) => ({ ...prev, [qId]: false }));
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleToggleFreetext = (qId: string) => {
    const opening = !freetextOpen[qId];
    setFreetextOpen((prev) => ({ ...prev, [qId]: opening }));
    if (opening) {
      // Clear predefined selection for this question
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  const handleFreetextChange = (qId: string, value: string) => {
    setFreetextValues((prev) => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;

    // Merge freetext answers into answers record
    const finalAnswers: Record<string, string> = { ...answers };
    for (const q of questions) {
      if (freetextOpen[q.id]) {
        finalAnswers[q.id] = (freetextValues[q.id] ?? "").trim();
      }
    }
    onSubmit(finalAnswers);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Intro block — wrapped in .wiz-step-intro so mobile can center it
          without affecting the question list below. */}
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
          ◆ &nbsp; Choose Your Path &nbsp; ◆
        </p>

        <h2
          className="wiz-step-title"
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
          className="wiz-step-body"
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
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {questions.map((q, idx) => {
          const isFreetextOpen = !!freetextOpen[q.id];
          const freetextVal = freetextValues[q.id] ?? "";
          const freetextValid = freetextVal.trim().length >= 3;

          return (
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
                  const selected = !isFreetextOpen && answers[q.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`wiz-option-card p-4 rounded-lg text-sm${selected ? " wiz-option-selected" : ""}`}
                    >
                      {option}
                    </button>
                  );
                })}

                {/* Something else button */}
                <button
                  type="button"
                  onClick={() => handleToggleFreetext(q.id)}
                  className={`wiz-option-card p-4 rounded-lg text-sm${isFreetextOpen ? " wiz-option-selected" : ""}`}
                  style={{
                    borderStyle: "dashed",
                    color: isFreetextOpen ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  Something else…
                </button>
              </div>

              {/* Freetext input — expands when "Something else" is selected */}
              {isFreetextOpen && (
                <div style={{ marginTop: "0.75rem" }}>
                  <input
                    type="text"
                    value={freetextVal}
                    onChange={(e) => handleFreetextChange(q.id, e.target.value)}
                    placeholder="Describe your answer…"
                    maxLength={200}
                    autoFocus
                    className="wiz-freetext-input"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "var(--bg-shadow)",
                      color: "var(--text-primary)",
                      border: `1px solid ${freetextValid ? "var(--accent-ember)" : "var(--border-default)"}`,
                      outline: "none",
                      fontSize: "0.9rem",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.2s",
                    }}
                  />
                  {freetextVal.length > 0 && !freetextValid && (
                    <p
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      At least 3 characters required.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

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
