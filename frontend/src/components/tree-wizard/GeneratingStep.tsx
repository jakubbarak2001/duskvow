"use client";

export function GeneratingStep() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">

      {/* Breathing glow rings */}
      <div className="relative inline-flex items-center justify-center mb-10">

        {/* Outer ring — trails the pulse */}
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

        {/* Mid ring — slight lag */}
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

        {/* Inner ring — leads the pulse */}
        <div
          style={{
            position:        "relative",
            width:           86,
            height:          86,
            borderRadius:    "50%",
            border:          "2px solid rgba(200,75,17,0.6)",
            animation:       "glow-breathe 3s ease-in-out infinite 0s",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}
        >
          <span
            style={{
              fontSize:  "2rem",
              lineHeight: 1,
              color:     "var(--accent-gold)",
              animation: "rune-breathe 3s ease-in-out infinite 0s",
              userSelect: "none",
            }}
          >
            ᛟ
          </span>
        </div>
      </div>

      <h2
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
      >
        Weaving Your Fate
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        The Oracle is crafting your personal talent tree…
      </p>
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        This may take up to 30 seconds
      </p>
    </div>
  );
}
