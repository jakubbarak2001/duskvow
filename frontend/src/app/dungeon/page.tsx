"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";

type TimerMode = "continuous" | "single";
type TimerPhase = "idle" | "work" | "break" | "complete";

const WORK_PRESETS = [25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];

const buttonBase: React.CSSProperties = {
  fontFamily: "var(--font-cinzel)",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  padding: "0.6rem 1.5rem",
  borderRadius: "2px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonBase,
  color: "var(--accent-ember)",
  background: "rgba(200,75,17,0.15)",
  border: "1px solid rgba(200,75,17,0.35)",
};

const pauseButtonStyle: React.CSSProperties = {
  ...buttonBase,
  color: "var(--accent-gold)",
  background: "rgba(255,215,0,0.1)",
  border: "1px solid rgba(255,215,0,0.25)",
};

const stopButtonStyle: React.CSSProperties = {
  ...buttonBase,
  color: "var(--text-muted)",
  background: "rgba(20,18,28,0.7)",
  border: "1px solid rgba(224,216,200,0.1)",
};

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

  // Hover states for primary button
  const [primaryHover, setPrimaryHover] = useState(false);

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

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);

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

  const getHourglassOpacity = (): number => {
    if (phase === "idle") return 0.4;
    if (phase === "work") return 0.9;
    if (phase === "break") return 0.3;
    return 1.0; // complete
  };

  const getPhaseLabel = (): { text: string; color: string } => {
    if (phase === "work") return { text: "Delving...", color: "var(--accent-ember)" };
    if (phase === "break") return { text: "Resting at Campfire", color: "var(--accent-gold)" };
    if (phase === "complete") return { text: "The Dungeon Yields", color: "var(--accent-gold)" };
    return { text: "", color: "var(--text-muted)" };
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

  const phaseLabel = getPhaseLabel();

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
          background: "linear-gradient(rgba(10,10,18,0.60), rgba(10,10,18,0.75))",
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
          {/* Hourglass image — opacity changes with phase */}
          <Image
            src="/images/dungeon_card.webp"
            alt="Dungeon Hourglass"
            width={300}
            height={300}
            style={{
              maxHeight: "300px",
              objectFit: "contain",
              opacity: getHourglassOpacity(),
              transition: "opacity 0.8s ease",
            }}
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

          {/* ── Timer UI ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              width: "100%",
              maxWidth: "420px",
            }}
          >

            {/* ── Mode selector (idle only) ── */}
            {phase === "idle" && (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setMode("continuous")}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: mode === "continuous" ? "var(--accent-ember)" : "var(--text-muted)",
                    border: mode === "continuous"
                      ? "1px solid rgba(200,75,17,0.5)"
                      : "1px solid var(--border-default)",
                    background: mode === "continuous"
                      ? "rgba(200,75,17,0.15)"
                      : "transparent",
                  }}
                >
                  Endless Delve
                </button>
                <button
                  onClick={() => setMode("single")}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: mode === "single" ? "var(--accent-ember)" : "var(--text-muted)",
                    border: mode === "single"
                      ? "1px solid rgba(200,75,17,0.5)"
                      : "1px solid var(--border-default)",
                    background: mode === "single"
                      ? "rgba(200,75,17,0.15)"
                      : "transparent",
                  }}
                >
                  Timed Raid
                </button>
              </div>
            )}

            {/* ── Time configuration (idle only) ── */}
            {phase === "idle" && mode === "continuous" && (
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  alignItems: "flex-start",
                }}
              >
                {/* Battle (work) input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                  <label
                    style={{
                      fontFamily: "var(--font-crimson)",
                      fontStyle: "italic",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Battle
                  </label>
                  <input
                    type="number"
                    value={workMinutes}
                    min={1}
                    onChange={(e) => setWorkMinutes(Number(e.target.value))}
                    style={{
                      width: "4rem",
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "2px",
                      padding: "0.35rem 0.5rem",
                      fontFamily: "var(--font-cinzel)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-ember)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
                  />
                  {/* Work presets */}
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {WORK_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setWorkMinutes(p)}
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.1em",
                          padding: "0.25rem 0.45rem",
                          borderRadius: "2px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          color: workMinutes === p ? "var(--accent-ember)" : "var(--text-muted)",
                          border: workMinutes === p
                            ? "1px solid rgba(200,75,17,0.5)"
                            : "1px solid var(--border-default)",
                          background: workMinutes === p ? "rgba(200,75,17,0.15)" : "transparent",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rest (break) input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                  <label
                    style={{
                      fontFamily: "var(--font-crimson)",
                      fontStyle: "italic",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Rest
                  </label>
                  <input
                    type="number"
                    value={breakMinutes}
                    min={1}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    style={{
                      width: "4rem",
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "2px",
                      padding: "0.35rem 0.5rem",
                      fontFamily: "var(--font-cinzel)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      outline: "none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-ember)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
                  />
                  {/* Break presets */}
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {BREAK_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setBreakMinutes(p)}
                        style={{
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.1em",
                          padding: "0.25rem 0.45rem",
                          borderRadius: "2px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          color: breakMinutes === p ? "var(--accent-ember)" : "var(--text-muted)",
                          border: breakMinutes === p
                            ? "1px solid rgba(200,75,17,0.5)"
                            : "1px solid var(--border-default)",
                          background: breakMinutes === p ? "rgba(200,75,17,0.15)" : "transparent",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === "idle" && mode === "single" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                <label
                  style={{
                    fontFamily: "var(--font-crimson)",
                    fontStyle: "italic",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Delve Duration
                </label>
                <input
                  type="number"
                  value={singleMinutes}
                  min={1}
                  onChange={(e) => setSingleMinutes(Number(e.target.value))}
                  style={{
                    width: "4rem",
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "2px",
                    padding: "0.35rem 0.5rem",
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "0.85rem",
                    textAlign: "center",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-ember)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
                />
                {/* Single mode presets */}
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  {WORK_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSingleMinutes(p)}
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.1em",
                        padding: "0.25rem 0.45rem",
                        borderRadius: "2px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        color: singleMinutes === p ? "var(--accent-ember)" : "var(--text-muted)",
                        border: singleMinutes === p
                          ? "1px solid rgba(200,75,17,0.5)"
                          : "1px solid var(--border-default)",
                        background: singleMinutes === p ? "rgba(200,75,17,0.15)" : "transparent",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Timer display (non-idle phases) ── */}
            {phase !== "idle" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <p
                  className={isRunning ? "dungeon-pulse" : ""}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "4rem",
                    color: "var(--text-primary)",
                    letterSpacing: "0.1em",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {formatTime(secondsLeft)}
                </p>

                <p
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: phaseLabel.color,
                    margin: 0,
                  }}
                >
                  {phaseLabel.text}
                </p>

                {mode === "continuous" && cycleCount > 0 && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-cinzel)",
                      letterSpacing: "0.1em",
                      margin: 0,
                    }}
                  >
                    Cycle {cycleCount}
                  </p>
                )}
              </div>
            )}

            {/* ── Control buttons ── */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              {/* Idle: Venture Forth */}
              {phase === "idle" && (
                <button
                  onClick={handleStart}
                  onMouseEnter={() => setPrimaryHover(true)}
                  onMouseLeave={() => setPrimaryHover(false)}
                  style={{
                    ...primaryButtonStyle,
                    ...(primaryHover
                      ? {
                          background: "rgba(200,75,17,0.28)",
                          borderColor: "rgba(200,75,17,0.7)",
                          boxShadow: "0 0 12px rgba(200,75,17,0.3)",
                        }
                      : {}),
                  }}
                >
                  Venture Forth
                </button>
              )}

              {/* Running: Hold Position + Retreat */}
              {isRunning && (
                <>
                  <button onClick={handlePause} style={pauseButtonStyle}>
                    Hold Position
                  </button>
                  <button onClick={handleStop} style={stopButtonStyle}>
                    Retreat
                  </button>
                </>
              )}

              {/* Paused: Press Onward + Retreat */}
              {!isRunning && phase !== "idle" && phase !== "complete" && (
                <>
                  <button
                    onClick={handleResume}
                    onMouseEnter={() => setPrimaryHover(true)}
                    onMouseLeave={() => setPrimaryHover(false)}
                    style={{
                      ...primaryButtonStyle,
                      ...(primaryHover
                        ? {
                            background: "rgba(200,75,17,0.28)",
                            borderColor: "rgba(200,75,17,0.7)",
                            boxShadow: "0 0 12px rgba(200,75,17,0.3)",
                          }
                        : {}),
                    }}
                  >
                    Press Onward
                  </button>
                  <button onClick={handleStop} style={stopButtonStyle}>
                    Retreat
                  </button>
                </>
              )}

              {/* Complete: Delve Again */}
              {phase === "complete" && (
                <button
                  onClick={handleStop}
                  onMouseEnter={() => setPrimaryHover(true)}
                  onMouseLeave={() => setPrimaryHover(false)}
                  style={{
                    ...primaryButtonStyle,
                    ...(primaryHover
                      ? {
                          background: "rgba(200,75,17,0.28)",
                          borderColor: "rgba(200,75,17,0.7)",
                          boxShadow: "0 0 12px rgba(200,75,17,0.3)",
                        }
                      : {}),
                  }}
                >
                  Delve Again
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
