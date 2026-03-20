"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Navbar } from "@/components/layout/Navbar";
import { GoalInputStep } from "@/components/tree-wizard/GoalInputStep";
import { FollowUpQuestionsStep } from "@/components/tree-wizard/FollowUpQuestionsStep";
import { GeneratingStep } from "@/components/tree-wizard/GeneratingStep";
import { api } from "@/lib/api";
import type { FollowUpQuestion, GenerationStatus } from "@/types";

type WizardStep = "goal" | "followup" | "generating";

export default function TreeNewPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>("goal");
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<GenerationStatus | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    api.getGenerationStatus(session.access_token).then((res) => {
      if (res.data) setGenStatus(res.data);
    });
  }, [session]);

  const handleGoalSubmit = async (goal: string) => {
    if (!session?.access_token) return;
    setSubmitting(true);
    setError(null);

    const res = await api.generateTree(goal, session.access_token);
    setSubmitting(false);

    if (res.error || !res.data) {
      setError(res.error?.message ?? "Failed to generate questions. Please try again.");
      return;
    }

    setSessionId(res.data.session_id);
    setQuestions(res.data.questions);
    setStep("followup");
  };

  const handleFollowUpSubmit = async (answers: Record<string, string>) => {
    if (!session?.access_token) return;
    setSubmitting(true);
    setError(null);
    setStep("generating");

    const res = await api.submitFollowUp(sessionId, answers, session.access_token);
    setSubmitting(false);

    if (res.error || !res.data) {
      setError(res.error?.message ?? "Generation failed. Please try again.");
      setStep("followup");
      return;
    }

    router.push(`/tree/${res.data.tree.id}`);
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-abyss)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Step indicator + generation count */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            {(["goal", "followup", "generating"] as const).map((s, i) => {
              const active = s === step;
              const done =
                (step === "followup" && i === 0) ||
                (step === "generating" && i <= 1);
              return (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: done
                        ? "var(--accent-gold)"
                        : active
                          ? "var(--accent-ember)"
                          : "var(--bg-elevated)",
                      color: done || active ? "var(--bg-abyss)" : "var(--text-muted)",
                      border: active ? "2px solid var(--accent-ember)" : "none",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className="w-8 h-px"
                      style={{ backgroundColor: "var(--border-default)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {genStatus && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                style={{
                  color:
                    genStatus.generations_remaining === 0
                      ? "var(--accent-blood)"
                      : genStatus.generations_remaining === 1
                        ? "var(--accent-ember)"
                        : "var(--text-secondary)",
                }}
              >
                {genStatus.generations_remaining}
              </span>{" "}
              of {genStatus.generations_limit} generations remaining today
            </p>
          )}
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(139, 0, 0, 0.2)",
              border: "1px solid var(--accent-blood)",
              color: "var(--text-primary)",
            }}
          >
            {error}
          </div>
        )}

        {step === "goal" && (
          <GoalInputStep onSubmit={handleGoalSubmit} loading={submitting} />
        )}
        {step === "followup" && (
          <FollowUpQuestionsStep
            questions={questions}
            onSubmit={handleFollowUpSubmit}
            loading={submitting}
          />
        )}
        {step === "generating" && <GeneratingStep />}
      </main>
    </div>
  );
}
