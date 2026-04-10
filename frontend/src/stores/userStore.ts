import { create } from "zustand";
import type { UserProfile } from "@/types";

interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  addXp: (amount: number) => void;
  setHeroName: (name: string) => void;
  setLevel: (level: number, title: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  addXp: (amount) =>
    set((store) => {
      if (!store.profile) return store;
      return {
        profile: {
          ...store.profile,
          total_xp: store.profile.total_xp + amount,
        },
      };
    }),

  setHeroName: (name) =>
    set((store) => {
      if (!store.profile) return store;
      return {
        profile: {
          ...store.profile,
          hero_name: name,
        },
      };
    }),

  setLevel: (level, title) =>
    set((store) => {
      if (!store.profile) return store;
      return {
        profile: {
          ...store.profile,
          hero_level: level,
          hero_title: title,
        },
      };
    }),
}));
