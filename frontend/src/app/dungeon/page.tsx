"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

export default function DungeonPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

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
        backgroundImage: 'url("/images/dungeon_background.webp")',
        backgroundColor: "var(--bg-abyss)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(rgba(10,10,18,0.60), rgba(10,10,18,0.75))",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />

        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 80px)",
            gap: "1.5rem",
            padding: "2rem 1.5rem",
          }}
        >
          <Image
            src="/images/dungeon_card.webp"
            alt="Dungeon Hourglass"
            width={300}
            height={300}
            style={{ maxHeight: "300px", objectFit: "contain", opacity: 0.6 }}
          />

          <h1
            style={{
              fontFamily: "var(--font-cinzel)",
              color: "var(--text-primary)",
              fontSize: "1.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
              textAlign: "center",
            }}
          >
            The Dungeon Awaits
          </h1>

          <p
            style={{
              fontFamily: "var(--font-crimson)",
              fontStyle: "italic",
              color: "var(--text-secondary)",
              margin: 0,
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            Steel your mind. Forge your focus.
          </p>
        </main>
      </div>
    </div>
  );
}
