import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useUserStore } from "@/stores/userStore";

interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  /** Resolve session once, set up auth listener, eagerly hydrate profile. */
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: isSupabaseConfigured(),
  initialized: false,

  hydrate: () => {
    if (get().initialized || !isSupabaseConfigured()) return;
    set({ initialized: true });

    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      });

      // Eagerly start profile hydration as soon as auth resolves
      if (data.session?.access_token) {
        useUserStore.getState().hydrate(data.session.access_token);
      }
    });

    supabase.auth.onAuthStateChange((_event, s) => {
      set({
        session: s,
        user: s?.user ?? null,
        loading: false,
      });

      // Re-hydrate profile on auth change (login/logout)
      if (s?.access_token) {
        useUserStore.getState().hydrate(s.access_token, true);
      } else {
        useUserStore.getState().setProfile(null);
      }
    });
  },
}));
