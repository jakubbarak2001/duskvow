"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { Achievement, StreakMilestone } from "@/types";
import { AchievementToast } from "./AchievementToast";

interface QueueItem {
  achievement: Achievement;
  variant: "achievement" | "streak";
}

interface AchievementContextValue {
  showAchievement: (achievement: Achievement) => void;
  showAchievements: (achievements: Achievement[]) => void;
  showStreakMilestone: (milestone: StreakMilestone) => void;
}

const AchievementContext = createContext<AchievementContextValue>({
  showAchievement: () => {},
  showAchievements: () => {},
  showStreakMilestone: () => {},
});

export function useAchievementToast(): AchievementContextValue {
  return useContext(AchievementContext);
}

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<QueueItem | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (processingRef.current) return;
    if (queueRef.current.length === 0) {
      setActive(null);
      return;
    }

    processingRef.current = true;
    const next = queueRef.current.shift()!;
    setActive(next);
  }, []);

  const handleDismiss = useCallback(() => {
    processingRef.current = false;
    setTimeout(() => processQueue(), 300);
  }, [processQueue]);

  const showAchievement = useCallback(
    (achievement: Achievement) => {
      queueRef.current.push({ achievement, variant: "achievement" });
      if (!processingRef.current) {
        processQueue();
      }
    },
    [processQueue],
  );

  const showAchievements = useCallback(
    (achievements: Achievement[]) => {
      if (!achievements.length) return;
      queueRef.current.push(...achievements.map((a) => ({ achievement: a, variant: "achievement" as const })));
      if (!processingRef.current) {
        processQueue();
      }
    },
    [processQueue],
  );

  const showStreakMilestone = useCallback(
    (milestone: StreakMilestone) => {
      const bonus = Math.round((milestone.multiplier - 1) * 100);
      const fakeAchievement: Achievement = {
        key: `streak-milestone-${milestone.days}`,
        name: `${milestone.days}-Day Streak!`,
        description: `+${bonus}% XP bonus activated.`,
        category: "quest",
        icon: "flame",
        unlocked: true,
        unlocked_at: null,
      };
      queueRef.current.push({ achievement: fakeAchievement, variant: "streak" });
      if (!processingRef.current) {
        processQueue();
      }
    },
    [processQueue],
  );

  return (
    <AchievementContext.Provider value={{ showAchievement, showAchievements, showStreakMilestone }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 10000,
          pointerEvents: active ? "auto" : "none",
        }}
      >
        {active && (
          <AchievementToast
            key={active.achievement.key}
            achievement={active.achievement}
            variant={active.variant}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </AchievementContext.Provider>
  );
}
