"use client";

const DRIFT_RUNES = ["ᚦ", "ᛁ", "ᛗ", "ᚹ", "ᛟ", "ᚺ", "ᛏ", "ᚾ", "ᛊ", "ᚱ"];

const DRIFT_CONFIGS: { top: string; left: string; size: string; delay: string; dur: string }[] = [
  { top: "10%",  left: "5%",  size: "4rem",  delay: "0s",    dur: "18s" },
  { top: "20%",  left: "85%", size: "3rem",  delay: "3s",    dur: "22s" },
  { top: "55%",  left: "8%",  size: "5rem",  delay: "6s",    dur: "25s" },
  { top: "70%",  left: "78%", size: "3.5rem",delay: "1.5s",  dur: "20s" },
  { top: "40%",  left: "92%", size: "2.5rem",delay: "9s",    dur: "16s" },
  { top: "80%",  left: "18%", size: "4.5rem",delay: "4s",    dur: "28s" },
  { top: "12%",  left: "60%", size: "3rem",  delay: "7.5s",  dur: "21s" },
  { top: "65%",  left: "50%", size: "2rem",  delay: "2s",    dur: "19s" },
  { top: "30%",  left: "30%", size: "3.5rem",delay: "11s",   dur: "24s" },
  { top: "88%",  left: "70%", size: "2.5rem",delay: "5s",    dur: "17s" },
];

export function GeneratingStep() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 1rem",
      }}
    >
      {/* Drifting rune background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {DRIFT_CONFIGS.map((cfg, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: cfg.top,
              left: cfg.left,
              fontSize: cfg.size,
              color: "rgba(200,75,17,0.06)",
              fontFamily: "serif",
              userSelect: "none",
              animation: `wiz-drift ${cfg.dur} ease-in-out ${cfg.delay} infinite`,
              filter: "blur(0.5px)",
            }}
          >
            {DRIFT_RUNES[i % DRIFT_RUNES.length]}
          </span>
        ))}
      </div>

      {/* Radial glow behind the rune */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(200,75,17,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Breathing glow rings */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2.5rem",
          zIndex: 1,
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position:     "absolute",
            width:        156,
            height:       156,
            borderRadius: "50%",
            border:       "1px solid rgba(200,75,17,0.2)",
            animation:    "glow-breathe 3s ease-in-out infinite 0.8s",
          }}
        />

        {/* Mid ring */}
        <div
          style={{
            position:     "absolute",
            width:        118,
            height:       118,
            borderRadius: "50%",
            border:       "1px solid rgba(200,75,17,0.35)",
            animation:    "glow-breathe 3s ease-in-out infinite 0.4s",
          }}
        />

        {/* Inner ring */}
        <div
          style={{
            position:       "relative",
            width:          86,
            height:         86,
            borderRadius:   "50%",
            border:         "2px solid rgba(200,75,17,0.6)",
            animation:      "glow-breathe 3s ease-in-out infinite 0s",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize:   "2rem",
              lineHeight: 1,
              color:      "var(--accent-gold)",
              animation:  "rune-breathe 3s ease-in-out infinite 0s",
              userSelect: "none",
            }}
          >
            ᛟ
          </span>
        </div>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading), 'Cinzel', serif",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700,
          color: "var(--accent-gold)",
          marginBottom: "0.75rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        Weaving Your Fate
      </h2>
      <p style={{ color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
        The Oracle is crafting your personal talent tree…
      </p>
      <p
        className="text-xs mt-2"
        style={{ color: "var(--text-muted)", fontStyle: "italic", position: "relative", zIndex: 1 }}
      >
        This may take up to a minute
      </p>
    </div>
  );
}
