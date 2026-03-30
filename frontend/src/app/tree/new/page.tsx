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

const STEP_META: { id: WizardStep; numeral: string; label: string }[] = [
  { id: "goal",       numeral: "I",   label: "The Vow"     },
  { id: "followup",   numeral: "II",  label: "The Vision"  },
  { id: "generating", numeral: "III", label: "The Weaving" },
];

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

  const currentIndex = STEP_META.findIndex((s) => s.id === step);

  return (
    <div style={{ backgroundColor: "var(--bg-abyss)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Noise overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.45,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Floating ember particles */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10, overflow: "hidden" }}
      >
        {/* 2px small */}
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "12%",  animation: "wiz-float-c 13s linear 0.5s  infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "42%",  animation: "wiz-float-c  8s linear 3.5s  infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 5px 1px rgba(232,101,63,0.5)", left: "81%",  animation: "wiz-float-c 11s linear 6s    infinite", opacity: 0 }} />
        {/* 3px medium */}
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "25%",  animation: "wiz-float-a 10s linear 1s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "60%",  animation: "wiz-float-b  9s linear 4s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 3, height: 3, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 6px 2px rgba(232,101,63,0.6)", left: "88%",  animation: "wiz-float-a 15s linear 2s    infinite", opacity: 0 }} />
        {/* 4px, ember + gold */}
        <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 7px 2px rgba(232,101,63,0.65)", left: "5%",   animation: "wiz-float-b 12s linear 7s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 7px 2px rgba(201,168,76,0.65)", left: "50%",  animation: "wiz-float-a  7s linear 1.5s  infinite", opacity: 0 }} />
        {/* 6px large */}
        <div style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#e8653f", boxShadow: "0 0 10px 3px rgba(232,101,63,0.7)", left: "35%",  animation: "wiz-float-a 17s linear 0s    infinite", opacity: 0 }} />
        <div style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", boxShadow: "0 0 10px 3px rgba(201,168,76,0.7)", left: "72%",  animation: "wiz-float-b 14s linear 5s    infinite", opacity: 0 }} />
      </div>

      {/* Radial ember glow centered */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(200,75,17,0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16" style={{ position: "relative", zIndex: 2 }}>

        {/* Ornamental step indicator */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-start">
            {STEP_META.map((s, i) => {
              const active = s.id === step;
              const done  = i < currentIndex;
              return (
                <div key={s.id} className="flex items-start">
                  <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading), 'Cinzel', serif",
                        fontSize: "1.75rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: done
                          ? "var(--accent-gold)"
                          : active
                          ? "rgba(200,75,17,0.85)"
                          : "rgba(200,75,17,0.2)",
                        transition: "color 0.4s ease",
                      }}
                    >
                      {s.numeral}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-heading), 'Cinzel', serif",
                        fontSize: "0.5rem",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        marginTop: "0.35rem",
                        color: done
                          ? "rgba(255,215,0,0.7)"
                          : active
                          ? "var(--text-secondary)"
                          : "var(--text-muted)",
                        transition: "color 0.4s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      style={{
                        width: 40,
                        height: 1,
                        marginTop: "0.85rem",
                        marginLeft: "0.5rem",
                        marginRight: "0.5rem",
                        background: done
                          ? "linear-gradient(90deg, var(--accent-gold), rgba(200,75,17,0.35))"
                          : "var(--border-default)",
                        transition: "background 0.4s ease",
                      }}
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
              of {genStatus.generations_limit} today
            </p>
          )}
        </div>

        {/* Gold gradient divider */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(138,115,64,0.6), transparent)",
            marginBottom: "3rem",
          }}
        />

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
