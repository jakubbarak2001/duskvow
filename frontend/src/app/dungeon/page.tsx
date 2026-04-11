"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Navbar } from "@/components/layout/Navbar";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { useAchievementToast } from "@/components/ui/AchievementProvider";
import { BattleReport } from "@/components/dungeon/BattleReport";
import { api } from "@/lib/api";
import type {
  DungeonTier,
  DungeonRun,
  DungeonEvent,
  DungeonCompleteResult,
  TalentTree,
  DailyQuest,
  SkillNode,
} from "@/types";

const DURATION_PRESETS = [25, 45, 60];

function titleForLevel(level: number): string {
  if (level >= 50) return "Vow Eternal";
  if (level >= 40) return "Mythbreaker";
  if (level >= 30) return "Shadowforged";
  if (level >= 20) return "Duskwalker";
  if (level >= 15) return "Flamewarden";
  if (level >= 10) return "Ironsworn";
  if (level >= 5) return "Oath-Bound";
  return "Wanderer";
}

export default function DungeonPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-abyss)" }}
        >
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      }
    >
      <DungeonPageInner />
    </Suspense>
  );
}

function DungeonPageInner() {
  const { user, session, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAchievements, showStreakMilestone } = useAchievementToast();

  // Data
  const [tiers, setTiers] = useState<DungeonTier[]>([]);
  const [activeRun, setActiveRun] = useState<DungeonRun | null>(null);
  const [trees, setTrees] = useState<TalentTree[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Selection state
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [linkedNodeId, setLinkedNodeId] = useState<string | null>(null);
  const [linkedQuestId, setLinkedQuestId] = useState<string | null>(null);

  // UI state
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{
    result: DungeonCompleteResult;
    events: DungeonEvent[];
    durationMinutes: number;
    runId: string;
  } | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<{
    level: number;
    title: string;
    previousTitle: string;
    xpEarned: number;
  } | null>(null);

  // Active run timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [revealedEvents, setRevealedEvents] = useState<DungeonEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-fill from query params (quest-to-dungeon flow)
  useEffect(() => {
    if (dataLoading || activeRun) return;

    const questId = searchParams.get("quest");
    const duration = searchParams.get("duration");

    if (questId) {
      setLinkedQuestId(questId);
    }
    if (duration) {
      const mins = parseInt(duration, 10);
      if (mins >= 15 && mins <= 120) {
        setDurationMinutes(mins);
      }
    }

    // Auto-select highest unlocked tier
    if (questId && tiers.length > 0 && !selectedTier) {
      const unlocked = tiers.filter((t) => t.unlocked);
      if (unlocked.length > 0) {
        setSelectedTier(unlocked[unlocked.length - 1].key);
      }
    }
  }, [dataLoading, activeRun, searchParams, tiers, selectedTier]);

  // Auth redirect
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  // Load data on mount
  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    Promise.allSettled([
      api.getDungeonTiers(token),
      api.getActiveDungeon(token),
      api.listTrees(token),
      api.getTodayQuests(token),
    ]).then(([tiersRes, activeRes, treesRes, questsRes]) => {
      if (tiersRes.status === "fulfilled" && tiersRes.value.data)
        setTiers(tiersRes.value.data);
      if (activeRes.status === "fulfilled" && activeRes.value.data)
        setActiveRun(activeRes.value.data);
      if (treesRes.status === "fulfilled" && treesRes.value.data)
        setTrees(treesRes.value.data);
      if (questsRes.status === "fulfilled" && questsRes.value.data)
        setQuests(questsRes.value.data);
      setDataLoading(false);
    });
  }, [session]);

  // Track whether we already fired a notification for this run
  const notifiedRef = useRef(false);

  // Timer for active run
  const computeTimerState = useCallback(() => {
    if (!activeRun) return;
    const startedAt = new Date(activeRun.created_at).getTime();
    const endAt = startedAt + activeRun.duration_minutes * 60 * 1000;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endAt - now) / 1000));
    setSecondsLeft(remaining);

    if (activeRun.events) {
      const elapsed = Math.floor((now - startedAt) / 1000);
      const visible = activeRun.events.filter(
        (e) => e.trigger_at_seconds <= elapsed,
      );
      setRevealedEvents(visible);
    }

    // Fire browser notification when timer completes (only once, only if tab hidden)
    if (remaining === 0 && !notifiedRef.current && document.hidden) {
      notifiedRef.current = true;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("The Dungeon Yields", {
          body: "Your hero has returned. Collect your spoils.",
        });
      }
    }
  }, [activeRun]);

  useEffect(() => {
    if (!activeRun) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    computeTimerState();
    intervalRef.current = setInterval(computeTimerState, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeRun, computeTimerState]);

  // Page visibility handling — recalculate timer when user returns to tab
  useEffect(() => {
    if (!activeRun) return;

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        computeTimerState();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeRun, computeTimerState]);

  // Auto-complete if timer finished while away
  useEffect(() => {
    if (!activeRun || !session?.access_token) return;
    if (secondsLeft === 0 && activeRun.status === "active") {
      const startedAt = new Date(activeRun.created_at).getTime();
      const endAt = startedAt + activeRun.duration_minutes * 60 * 1000;
      if (Date.now() >= endAt) {
        // Timer should have completed — don't auto-complete, let user click "Claim Victory"
        // This gives them the satisfaction of seeing the events and clicking the button
      }
    }
  }, [activeRun, secondsLeft, session]);

  const handleStart = useCallback(async () => {
    if (!session?.access_token || !selectedTier) return;
    setStarting(true);
    setError(null);

    const res = await api.startDungeon(
      selectedTier,
      durationMinutes,
      linkedNodeId,
      linkedQuestId,
      session.access_token,
    );

    setStarting(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      notifiedRef.current = false;
      setActiveRun({
        ...res.data,
        events: res.data.events,
      });

      // Request notification permission for timer completion
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [session, selectedTier, durationMinutes, linkedNodeId, linkedQuestId]);

  const handleComplete = useCallback(async () => {
    if (!session?.access_token || !activeRun) return;
    const res = await api.completeDungeon(session.access_token);
    if (res.data) {
      const runEvents = activeRun.events ?? [];
      const runDuration = activeRun.duration_minutes;
      const completedRunId = activeRun.id;
      setActiveRun(null);
      setReportData({
        result: res.data,
        events: runEvents,
        durationMinutes: runDuration,
        runId: completedRunId,
      });
      if (res.data.leveled_up) {
        setLevelUpEvent({
          level: res.data.new_level,
          title: res.data.new_title,
          previousTitle: titleForLevel(res.data.previous_level),
          xpEarned: res.data.xp_earned,
        });
      }
      if (res.data.new_achievements?.length) {
        showAchievements(res.data.new_achievements);
      }
      if (res.data.streak_milestone) {
        showStreakMilestone(res.data.streak_milestone);
      }
    }
  }, [session, activeRun, showAchievements, showStreakMilestone]);

  const handleRetreat = useCallback(async () => {
    if (!session?.access_token || !activeRun) return;
    const res = await api.retreatDungeon(session.access_token);
    if (res.data) {
      const runEvents = activeRun.events ?? [];
      const runDuration = activeRun.duration_minutes;
      const retreatedRunId = activeRun.id;
      setActiveRun(null);
      setReportData({
        result: res.data,
        events: runEvents,
        durationMinutes: runDuration,
        runId: retreatedRunId,
      });
      if (res.data.leveled_up) {
        setLevelUpEvent({
          level: res.data.new_level,
          title: res.data.new_title,
          previousTitle: titleForLevel(res.data.previous_level),
          xpEarned: res.data.xp_earned,
        });
      }
    }
  }, [session, activeRun]);

  const handleDelveAgain = useCallback(() => {
    // Keep last tier selected, clear report
    setReportData(null);
  }, []);

  const handleReturnToHub = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const formatTime = (totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || (!user && loading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-abyss)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  // Gather linkable nodes from active trees
  const linkableNodes: Array<{ node: SkillNode; treeName: string }> = [];
  for (const tree of trees) {
    if (tree.status !== "active" || !tree.nodes) continue;
    for (const node of tree.nodes) {
      if (node.state === "available" || node.state === "in_progress") {
        linkableNodes.push({ node, treeName: tree.title });
      }
    }
  }

  // Uncompleted quests for today
  const uncompletedQuests = quests.filter((q) => !q.completed_today);

  // XP bonus display
  const nodeBonus = linkedNodeId ? 20 : 0;
  const questBonus = linkedQuestId ? 15 : 0;
  const totalBonus = nodeBonus + questBonus;

  // Selected tier info
  const selectedTierInfo = tiers.find((t) => t.key === selectedTier);

  // Estimated XP preview (mirrors backend compute_xp_reward logic)
  const estimatedXp = (() => {
    if (!selectedTierInfo) return 0;
    const base = selectedTierInfo.base_xp;
    // Duration multiplier: baseline 25 min = 1.0x, scales to 2.0x at 90+ min
    const baseline = 25;
    const cap = 2.0;
    let durMult = 1.0;
    if (durationMinutes > baseline) {
      durMult = Math.min(1.0 + (durationMinutes - baseline) / (90 - baseline), cap);
    }
    let xp = base * durMult;
    if (linkedNodeId) xp *= 1.20;
    if (linkedQuestId) xp *= 1.15;
    return Math.floor(xp);
  })();

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
            minHeight: "calc(100vh - 80px)",
            gap: "1.5rem",
            padding: "2rem 1.5rem",
          }}
        >
          {/* Return to Hub link */}
          <Link
            href="/dashboard"
            style={{
              fontFamily: "var(--font-cinzel)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              textDecoration: "none",
              alignSelf: "flex-start",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            ← Return to Hub
          </Link>

          {reportData ? (
            /* ════════════ BATTLE REPORT STATE ════════════ */
            <BattleReport
              result={reportData.result}
              events={reportData.events}
              durationMinutes={reportData.durationMinutes}
              runId={reportData.runId}
              token={session?.access_token ?? ""}
              onDelveAgain={handleDelveAgain}
              onReturnToHub={handleReturnToHub}
            />
          ) : activeRun ? (
            /* ════════════ ACTIVE RUN STATE ════════════ */
            <ActiveRunView
              run={activeRun}
              secondsLeft={secondsLeft}
              revealedEvents={revealedEvents}
              formatTime={formatTime}
              onComplete={handleComplete}
              onRetreat={handleRetreat}
              timerDone={secondsLeft <= 0}
            />
          ) : (
            /* ════════════ IDLE / PRE-DELVE STATE ════════════ */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem",
                width: "100%",
                maxWidth: "720px",
              }}
            >
              {/* Page title */}
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    color: "var(--text-primary)",
                    fontSize: "1.8rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  The Dungeon Awaits
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-crimson)",
                    fontStyle: "italic",
                    color: "var(--text-secondary)",
                    margin: "0.5rem 0 0 0",
                    fontSize: "1.1rem",
                  }}
                >
                  Choose your descent. Steel your mind.
                </p>
              </div>

              {dataLoading ? (
                <p style={{ color: "var(--text-muted)" }}>
                  Scouting the depths...
                </p>
              ) : (
                <>
                  {/* ── Tier Selection Cards ── */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "0.75rem",
                      width: "100%",
                    }}
                  >
                    {tiers.map((tier) => (
                      <TierCard
                        key={tier.key}
                        tier={tier}
                        selected={selectedTier === tier.key}
                        onSelect={() => {
                          if (tier.unlocked) {
                            setSelectedTier(
                              selectedTier === tier.key ? null : tier.key,
                            );
                          }
                        }}
                      />
                    ))}
                  </div>

                  {/* ── Duration Selector ── */}
                  {selectedTier && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                        width: "100%",
                      }}
                    >
                      <label
                        style={{
                          fontFamily: "var(--font-crimson)",
                          fontStyle: "italic",
                          color: "var(--text-secondary)",
                          fontSize: "1rem",
                        }}
                      >
                        Delve Duration
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {DURATION_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setDurationMinutes(preset)}
                            style={{
                              fontFamily: "var(--font-cinzel)",
                              fontSize: "0.65rem",
                              letterSpacing: "0.12em",
                              padding: "0.5rem 1.2rem",
                              borderRadius: "2px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              color:
                                durationMinutes === preset
                                  ? "var(--accent-ember)"
                                  : "var(--text-muted)",
                              border:
                                durationMinutes === preset
                                  ? "1px solid rgba(200,75,17,0.5)"
                                  : "1px solid var(--border-default)",
                              background:
                                durationMinutes === preset
                                  ? "rgba(200,75,17,0.15)"
                                  : "transparent",
                            }}
                          >
                            {preset} min
                          </button>
                        ))}
                      </div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.7rem",
                          margin: 0,
                        }}
                      >
                        Longer delves yield more XP and loot
                      </p>
                    </div>
                  )}

                  {/* ── Link to Tree Node (Optional) ── */}
                  {selectedTier && linkableNodes.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        width: "100%",
                        maxWidth: "400px",
                      }}
                    >
                      <label
                        style={{
                          fontFamily: "var(--font-crimson)",
                          fontStyle: "italic",
                          color: "var(--text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        What are you working on?
                      </label>
                      <select
                        value={linkedNodeId ?? ""}
                        onChange={(e) =>
                          setLinkedNodeId(e.target.value || null)
                        }
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "2px",
                          padding: "0.5rem 0.75rem",
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "0.7rem",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">None</option>
                        {linkableNodes.map(({ node, treeName }) => (
                          <option key={node.id} value={node.id}>
                            {treeName} → {node.title}
                          </option>
                        ))}
                      </select>
                      {linkedNodeId && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--accent-gold)",
                            fontFamily: "var(--font-cinzel)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          +20% XP bonus
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Link to Daily Quest (Optional) ── */}
                  {selectedTier && uncompletedQuests.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        width: "100%",
                        maxWidth: "400px",
                      }}
                    >
                      <label
                        style={{
                          fontFamily: "var(--font-crimson)",
                          fontStyle: "italic",
                          color: "var(--text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        Fulfill a quest?
                      </label>
                      <select
                        value={linkedQuestId ?? ""}
                        onChange={(e) =>
                          setLinkedQuestId(e.target.value || null)
                        }
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "2px",
                          padding: "0.5rem 0.75rem",
                          fontFamily: "var(--font-cinzel)",
                          fontSize: "0.7rem",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">None</option>
                        {uncompletedQuests.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title} (+{q.xp_reward} XP)
                          </option>
                        ))}
                      </select>
                      {linkedQuestId && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--accent-gold)",
                            fontFamily: "var(--font-cinzel)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          +15% XP bonus — auto-completes quest on dungeon
                          completion
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Error message ── */}
                  {error && (
                    <p
                      style={{
                        color: "var(--accent-blood)",
                        fontSize: "0.8rem",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  {/* ── Venture Forth Button ── */}
                  {selectedTier && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--accent-gold)",
                          fontFamily: "var(--font-cinzel)",
                          letterSpacing: "0.1em",
                          textShadow: "0 0 10px rgba(255,215,0,0.25)",
                        }}
                      >
                        ~{estimatedXp} XP
                      </span>
                      {totalBonus > 0 && (
                        <span
                          style={{
                            fontSize: "0.6rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-cinzel)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          includes +{totalBonus}% bonus
                        </span>
                      )}
                      <VentureForthButton
                        disabled={starting || !selectedTier}
                        loading={starting}
                        onClick={handleStart}
                        tierName={selectedTierInfo?.name ?? ""}
                        floors={selectedTierInfo?.floors ?? 0}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {levelUpEvent && (
        <LevelUpModal
          level={levelUpEvent.level}
          title={levelUpEvent.title}
          previousTitle={levelUpEvent.previousTitle}
          xpEarned={levelUpEvent.xpEarned}
          onClose={() => setLevelUpEvent(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierCard
// ---------------------------------------------------------------------------

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: DungeonTier;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const locked = !tier.unlocked;

  const borderColor = locked
    ? "rgba(128,128,128,0.2)"
    : selected
      ? "rgba(255,215,0,0.6)"
      : hover
        ? "rgba(200,75,17,0.5)"
        : "rgba(200,75,17,0.25)";

  const bgColor = locked
    ? "rgba(18,18,26,0.6)"
    : selected
      ? "rgba(255,215,0,0.06)"
      : "rgba(18,18,26,0.8)";

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={locked}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: "1rem",
        borderRadius: "4px",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.4 : 1,
        transition: "all 0.2s ease",
        textAlign: "left",
        transform: selected ? "scale(1.02)" : "scale(1)",
        boxShadow: selected ? "0 0 20px rgba(255,215,0,0.1)" : "none",
      }}
    >
      {/* Tier name */}
      <h3
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          color: locked
            ? "var(--text-muted)"
            : selected
              ? "var(--accent-gold)"
              : "var(--text-primary)",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {tier.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-crimson)",
          fontStyle: "italic",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {tier.description}
      </p>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.25rem",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-cinzel)",
            letterSpacing: "0.1em",
          }}
        >
          {tier.floors} floors · {tier.base_xp} XP
        </span>
        {locked && (
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--accent-blood)",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.1em",
              display: "flex",
              alignItems: "center",
              gap: "0.3em",
            }}
          >
            <span style={{ fontSize: "0.55rem" }}>&#x1F512;</span>
            Unlocks at Lv.{tier.min_level}
          </span>
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// VentureForthButton
// ---------------------------------------------------------------------------

function VentureForthButton({
  disabled,
  loading,
  onClick,
  tierName,
  floors,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  tierName: string;
  floors: number;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-cinzel)",
        fontSize: "0.7rem",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        padding: "0.75rem 2.5rem",
        borderRadius: "2px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        color: disabled ? "var(--text-muted)" : "var(--accent-ember)",
        background:
          hover && !disabled
            ? "rgba(200,75,17,0.28)"
            : "rgba(200,75,17,0.15)",
        border:
          hover && !disabled
            ? "1px solid rgba(200,75,17,0.7)"
            : "1px solid rgba(200,75,17,0.35)",
        boxShadow:
          hover && !disabled ? "0 0 16px rgba(200,75,17,0.3)" : "none",
        opacity: disabled ? 0.5 : 1,
      }}
      title={tierName ? `Enter ${tierName} (${floors} floors)` : ""}
      data-sound="dungeon-start"
    >
      {loading ? "Descending..." : "Venture Forth"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ActiveRunView — Timer + event log during an active dungeon run
// ---------------------------------------------------------------------------

function ActiveRunView({
  run,
  secondsLeft,
  revealedEvents,
  formatTime,
  onComplete,
  onRetreat,
  timerDone,
}: {
  run: DungeonRun;
  secondsLeft: number;
  revealedEvents: DungeonEvent[];
  formatTime: (s: number) => string;
  onComplete: () => void;
  onRetreat: () => void;
  timerDone: boolean;
}) {
  const [completeHover, setCompleteHover] = useState(false);
  const [retreatHover, setRetreatHover] = useState(false);
  const [confirmRetreat, setConfirmRetreat] = useState(false);
  const eventLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll event log to bottom
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [revealedEvents.length]);

  const eventIcon = (type: DungeonEvent["event_type"]) => {
    switch (type) {
      case "combat":
        return "\u2694";
      case "boss":
        return "\u{1F480}";
      case "discovery":
        return "\u2728";
      case "trap":
        return "\u26A0";
      case "rest":
        return "\u{1F6E1}";
      default:
        return "\u25C6";
    }
  };

  const eventColor = (type: DungeonEvent["event_type"]) => {
    switch (type) {
      case "combat":
        return "var(--accent-ember)";
      case "boss":
        return "var(--accent-blood)";
      case "discovery":
        return "var(--accent-gold)";
      case "trap":
        return "var(--accent-ember)";
      case "rest":
        return "var(--state-available)";
      default:
        return "var(--text-secondary)";
    }
  };

  // Floor progress: count unique floors in revealed events
  const currentFloor = revealedEvents.length > 0
    ? Math.max(...revealedEvents.map((e) => e.floor_number))
    : 0;

  // Tier name mapping
  const tierNames: Record<string, string> = {
    shallow_crypts: "The Shallow Crypts",
    ember_mines: "The Ember Mines",
    hollow_deep: "The Hollow Deep",
    abyssal_rift: "The Abyssal Rift",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        width: "100%",
        maxWidth: "520px",
      }}
    >
      {/* Tier name */}
      <p
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: 0,
        }}
      >
        {tierNames[run.tier] ?? run.tier}
      </p>

      {/* Floor progress bar */}
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            gap: "3px",
            width: "100%",
            height: "6px",
          }}
        >
          {Array.from({ length: run.total_floors }, (_, i) => {
            const floorNum = i + 1;
            const cleared = floorNum <= currentFloor;
            const isCurrent = floorNum === currentFloor;
            return (
              <div
                key={floorNum}
                className={isCurrent && !timerDone ? "dungeon-pulse" : ""}
                style={{
                  flex: 1,
                  borderRadius: "2px",
                  backgroundColor: cleared
                    ? "var(--accent-gold)"
                    : "var(--bg-highlight)",
                  boxShadow: cleared
                    ? "0 0 6px rgba(255,215,0,0.3)"
                    : "none",
                  transition: "background-color 0.5s ease, box-shadow 0.5s ease",
                }}
              />
            );
          })}
        </div>
        <p
          style={{
            fontFamily: "var(--font-cinzel)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            margin: "0.35rem 0 0 0",
            textAlign: "center",
          }}
        >
          Floor {Math.min(currentFloor, run.total_floors)} of{" "}
          {run.total_floors}
        </p>
      </div>

      {/* Timer */}
      <div style={{ textAlign: "center" }}>
        <p
          className={!timerDone ? "dungeon-pulse" : ""}
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
            color: timerDone ? "var(--accent-gold)" : "var(--accent-ember)",
            margin: "0.5rem 0 0 0",
          }}
        >
          {timerDone ? "The Dungeon Yields" : "Delving..."}
        </p>

        {/* Linked node/quest info */}
        {run.linked_node_id && (
          <p
            style={{
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              margin: "0.25rem 0 0 0",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
            }}
          >
            +20% XP — linked to tree node
          </p>
        )}
        {run.linked_quest_id && (
          <p
            style={{
              fontSize: "0.6rem",
              color: "var(--text-muted)",
              margin: "0.15rem 0 0 0",
              fontFamily: "var(--font-cinzel)",
              letterSpacing: "0.08em",
            }}
          >
            +15% XP — fulfilling daily quest
          </p>
        )}
      </div>

      {/* Event log */}
      {revealedEvents.length > 0 && (
        <div
          ref={eventLogRef}
          style={{
            width: "100%",
            maxHeight: "240px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "rgba(10,10,18,0.6)",
            border: "1px solid var(--border-default)",
            borderRadius: "4px",
          }}
        >
          {revealedEvents.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                gap: "0.6rem",
                alignItems: "flex-start",
                padding: "0.4rem 0",
                borderBottom: "1px solid rgba(224,216,200,0.05)",
                animation: "fadeIn 0.5s ease",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.3,
                  flexShrink: 0,
                }}
              >
                {eventIcon(event.event_type)}
              </span>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "0.75rem",
                    color: eventColor(event.event_type),
                    margin: 0,
                    letterSpacing: "0.05em",
                  }}
                >
                  Floor {event.floor_number}: {event.title}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-crimson)",
                    fontStyle: "italic",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    margin: "0.15rem 0 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {timerDone ? (
            <button
              onClick={onComplete}
              onMouseEnter={() => setCompleteHover(true)}
              onMouseLeave={() => setCompleteHover(false)}
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.7rem 2rem",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: "var(--accent-gold)",
                background: completeHover
                  ? "rgba(255,215,0,0.2)"
                  : "rgba(255,215,0,0.1)",
                border: completeHover
                  ? "1px solid rgba(255,215,0,0.6)"
                  : "1px solid rgba(255,215,0,0.3)",
                boxShadow: completeHover
                  ? "0 0 12px rgba(255,215,0,0.2)"
                  : "none",
              }}
              data-sound="dungeon-complete"
            >
              Claim Victory
            </button>
          ) : confirmRetreat ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-crimson)",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Retreat now? Your hero will return wounded.
                <br />
                Partial XP, no loot.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => {
                    setConfirmRetreat(false);
                    onRetreat();
                  }}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    color: "var(--accent-blood)",
                    background: "rgba(139,0,0,0.15)",
                    border: "1px solid rgba(139,0,0,0.4)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Confirm Retreat
                </button>
                <button
                  onClick={() => setConfirmRetreat(false)}
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Hold Position
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRetreat(true)}
              onMouseEnter={() => setRetreatHover(true)}
              onMouseLeave={() => setRetreatHover(false)}
              style={{
                fontFamily: "var(--font-cinzel)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.6rem 1.5rem",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: "var(--text-muted)",
                background: retreatHover
                  ? "rgba(20,18,28,0.9)"
                  : "rgba(20,18,28,0.7)",
                border: retreatHover
                  ? "1px solid rgba(224,216,200,0.2)"
                  : "1px solid rgba(224,216,200,0.1)",
              }}
            >
              Retreat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
