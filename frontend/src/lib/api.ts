import type {
  ApiResponse,
  TalentTree,
  UserProfile,
  FollowUpQuestionsResponse,
  TreeGenerationResult,
  GenerationStatus,
  Ember,
  NodeCompletionResult,
  DungeonTier,
  DungeonRun,
  DungeonStartResult,
  DungeonCompleteResult,
  Achievement,
  InventoryItem,
  LevelUnlock,
  ProfileStats,
  LootClaimResult,
  LeaderboardEntry,
  LeaderboardRank,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Simple in-memory response cache (30s TTL)
// ---------------------------------------------------------------------------

const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30_000;

function cached<T>(
  key: string,
  fetcher: () => Promise<ApiResponse<T>>,
): Promise<ApiResponse<T>> {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return Promise.resolve(hit.data as ApiResponse<T>);
  }
  return fetcher().then((result) => {
    if (result.data) _cache.set(key, { data: result, ts: Date.now() });
    return result;
  });
}

function invalidate(...prefixes: string[]) {
  for (const key of _cache.keys()) {
    if (prefixes.some((p) => key.startsWith(p))) {
      _cache.delete(key);
    }
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs?: number,
): Promise<ApiResponse<T>> {
  // Optional client-side abort for long-running endpoints (e.g. tree
  // generation). When set, gives us a distinct TIMEOUT error path instead
  // of hanging indefinitely on a stuck backend.
  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller?.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        data: null,
        error: {
          message:
            "Generation is taking longer than expected. Please try again.",
          code: "TIMEOUT",
        },
      };
    }
    return {
      data: null,
      error: {
        message:
          "Unable to reach the server. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      },
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  let json: Record<string, unknown>;
  try {
    json = await res.json();
  } catch {
    return {
      data: null,
      error: {
        message: "Server returned an invalid response.",
        code: String(res.status),
      },
    };
  }

  // FastAPI error responses use {"detail":"..."} — map them to ApiResponse shape
  // so callers can rely on res.error being set on any non-2xx status.
  if (!res.ok) {
    return {
      data: null,
      error: {
        message:
          typeof json?.detail === "string"
            ? json.detail
            : (json?.message as string) ?? "An unexpected error occurred.",
        code: String(res.status),
      },
    };
  }
  return json as unknown as ApiResponse<T>;
}

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  // Profile
  getProfile: (token: string) =>
    cached("profile", () =>
      request<UserProfile>("/api/v1/profile", {
        headers: authHeader(token),
      }),
    ),

  // Trees
  listTrees: (token: string) =>
    cached("trees", () =>
      request<TalentTree[]>("/api/v1/trees", {
        headers: authHeader(token),
      }),
    ),

  getTree: (treeId: string, token: string) =>
    request<TalentTree>(`/api/v1/trees/${treeId}`, {
      headers: authHeader(token),
    }),

  generateTree: (goalPrompt: string, token: string) =>
    request<FollowUpQuestionsResponse>("/api/v1/trees/generate", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ goal_prompt: goalPrompt }),
    }),

  submitFollowUp: (
    sessionId: string,
    answers: Record<string, string>,
    token: string,
  ) => {
    invalidate("trees", "profile", "profile-stats");
    // 55s client timeout — 10s slack over the 45s backend ceiling
    // (backend: ai_timeout_seconds in config.py). The slack covers
    // Vercel edge + Next.js overhead so the backend's 504 wins the race
    // most of the time; the client abort only fires if the backend
    // itself is wedged.
    return request<TreeGenerationResult>(
      "/api/v1/trees/followup",
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify({ session_id: sessionId, answers }),
      },
      55_000,
    );
  },

  getGenerationStatus: (token: string) =>
    request<GenerationStatus>("/api/v1/trees/generation-status", {
      headers: authHeader(token),
    }),

  deleteTree: (treeId: string, token: string) => {
    invalidate("trees", "profile-stats");
    return request<{ deleted: boolean; tree_id: string }>(`/api/v1/trees/${treeId}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  shareTree: (treeId: string, token: string) => {
    invalidate("trees");
    return request<{ slug: string; is_public: boolean; already_public: boolean }>(
      `/api/v1/trees/${treeId}/share`,
      { method: "POST", headers: authHeader(token) },
    );
  },

  unshareTree: (treeId: string, token: string) => {
    invalidate("trees");
    return request<{ is_public: boolean }>(
      `/api/v1/trees/${treeId}/share`,
      { method: "DELETE", headers: authHeader(token) },
    );
  },

  // Public — no auth header
  getPublicTree: (slug: string) =>
    request<TalentTree & { hero_name: string | null }>(
      `/api/v1/public/trees/${slug}`,
    ),

  // Profile
  updateProfile: (heroName: string, token: string) =>
    request<UserProfile>("/api/v1/profile", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ hero_name: heroName }),
    }),

  // Nodes
  completeNode: (nodeId: string, token: string) => {
    invalidate("profile", "trees", "profile-stats");
    return request<NodeCompletionResult>(
      `/api/v1/nodes/${nodeId}/complete`,
      { method: "PATCH", headers: authHeader(token) },
    );
  },

  startNode: (nodeId: string, token: string) =>
    request<{ node_id: string; new_state: string }>(
      `/api/v1/nodes/${nodeId}/start`,
      { method: "PATCH", headers: authHeader(token) },
    ),


  // Embers
  listEmbers: (token: string) =>
    request<Ember[]>("/api/v1/embers", { headers: authHeader(token) }),

  createEmber: (title: string, description: string | null, token: string) =>
    request<Ember>("/api/v1/embers", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ title, description }),
    }),

  deleteEmber: (emberId: string, token: string) =>
    request<{ deleted: boolean }>(`/api/v1/embers/${emberId}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // Dungeon
  getDungeonTiers: (token: string) =>
    cached("dungeon-tiers", () =>
      request<DungeonTier[]>("/api/v1/dungeon/tiers", {
        headers: authHeader(token),
      }),
    ),

  getActiveDungeon: (token: string) =>
    request<DungeonRun | null>("/api/v1/dungeon/active", {
      headers: authHeader(token),
    }),

  startDungeon: (
    tier: string,
    durationMinutes: number,
    linkedNodeId: string | null,
    token: string,
  ) =>
    request<DungeonStartResult>("/api/v1/dungeon/start", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        tier,
        duration_minutes: durationMinutes,
        linked_node_id: linkedNodeId,
      }),
    }),

  completeDungeon: (token: string) => {
    invalidate("profile", "profile-stats", "achievements");
    return request<DungeonCompleteResult>("/api/v1/dungeon/complete", {
      method: "POST",
      headers: authHeader(token),
    });
  },

  retreatDungeon: (token: string) => {
    invalidate("profile", "profile-stats");
    return request<DungeonCompleteResult>("/api/v1/dungeon/retreat", {
      method: "POST",
      headers: authHeader(token),
    });
  },

  getDungeonHistory: (token: string) =>
    request<DungeonRun[]>("/api/v1/dungeon/history", {
      headers: authHeader(token),
    }),

  // Achievements
  getAchievements: (token: string) =>
    cached("achievements", () =>
      request<Achievement[]>("/api/v1/achievements", {
        headers: authHeader(token),
      }),
    ),

  // Inventory
  getInventory: (token: string, used?: boolean) =>
    request<InventoryItem[]>(
      `/api/v1/inventory${used !== undefined ? `?used=${used}` : ""}`,
      { headers: authHeader(token) },
    ),

  getInventoryCount: (token: string) =>
    request<{ count: number }>("/api/v1/inventory/count", {
      headers: authHeader(token),
    }),

  claimLoot: (runId: string, token: string) => {
    invalidate("profile", "profile-stats");
    return request<LootClaimResult>(`/api/v1/inventory/claim/${runId}`, {
      method: "POST",
      headers: authHeader(token),
    });
  },

  useItem: (itemId: string, token: string) => {
    invalidate("profile", "profile-stats");
    return request<InventoryItem>(`/api/v1/inventory/${itemId}/use`, {
      method: "POST",
      headers: authHeader(token),
    });
  },

  // Profile — unlocks & stats
  getLevelUnlocks: (token: string) =>
    cached("unlocks", () =>
      request<LevelUnlock[]>("/api/v1/profile/unlocks", {
        headers: authHeader(token),
      }),
    ),

  getProfileStats: (token: string) =>
    cached("profile-stats", () =>
      request<ProfileStats>("/api/v1/profile/stats", {
        headers: authHeader(token),
      }),
    ),

  // Leaderboard
  getLeaderboard: (
    token: string,
    metric: "total_xp" | "current_streak" = "total_xp",
    period: "weekly" | "all_time" = "weekly",
    limit: number = 50,
  ) =>
    request<LeaderboardEntry[]>(
      `/api/v1/leaderboard?metric=${metric}&period=${period}&limit=${limit}`,
      { headers: authHeader(token) },
    ),

  getMyRank: (
    token: string,
    metric: "total_xp" | "current_streak" = "total_xp",
    period: "weekly" | "all_time" = "weekly",
  ) =>
    request<LeaderboardRank>(
      `/api/v1/leaderboard/me?metric=${metric}&period=${period}`,
      { headers: authHeader(token) },
    ),

  // Account lifecycle — GDPR Art. 17 (erasure) + Art. 20 (portability)
  deleteAccount: (confirm: string, token: string) =>
    request<{ deleted: boolean }>("/api/v1/profile/me", {
      method: "DELETE",
      headers: authHeader(token),
      body: JSON.stringify({ confirm }),
    }),

  // Returns the raw Response so the caller can stream it into a Blob and
  // trigger a browser download. Using the shared `request()` helper would
  // force JSON parsing, which defeats the file-download use case.
  fetchDataExport: (token: string) =>
    fetch(`${API_BASE}/api/v1/profile/me/export`, {
      method: "GET",
      headers: authHeader(token),
    }),
};
