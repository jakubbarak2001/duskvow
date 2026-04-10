"use client";

import { useEffect, useState } from "react";

interface LevelUpModalProps {
  level: number;
  title: string;
  previousTitle: string;
  xpEarned: number;
  onClose: () => void;
}

export function LevelUpModal({
  level,
  title,
  previousTitle,
  xpEarned,
  onClose,
}: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);
  const titleChanged = title !== previousTitle;

  // Trigger entrance animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: visible ? "rgba(10,10,18,0.88)" : "rgba(10,10,18,0)",
        transition: "background-color 0.3s ease",
      }}
      onClick={handleClose}
    >
      {/* Radial ember glow behind content */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: "radial-gradient(ellipse at center, rgba(200,75,17,0.12) 0%, rgba(255,215,0,0.06) 30%, transparent 70%)",
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Content card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          padding: "3.5rem 4rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.92)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.6rem",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          ◆&nbsp;&nbsp;Ascension&nbsp;&nbsp;◆
        </div>

        {/* Level number */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "5rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--accent-gold)",
            textShadow: "0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.2)",
          }}
        >
          {level}
        </div>

        {/* "LEVEL ATTAINED" label */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginTop: "-0.5rem",
          }}
        >
          Level Attained
        </div>

        {/* Title change */}
        {titleChanged && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.3rem",
              marginTop: "0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              You are now known as
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--accent-gold)",
                letterSpacing: "0.1em",
                textShadow: "0 0 20px rgba(255,215,0,0.3)",
              }}
            >
              {title}
            </span>
          </div>
        )}

        {/* XP earned */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "var(--text-muted)",
            marginTop: "0.25rem",
          }}
        >
          +{xpEarned} XP
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: "120px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
            margin: "0.5rem 0",
          }}
        />

        {/* Continue button */}
        <button
          onClick={handleClose}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            padding: "0.8rem 2.5rem",
            borderRadius: "2px",
            cursor: "pointer",
            color: "var(--text-primary)",
            background: "linear-gradient(135deg, var(--accent-ember), #a03a28)",
            border: "1px solid rgba(200,75,17,0.5)",
            transition: "all 0.2s ease",
            boxShadow: "0 0 20px rgba(200,75,17,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 30px rgba(200,75,17,0.4)";
            e.currentTarget.style.borderColor = "rgba(200,75,17,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 20px rgba(200,75,17,0.2)";
            e.currentTarget.style.borderColor = "rgba(200,75,17,0.5)";
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
