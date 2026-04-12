"use client";

import { useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useAuthStore } from "@/stores/authStore";

interface UseUserReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Returns the current Supabase user, session, and loading state.
 * Backed by a singleton Zustand store — no matter how many components
 * call this hook, getSession() runs exactly once.
 */
export function useUser(): UseUserReturn {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { user, session, loading };
}
