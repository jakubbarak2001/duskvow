"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

type TimerMode = "continuous" | "single";
type TimerPhase = "idle" | "work" | "break" | "complete";

export default function DungeonPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [mode, setMode] = useState<TimerMode>("continuous");
  const [workMinutes, setWorkMinutes] = useState(45);
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [singleMinutes, setSingleMinutes] = useState(60);
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to avoid stale closures in the interval callback
  const phaseRef = useRef<TimerPhase>("idle");
  const modeRef = useRef<TimerMode>("continuous");
  const workMinutesRef = useRef(45);
  const breakMinutesRef = useRef(15);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { workMinutesRef.current = workMinutes; }, [workMinutes]);
  useEffect(() => { breakMinutesRef.current = breakMinutes; }, [breakMinutes]);

  const handlePhaseEnd = () => {
    const currentPhase = phaseRef.current;
    const currentMode = modeRef.current;

    if (currentMode === "continuous") {
      if (currentPhase === "work") {
        phaseRef.current = "break";
        setPhase("break");
        setSecondsLeft(breakMinutesRef.current * 60);
        setCycleCount((prev) => prev + 1);
      } else if (currentPhase === "break") {
        phaseRef.current = "work";
        setPhase("work");
        setSecondsLeft(workMinutesRef.current * 60);
      }
    } else {
      // single mode
      if (currentPhase === "work") {
        phaseRef.current = "complete";
        setPhase("complete");
        setIsRunning(false);
      }
    }
  };

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handlePhaseEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    const initialSeconds =
      mode === "continuous" ? workMinutes * 60 : singleMinutes * 60;
    setSecondsLeft(initialSeconds);
    phaseRef.current = "work";
    setPhase("work");
    setIsRunning(true);
    setCycleCount(0);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    phaseRef.current = "idle";
    setPhase("idle");
    setSecondsLeft(0);
    setCycleCount(0);
  };

  const formatTime = (totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
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

          {/* Timer placeholder — full UI in Task 4A-4 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              color: "var(--text-primary)",
            }}
          >
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setMode("continuous")}
                style={{
                  background:
                    mode === "continuous"
                      ? "var(--accent-ember)"
                      : "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "none",
                  padding: "0.4rem 0.9rem",
                  cursor: "pointer",
                }}
              >
                Continuous
              </button>
              <button
                onClick={() => setMode("single")}
                style={{
                  background:
                    mode === "single"
                      ? "var(--accent-ember)"
                      : "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "none",
                  padding: "0.4rem 0.9rem",
                  cursor: "pointer",
                }}
              >
                Single Delve
              </button>
            </div>

            <p style={{ fontSize: "3rem", fontFamily: "monospace", margin: 0 }}>
              {formatTime(secondsLeft)}
            </p>

            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Phase: {phase}
              {phase === "work" || phase === "break"
                ? ` | Cycles: ${cycleCount}`
                : ""}
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {phase === "idle" && (
                <button
                  onClick={handleStart}
                  style={{
                    background: "var(--accent-ember)",
                    color: "var(--text-primary)",
                    border: "none",
                    padding: "0.4rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Start
                </button>
              )}
              {isRunning && (
                <button
                  onClick={handlePause}
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "none",
                    padding: "0.4rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Pause
                </button>
              )}
              {!isRunning && phase !== "idle" && phase !== "complete" && (
                <button
                  onClick={handleResume}
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "none",
                    padding: "0.4rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Resume
                </button>
              )}
              {phase !== "idle" && (
                <button
                  onClick={handleStop}
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "none",
                    padding: "0.4rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Stop
                </button>
              )}
            </div>

            {mode === "continuous" && phase === "idle" && (
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <label>
                  Work (min):
                  <input
                    type="number"
                    value={workMinutes}
                    min={1}
                    onChange={(e) => setWorkMinutes(Number(e.target.value))}
                    style={{ width: "3.5rem", marginLeft: "0.4rem", background: "var(--bg-elevated)", color: "var(--text-primary)", border: "none", padding: "0.2rem" }}
                  />
                </label>
                <label>
                  Break (min):
                  <input
                    type="number"
                    value={breakMinutes}
                    min={1}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    style={{ width: "3.5rem", marginLeft: "0.4rem", background: "var(--bg-elevated)", color: "var(--text-primary)", border: "none", padding: "0.2rem" }}
                  />
                </label>
              </div>
            )}

            {mode === "single" && phase === "idle" && (
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Duration (min):
                <input
                  type="number"
                  value={singleMinutes}
                  min={1}
                  onChange={(e) => setSingleMinutes(Number(e.target.value))}
                  style={{ width: "3.5rem", marginLeft: "0.4rem", background: "var(--bg-elevated)", color: "var(--text-primary)", border: "none", padding: "0.2rem" }}
                />
              </label>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
