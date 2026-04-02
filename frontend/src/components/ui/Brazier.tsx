"use client";

import { useState } from "react";

interface BrazierProps {
  embers: { id: string; title: string }[];
  onEmberHover?: (emberId: string | null) => void;
  onAddClick?: () => void;
}

// Deterministic pseudo-random positions seeded by index — consistent between renders
function seededX(i: number): number {
  return ((i * 37 + 11) % 76) + 12; // 12% – 88%
}

function seededY(i: number): number {
  return ((i * 53 + 7) % 60) + 15; // 15% – 75%
}

function seededDelay(i: number): number {
  return ((i * 17 + 3) % 30) / 10; // 0.0 – 3.0s
}

function seededDuration(i: number): number {
  return ((i * 23 + 5) % 20) / 10 + 2.0; // 2.0 – 4.0s
}

function getIntensityClass(count: number): string {
  if (count === 0) return "brazier-cold";
  if (count <= 5) return "brazier-dim";
  if (count <= 15) return "brazier-warm";
  if (count <= 30) return "brazier-hot";
  return "brazier-blazing";
}

function getParticleCount(count: number): number {
  if (count === 0) return 0;
  if (count <= 5) return 4;
  if (count <= 15) return 9;
  if (count <= 30) return 16;
  return 22;
}

export function Brazier({ embers, onEmberHover, onAddClick }: BrazierProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const intensityClass = getIntensityClass(embers.length);
  const particleCount = getParticleCount(embers.length);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
    onEmberHover?.(id);
  };

  return (
    <div className="brazier-wrapper">
      {/* Main vessel bowl */}
      <div className={`brazier-vessel ${intensityClass}`}>
        {/* Fire glow core — radial gradient that animates */}
        <div className={`brazier-fire-core ${intensityClass}`} />

        {/* Rising particles — visual only, count scales with ember density */}
        {Array.from({ length: particleCount }, (_, i) => (
          <div
            key={`particle-${i}`}
            className="brazier-particle"
            style={{
              left: `${seededX(i * 7 + 3)}%`,
              bottom: `${((i * 41 + 9) % 50) + 10}%`,
              animationDelay: `${seededDelay(i * 3)}s`,
              animationDuration: `${seededDuration(i * 2)}s`,
            }}
          />
        ))}

        {/* Ember orbs — float wrapper separates translate from hover scale */}
        {embers.map((ember, i) => {
          const isHovered = hoveredId === ember.id;
          return (
            <div
              key={ember.id}
              className="brazier-ember-float"
              style={{
                left: `${seededX(i)}%`,
                top: `${seededY(i)}%`,
                animationDelay: `${seededDelay(i + 20)}s`,
                animationDuration: `${seededDuration(i + 10)}s`,
              }}
              onMouseEnter={() => handleHover(ember.id)}
              onMouseLeave={() => handleHover(null)}
            >
              <div
                className={`brazier-ember-orb ${intensityClass}${isHovered ? " brazier-ember-orb--hovered" : ""}`}
              >
                {isHovered && (
                  <div className="brazier-tooltip">{ember.title}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Cold / empty state */}
        {embers.length === 0 && (
          <div className="brazier-empty-state">
            <span className="brazier-empty-icon">◈</span>
            <p>Your brazier is cold.</p>
            <p>Add your first ember.</p>
          </div>
        )}
      </div>

      {/* Structural parts */}
      <div className={`brazier-rim ${intensityClass}`} />
      <div className="brazier-stem" />
      <div className="brazier-base" />

      {onAddClick && (
        <button className="brazier-add-btn" onClick={onAddClick}>
          <span>+ Kindle Ember</span>
        </button>
      )}
    </div>
  );
}
