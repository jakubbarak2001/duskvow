import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";
import type { UserProfile } from "@/types";

/**
 * Reads the hero profile from the global Zustand store.
 * Automatically hydrates from the API on first access.
 * Reads session from authStore directly (no redundant useUser() call).
 */
export function useProfile(): {
  profile: UserProfile | null;
  profileLoading: boolean;
} {
  const session = useAuthStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);
  const loading = useUserStore((s) => s.loading);
  const initialized = useUserStore((s) => s.initialized);
  const hydrate = useUserStore((s) => s.hydrate);

  useEffect(() => {
    if (session?.access_token && !initialized) {
      hydrate(session.access_token);
    }
  }, [session?.access_token, initialized, hydrate]);

  return { profile, profileLoading: loading || (!initialized && !profile) };
}
