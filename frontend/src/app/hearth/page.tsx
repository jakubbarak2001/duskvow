"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Navbar } from "@/components/layout/Navbar";
import { Brazier } from "@/components/ui/Brazier";
import { AddEmberForm } from "@/components/ui/AddEmberForm";
import { api } from "@/lib/api";
import type { Ember } from "@/types";

const EMBER_CAP = 50;

const PARTICLES = [
  { left: "6%",  delay: "0s",   dur: "10s",  anim: "wiz-float-a", size: 3 },
  { left: "18%", delay: "2s",   dur: "13s",  anim: "wiz-float-b", size: 2 },
  { left: "32%", delay: "5s",   dur: "9s",   anim: "wiz-float-c", size: 3 },
  { left: "48%", delay: "1s",   dur: "11s",  anim: "wiz-float-a", size: 2 },
  { left: "63%", delay: "3.5s", dur: "14s",  anim: "wiz-float-b", size: 3 },
  { left: "77%", delay: "7s",   dur: "10s",  anim: "wiz-float-c", size: 2 },
  { left: "89%", delay: "4s",   dur: "12s",  anim: "wiz-float-a", size: 2 },
  { left: "42%", delay: "9s",   dur: "16s",  anim: "wiz-float-b", size: 3 },
];

export default function HearthPage() {
  const { user, session, loading } = useUser();
  const router = useRouter();

  const [embers, setEmbers] = useState<Ember[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [animatingEmberId, setAnimatingEmberId] = useState<string | null>(null);
  const [confirmDeleteEmberId, setConfirmDeleteEmberId] = useState<string | null>(null);
  const [deletingEmber, setDeletingEmber] = useState(false);
  const [addingEmber, setAddingEmber] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!session?.access_token) return;
    api.listEmbers(session.access_token).then((res) => {
      if (!res.error && res.data) setEmbers(res.data);
      setDataLoading(false);
    });
  }, [session]);

  const handleAddEmber = async ({ title, description }: { title: string; description: string }) => {
    if (!session?.access_token) return;
    setAddingEmber(true);
    const res = await api.createEmber(title, description || null, session.access_token);
    setAddingEmber(false);
    if (!res.error && res.data) {
      setEmbers((prev) => [res.data!, ...prev]);
      setAnimatingEmberId(res.data.id);
      setShowAddForm(false);
      setTimeout(() => setAnimatingEmberId(null), 1500);
    }
  };

  const handleDeleteEmberConfirm = async () => {
    if (!session?.access_token || !confirmDeleteEmberId) return;
    setDeletingEmber(true);
    const res = await api.deleteEmber(confirmDeleteEmberId, session.access_token);
    setDeletingEmber(false);
    if (!res.error) {
      setEmbers((prev) => prev.filter((e) => e.id !== confirmDeleteEmberId));
      setConfirmDeleteEmberId(null);
    }
  };

  if (loading || (!user && loading)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-abyss)",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-abyss)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Noise overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: 'url("/noise.png")',
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Warmer radial glow — hearth feels cozier than the hub */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(200,75,17,0.13) 0%, rgba(200,75,17,0.05) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Secondary warm glow — bottom up, like firelight */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background:
            "radial-gradient(ellipse at bottom, rgba(180,60,10,0.1) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Ember particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: p.left,
            bottom: "-5%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: "var(--accent-ember)",
            opacity: 0,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <main
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem 6rem",
          }}
        >
          {/* Back link */}
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontFamily: "var(--font-heading)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: "0.75rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ← Return to Hub
          </Link>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              lineHeight: 1.1,
              marginBottom: "0.4rem",
            }}
          >
            The Hearth
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              marginBottom: "3rem",
            }}
          >
            Your sanctum. Your fire.
          </p>

          {/* Gold gradient divider */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(138,115,64,0.4), transparent)",
              marginBottom: "3rem",
            }}
          />

          {/* Brazier — centered */}
          {!dataLoading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "2.5rem",
              }}
            >
              <Brazier
                embers={embers}
                animatingEmberId={animatingEmberId}
                onDropComplete={() => setAnimatingEmberId(null)}
                onAddClick={embers.length < EMBER_CAP ? () => setShowAddForm((v) => !v) : undefined}
                onDeleteRequest={(id) => setConfirmDeleteEmberId(id)}
              />

              {embers.length >= EMBER_CAP && (
                <p
                  style={{
                    color: "var(--text-muted)",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    marginTop: "0.75rem",
                  }}
                >
                  Your brazier holds {EMBER_CAP} embers — extinguish one to kindle another.
                </p>
              )}
            </div>
          )}

          {/* Add ember form */}
          {showAddForm && embers.length < EMBER_CAP && (
            <div
              style={{
                maxWidth: "520px",
                margin: "0 auto 2.5rem",
              }}
            >
              {addingEmber ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    padding: "1.5rem 0",
                  }}
                >
                  Kindling…
                </p>
              ) : (
                <AddEmberForm
                  onSubmit={handleAddEmber}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </div>
          )}

          {/* Coming soon banner */}
          <div
            style={{
              border: "1px solid rgba(138,115,64,0.2)",
              borderRadius: "6px",
              padding: "1.75rem 2rem",
              backgroundColor: "var(--bg-shadow)",
              boxShadow: "0 0 40px rgba(200,75,17,0.04), inset 0 0 30px rgba(0,0,0,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at center, rgba(200,75,17,0.05) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                ◆&nbsp;&nbsp;Coming Soon&nbsp;&nbsp;◆
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                }}
              >
                Your sanctum grows. Trophy room, character customization, and more — forging soon.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Ember delete confirm dialog */}
      {confirmDeleteEmberId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10,10,18,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-shadow)",
              border: "1px solid rgba(139,0,0,0.4)",
              borderRadius: "6px",
              padding: "2rem 2.5rem",
              maxWidth: "360px",
              width: "90%",
              boxShadow: "0 0 40px rgba(139,0,0,0.15), 0 8px 32px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.75rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                marginBottom: "0.6rem",
              }}
            >
              ◆ Confirm ◆
            </p>
            <p
              style={{
                color: "var(--text-primary)",
                marginBottom: "1.75rem",
                lineHeight: 1.5,
              }}
            >
              Extinguish this ember?
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={handleDeleteEmberConfirm}
                disabled={deletingEmber}
                style={{
                  padding: "0.55rem 1.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  backgroundColor: "rgba(139,0,0,0.35)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--accent-blood)",
                  cursor: deletingEmber ? "not-allowed" : "pointer",
                  opacity: deletingEmber ? 0.5 : 1,
                }}
              >
                {deletingEmber ? "Extinguishing…" : "Extinguish"}
              </button>
              <button
                onClick={() => setConfirmDeleteEmberId(null)}
                disabled={deletingEmber}
                style={{
                  padding: "0.55rem 1.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-default)",
                  cursor: "pointer",
                }}
              >
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
