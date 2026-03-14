"use client";

const RUNES = ["᛭", "ᚱ", "ᚷ", "ᚾ", "ᛏ", "ᛚ", "ᛗ", "ᚠ", "ᚢ", "ᚦ"];

export function GeneratingStep() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      {/* Animated rune ring */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div
          className="w-24 h-24 rounded-full"
          style={{
            border: "2px solid var(--accent-ember)",
            animation: "spin-progress 3s linear infinite",
          }}
        />
        <span
          className="absolute text-3xl"
          style={{ color: "var(--accent-gold)" }}
        >
          ᛟ
        </span>

        {/* Orbiting rune characters */}
        <div
          className="absolute w-32 h-32 rounded-full"
          style={{ animation: "spin-progress 6s linear infinite reverse" }}
        >
          {RUNES.slice(0, 6).map((rune, i) => (
            <span
              key={i}
              className="absolute text-xs"
              style={{
                color: "var(--text-muted)",
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 60}deg) translateY(-64px) rotate(-${i * 60}deg)`,
              }}
            >
              {rune}
            </span>
          ))}
        </div>
      </div>

      <h2
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading)", color: "var(--accent-gold)" }}
      >
        Weaving Your Fate
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        The AI oracle is crafting your personal talent tree…
      </p>
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        This may take up to 30 seconds
      </p>
    </div>
  );
}
