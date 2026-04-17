import { create } from "zustand";
import { api } from "@/lib/api";
import { levelForXp, titleForLevel } from "@/lib/levels";
import type { UserProfile } from "@/types";

interface UserStore {
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;

  /** ISO date (YYYY-MM-DD) for which the streak-flame ignite animation has
   *  already been played this session. Null = not yet animated. */
  streakAnimatedFor: string | null;

  /** Hydrate profile from API. Only fetches once unless force=true. */
  hydrate: (token: string, force?: boolean) => Promise<void>;

  /** Set the full profile (used after naming, etc). */
  setProfile: (profile: UserProfile | null) => void;

  /** Optimistically add XP and recompute level/title. */
  addXp: (amount: number) => void;

  /** Reconcile with server response after a completion event. */
  updateFromCompletion: (result: {
    total_xp: number;
    new_level: number;
    new_title: string;
    streak_multiplier?: number;
  }) => void;

  setHeroName: (name: string) => void;
  setLevel: (level: number, title: string) => void;

  /** Mark the streak flame ignite animation as played for the given date. */
  markStreakAnimated: (date: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  loading: false,
  initialized: false,
  streakAnimatedFor: null,

  hydrate: async (token, force) => {
    const state = get();
    if (state.initialized && !force) return;
    if (state.loading) return;

    set({ loading: true });
    const res = await api.getProfile(token);
    if (res.data) {
      set({ profile: res.data, initialized: true, loading: false });
    } else {
      set({ loading: false });
    }
  },

  setProfile: (profile) => set({ profile, initialized: !!profile }),

  addXp: (amount) =>
    set((store) => {
      if (!store.profile) return store;
      const newTotalXp = store.profile.total_xp + amount;
      const newLevel = levelForXp(newTotalXp);
      const newTitle = titleForLevel(newLevel);
      return {
        profile: {
          ...store.profile,
          total_xp: newTotalXp,
          hero_level: newLevel,
          hero_title: newTitle,
        },
      };
    }),

  updateFromCompletion: (result) =>
    set((store) => {
      if (!store.profile) return store;
      const today = new Date().toISOString().slice(0, 10);
      const prevActivity = store.profile.last_activity_date;
      const prevStreak = store.profile.current_streak;

      // Optimistically recompute the streak so the flame updates the same
      // frame as the XP bar, even before the profile re-hydrates. If this
      // disagrees with the server (very unlikely) the next full profile
      // fetch reconciles.
      let newStreak = prevStreak;
      if (prevActivity !== today) {
        newStreak = prevActivity === yesterdayIso(today) ? prevStreak + 1 : 1;
      }

      return {
        profile: {
          ...store.profile,
          total_xp: result.total_xp,
          hero_level: result.new_level,
          hero_title: result.new_title,
          streak_multiplier: result.streak_multiplier ?? store.profile.streak_multiplier,
          current_streak: newStreak,
          last_activity_date: today,
        },
      };
    }),

  setHeroName: (name) =>
    set((store) => {
      if (!store.profile) return store;
      return {
        profile: { ...store.profile, hero_name: name },
      };
    }),

  setLevel: (level, title) =>
    set((store) => {
      if (!store.profile) return store;
      return {
        profile: { ...store.profile, hero_level: level, hero_title: title },
      };
    }),

  markStreakAnimated: (date) => set({ streakAnimatedFor: date }),
}));

function yesterdayIso(todayIso: string): string {
  const t = Date.parse(`${todayIso}T00:00:00Z`);
  if (Number.isNaN(t)) return todayIso;
  return new Date(t - 86_400_000).toISOString().slice(0, 10);
}
