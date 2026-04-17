"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, type AuthMode } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

function resolveMode(raw: string | null): AuthMode {
  if (raw === "signup") return "signup";
  if (raw === "forgot") return "forgot";
  return "signin";
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = resolveMode(searchParams.get("mode"));

  const setMode = useCallback(
    (next: AuthMode) => {
      const target = next === "signin" ? "/auth" : `/auth?mode=${next}`;
      router.replace(target);
    },
    [router],
  );

  return (
    <main style={shellStyle}>
      <div style={bgImageStyle} aria-hidden="true" />
      <div style={overlayStyle} aria-hidden="true" />
      <div style={noiseOverlayStyle} aria-hidden="true" />
      <EmberParticles />

      <AuthCard mode={mode} onModeChange={(m) => setMode(m)}>
        {mode === "signin" && (
          <LoginForm
            onForgot={() => setMode("forgot")}
            onSwitchToSignUp={() => setMode("signup")}
          />
        )}
        {mode === "signup" && (
          <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
        )}
        {mode === "forgot" && (
          <ForgotPasswordForm onCancel={() => setMode("signin")} />
        )}
      </AuthCard>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}

// ---------- Ambient chrome (bg image, overlay, embers) ----------

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--bg-abyss)",
  position: "relative",
  overflow: "hidden",
  padding: "2rem 1rem",
};

const bgImageStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundImage: 'url("/hero_bg.webp")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 0,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(10,10,18,0.78) 0%, rgba(10,10,18,0.65) 40%, rgba(10,10,18,0.9) 100%)",
  zIndex: 1,
};

const noiseOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
  opacity: 0.45,
  pointerEvents: "none",
  zIndex: 9999,
};

const PARTICLE_POSITIONS: Array<{
  left: string;
  size: number;
  delay: string;
  dur: string;
  anim: string;
  color: string;
}> = [
  { left: "6%",  size: 2, delay: "0s",   dur: "14s", anim: "wiz-float-c", color: "#e8653f" },
  { left: "14%", size: 3, delay: "5s",   dur: "10s", anim: "wiz-float-a", color: "#e8653f" },
  { left: "24%", size: 2, delay: "2s",   dur: "12s", anim: "wiz-float-b", color: "#e8653f" },
  { left: "33%", size: 4, delay: "7s",   dur: "16s", anim: "wiz-float-a", color: "#e8653f" },
  { left: "44%", size: 3, delay: "3s",   dur: "9s",  anim: "wiz-float-b", color: "#e8653f" },
  { left: "52%", size: 6, delay: "1s",   dur: "18s", anim: "wiz-float-a", color: "#c9a84c" },
  { left: "62%", size: 2, delay: "6s",   dur: "13s", anim: "wiz-float-c", color: "#e8653f" },
  { left: "71%", size: 4, delay: "4s",   dur: "11s", anim: "wiz-float-b", color: "#c9a84c" },
  { left: "80%", size: 3, delay: "8s",   dur: "15s", anim: "wiz-float-a", color: "#e8653f" },
  { left: "89%", size: 6, delay: "2.5s", dur: "17s", anim: "wiz-float-b", color: "#e8653f" },
  { left: "95%", size: 2, delay: "9s",   dur: "10s", anim: "wiz-float-c", color: "#c9a84c" },
];

function EmberParticles() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      {PARTICLE_POSITIONS.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            bottom: "-5%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size + 4}px ${Math.max(
              1,
              Math.floor(p.size / 2),
            )}px ${p.color}80`,
            opacity: 0,
            animationName: p.anim,
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
