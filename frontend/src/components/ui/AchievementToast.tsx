"use client";

import { useEffect, useState } from "react";
import type { Achievement } from "@/types";

const ICON_MAP: Record<string, string> = {
  scroll: "◆",
  shield: "⛊",
  sword: "⚔",
  flame: "✦",
  road: "═",
  chest: "⬡",
  abyss: "◈",
  mountain: "▲",
  crown: "♔",
  star: "✦",
};

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  variant?: "achievement" | "streak";
}

export function AchievementToast({ achievement, onDismiss, variant = "achievement" }: AchievementToastProps) {
  const isStreak = variant === "streak";
  const accentColor = isStreak ? "var(--accent-ember)" : "var(--accent-gold)";
  const glowRgba = isStreak ? "rgba(200,75,17," : "rgba(255,215,0,";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setVisible(true));
    const autoDismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, 5000);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(autoDismiss);
    };
  }, [onDismiss]);

  const handleClick = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  const icon = ICON_MAP[achievement.icon] ?? "◆";

  return (
    <div
      data-sound="achievement-unlock"
      onClick={handleClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "1rem 1.25rem",
        backgroundColor: "rgba(18,18,26,0.95)",
        border: `1px solid ${glowRgba}0.3)`,
        borderRadius: "4px",
        boxShadow: `0 0 20px ${glowRgba}0.1), 0 4px 20px rgba(0,0,0,0.5)`,
        cursor: "pointer",
        minWidth: "280px",
        maxWidth: "380px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: `2px solid ${accentColor}`,
          backgroundColor: `${glowRgba}0.08)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "1.1rem",
          color: accentColor,
          textShadow: `0 0 8px ${glowRgba}0.4)`,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: accentColor,
            letterSpacing: "0.08em",
            lineHeight: 1.2,
          }}
        >
          {achievement.name}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            lineHeight: 1.3,
          }}
        >
          {achievement.description}
        </span>
      </div>
    </div>
  );
}
