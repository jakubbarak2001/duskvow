"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(
  () => import("@/components/auth/AuthForm").then((m) => ({ default: m.AuthForm })),
  { ssr: false },
);

export default function AuthPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-abyss)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
      >
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--accent-gold)",
          }}
        >
          Enter the Realm
        </h1>
        <p
          className="text-center mb-8 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Sign in to forge your path
        </p>

        <AuthForm />
      </div>
    </main>
  );
}
