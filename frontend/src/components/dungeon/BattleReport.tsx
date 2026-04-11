"use client";

import { useState } from "react";
import type { DungeonCompleteResult, DungeonEvent } from "@/types";
import { api } from "@/lib/api";
import { useAchievementToast } from "@/components/ui/AchievementProvider";

interface BattleReportProps {
  result: DungeonCompleteResult;
  events: DungeonEvent[];
  durationMinutes: number;
  runId: string;
  token: string;
  onDelveAgain: () => void;
  onReturnToHub: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
};

const ITEM_RARITY: Record<string, string> = {
  scroll_of_clarity: "uncommon",
  ember_shard: "rare",
  shadowsteel_fragment: "rare",
  heros_ration: "common",
  rune_of_focus: "epic",
  ashen_token: "common",
};

export function BattleReport({
  result,
  events,
  durationMinutes,
  runId,
  token,
  onDelveAgain,
  onReturnToHub,
}: BattleReportProps) {
  const [showLog, setShowLog] = useState(false);
  const [delveHover, setDelveHover] = useState(false);
  const [hubHover, setHubHover] = useState(false);
  const [lootClaimed, setLootClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { showAchievements } = useAchievementToast();

  const isCompleted = result.status === "completed";
  const fullClear = result.cleared_floors === result.total_floors;

  // Compute stats
  const monstersDefeated = events
    .filter((e) => e.floor_number <= result.cleared_floors)
    .reduce((sum, e) => sum + e.monsters_defeated, 0);

  // Visible events (up to cleared floors for retreats)
  const visibleEvents = events.filter(
    (e) => e.floor_number <= result.cleared_floors,
  );

  const handleClaimLoot = async () => {
    if (claiming || lootClaimed) return;
    setClaiming(true);
    const res = await api.claimLoot(runId, token);
    setClaiming(false);
    if (res.data) {
      setLootClaimed(true);
      if (res.data.new_achievements?.length) {
        showAchievements(res.data.new_achievements);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "520px",
        padding: "2rem 1.5rem",
        background: "rgba(18,18,26,0.9)",
        border: `1px solid ${isCompleted ? "rgba(255,215,0,0.25)" : "rgba(139,0,0,0.25)"}`,
        borderRadius: "6px",
        boxShadow: isCompleted
          ? "0 0 40px rgba(255,215,0,0.06)"
          : "0 0 40px rgba(139,0,0,0.06)",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "1.4rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isCompleted ? "var(--accent-gold)" : "var(--accent-blood)",
            margin: 0,
            textShadow: isCompleted
              ? "0 0 20px rgba(255,215,0,0.3)"
              : "0 0 20px rgba(139,0,0,0.3)",
          }}
        >
          {isCompleted ? "The Dungeon Yields" : "Forced Retreat"}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-crimson)",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            margin: "0.5rem 0 0 0",
          }}
        >
          {isCompleted
            ? "Your hero emerges victorious, bearing the spoils of the deep."
            : "Your hero returns wounded. The darkness claims what was left behind."}
        </p>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: "80%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${isCompleted ? "rgba(255,215,0,0.25)" : "rgba(139,0,0,0.25)"}, transparent)`,
        }}
      />

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          width: "100%",
        }}
      >
        <StatItem
          label="Floors Cleared"
          value={`${result.cleared_floors} / ${result.total_floors}`}
          color={fullClear ? "var(--accent-gold)" : "var(--accent-ember)"}
        />
        <StatItem
          label="Monsters Slain"
          value={String(monstersDefeated)}
          color="var(--accent-ember)"
        />
        <StatItem
          label="Time Spent"
          value={`${durationMinutes}m`}
          color="var(--text-secondary)"
        />
        <StatItem
          label="XP Earned"
          value={`+${result.xp_earned}`}
          color="var(--accent-gold)"
          glow
        />
      </div>

      {/* XP bonus breakdown */}
      {result.xp_earned > 0 && (
        <p
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            margin: 0,
            textAlign: "center",
          }}
        >
          {result.streak_bonus_xp > 0 ? (
            <>
              +{result.base_xp} XP{" "}
              <span style={{ color: "var(--accent-ember)" }}>
                (+{result.streak_bonus_xp} streak bonus)
              </span>
            </>
          ) : (
            <>Total XP: {result.total_xp}</>
          )}
        </p>
      )}

      {/* ── Quest Completion ── */}
      {result.quest_auto_completed && result.linked_quest_id && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1rem",
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: "4px",
            width: "100%",
          }}
        >
          <span style={{ color: "var(--accent-gold)", fontSize: "1rem" }}>
            &#10003;
          </span>
          <span
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              color: "var(--accent-gold)",
            }}
          >
            Daily Quest Fulfilled
          </span>
        </div>
      )}

      {/* ── Loot Section ── */}
      <div style={{ width: "100%", textAlign: "center" }}>
        <h3
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.75rem 0",
          }}
        >
          Spoils
        </h3>

        {result.loot.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-crimson)",
              fontStyle: "italic",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              margin: 0,
            }}
          >
            No loot recovered.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            {result.loot.map((item, i) => {
              const rarity = ITEM_RARITY[item.item_type] ?? "common";
              const color = RARITY_COLORS[rarity] ?? "var(--text-secondary)";
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(10,10,18,0.5)",
                    border: `1px solid ${color}33`,
                    borderRadius: "3px",
                    textAlign: "left",
                    animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
                  }}
                >
                  {/* Rarity pip */}
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      flexShrink: 0,
                      marginTop: "4px",
                      boxShadow: `0 0 6px ${color}66`,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-cinzel)",
                        fontSize: "0.75rem",
                        color: color,
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.item_name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        margin: "0.1rem 0 0 0",
                      }}
                    >
                      {item.effect}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Collect All button */}
        {result.loot.length > 0 && (
          <button
            onClick={handleClaimLoot}
            disabled={claiming || lootClaimed}
            style={{
              marginTop: "0.75rem",
              fontFamily: "var(--font-cinzel)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.5rem 1.5rem",
              borderRadius: "2px",
              cursor: claiming || lootClaimed ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              color: lootClaimed ? "var(--accent-gold)" : "var(--text-primary)",
              background: lootClaimed
                ? "rgba(255,215,0,0.08)"
                : "rgba(255,215,0,0.12)",
              border: lootClaimed
                ? "1px solid rgba(255,215,0,0.3)"
                : "1px solid rgba(255,215,0,0.2)",
              opacity: claiming ? 0.5 : 1,
            }}
          >
            {lootClaimed ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                <span style={{ color: "var(--accent-gold)" }}>&#10003;</span>
                Collected!
              </span>
            ) : claiming ? (
              "Claiming..."
            ) : (
              "Collect All"
            )}
          </button>
        )}
      </div>

      {/* ── Battle Log (expandable) ── */}
      <div style={{ width: "100%" }}>
        <button
          onClick={() => setShowLog(!showLog)}
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem 0",
            transition: "color 0.2s",
            width: "100%",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {showLog ? "Hide Battle Log" : "View Battle Log"}
        </button>

        {showLog && (
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              padding: "0.5rem",
              marginTop: "0.5rem",
              background: "rgba(10,10,18,0.5)",
              border: "1px solid var(--border-default)",
              borderRadius: "3px",
            }}
          >
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                  padding: "0.25rem 0",
                  borderBottom: "1px solid rgba(224,216,200,0.04)",
                }}
              >
                <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>
                  {event.event_type === "combat"
                    ? "\u2694"
                    : event.event_type === "boss"
                      ? "\u{1F480}"
                      : event.event_type === "discovery"
                        ? "\u2728"
                        : event.event_type === "trap"
                          ? "\u26A0"
                          : "\u{1F6E1}"}
                </span>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      fontSize: "0.65rem",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    F{event.floor_number}: {event.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-crimson)",
                      fontStyle: "italic",
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      margin: "0.1rem 0 0 0",
                      lineHeight: 1.3,
                    }}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: "60%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(224,216,200,0.1), transparent)",
        }}
      />

      {/* ── Actions ── */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onDelveAgain}
          onMouseEnter={() => setDelveHover(true)}
          onMouseLeave={() => setDelveHover(false)}
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "0.6rem 1.8rem",
            borderRadius: "2px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: "var(--accent-ember)",
            background: delveHover
              ? "rgba(200,75,17,0.28)"
              : "rgba(200,75,17,0.15)",
            border: delveHover
              ? "1px solid rgba(200,75,17,0.7)"
              : "1px solid rgba(200,75,17,0.35)",
            boxShadow: delveHover
              ? "0 0 12px rgba(200,75,17,0.3)"
              : "none",
          }}
        >
          Delve Again
        </button>
        <button
          onClick={onReturnToHub}
          onMouseEnter={() => setHubHover(true)}
          onMouseLeave={() => setHubHover(false)}
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "0.6rem 1.8rem",
            borderRadius: "2px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: "var(--text-muted)",
            background: hubHover
              ? "rgba(20,18,28,0.9)"
              : "rgba(20,18,28,0.7)",
            border: hubHover
              ? "1px solid rgba(224,216,200,0.2)"
              : "1px solid rgba(224,216,200,0.1)",
          }}
        >
          Return to Hub
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatItem
// ---------------------------------------------------------------------------

function StatItem({
  label,
  value,
  color,
  glow,
}: {
  label: string;
  value: string;
  color: string;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.2rem",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: "0.55rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: "1.1rem",
          fontWeight: 600,
          color,
          textShadow: glow ? `0 0 12px ${color}66` : "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}
