import type {
  ApiResponse,
  TalentTree,
  UserProfile,
  FollowUpQuestionsResponse,
  TreeGenerationResult,
  GenerationStatus,
  Ember,
  NodeCompletionResult,
  DailyQuest,
  DailyQuestCompletionResult,
  DungeonTier,
  DungeonRun,
  DungeonStartResult,
  DungeonCompleteResult,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    return {
      data: null,
      error: {
        message:
          "Unable to reach the server. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      },
    };
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
    request<UserProfile>("/api/v1/profile", {
      headers: authHeader(token),
    }),

  // Trees
  listTrees: (token: string) =>
    request<TalentTree[]>("/api/v1/trees", {
      headers: authHeader(token),
    }),

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
  ) =>
    request<TreeGenerationResult>("/api/v1/trees/followup", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ session_id: sessionId, answers }),
    }),

  getGenerationStatus: (token: string) =>
    request<GenerationStatus>("/api/v1/trees/generation-status", {
      headers: authHeader(token),
    }),

  deleteTree: (treeId: string, token: string) =>
    request<{ deleted: boolean; tree_id: string }>(`/api/v1/trees/${treeId}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // Profile
  updateProfile: (heroName: string, token: string) =>
    request<UserProfile>("/api/v1/profile", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ hero_name: heroName }),
    }),

  // Nodes
  completeNode: (nodeId: string, token: string) =>
    request<NodeCompletionResult>(
      `/api/v1/nodes/${nodeId}/complete`,
      { method: "PATCH", headers: authHeader(token) },
    ),

  startNode: (nodeId: string, token: string) =>
    request<{ node_id: string; new_state: string }>(
      `/api/v1/nodes/${nodeId}/start`,
      { method: "PATCH", headers: authHeader(token) },
    ),

  resetNode: (nodeId: string, token: string) =>
    request<{ node_id: string; new_state: string }>(
      `/api/v1/nodes/${nodeId}/reset`,
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

  // Daily Quests
  getTodayQuests: (token: string) =>
    request<DailyQuest[]>("/api/v1/quests/today", {
      headers: authHeader(token),
    }),

  completeQuest: (questId: string, token: string) =>
    request<DailyQuestCompletionResult>(`/api/v1/quests/${questId}/complete`, {
      method: "POST",
      headers: authHeader(token),
    }),

  uncompleteQuest: (questId: string, token: string) =>
    request<{ quest_id: string; uncompleted: boolean }>(
      `/api/v1/quests/${questId}/complete`,
      { method: "DELETE", headers: authHeader(token) },
    ),

  // Dungeon
  getDungeonTiers: (token: string) =>
    request<DungeonTier[]>("/api/v1/dungeon/tiers", {
      headers: authHeader(token),
    }),

  getActiveDungeon: (token: string) =>
    request<DungeonRun | null>("/api/v1/dungeon/active", {
      headers: authHeader(token),
    }),

  startDungeon: (
    tier: string,
    durationMinutes: number,
    linkedNodeId: string | null,
    linkedQuestId: string | null,
    token: string,
  ) =>
    request<DungeonStartResult>("/api/v1/dungeon/start", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        tier,
        duration_minutes: durationMinutes,
        linked_node_id: linkedNodeId,
        linked_quest_id: linkedQuestId,
      }),
    }),

  completeDungeon: (token: string) =>
    request<DungeonCompleteResult>("/api/v1/dungeon/complete", {
      method: "POST",
      headers: authHeader(token),
    }),

  retreatDungeon: (token: string) =>
    request<DungeonCompleteResult>("/api/v1/dungeon/retreat", {
      method: "POST",
      headers: authHeader(token),
    }),

  getDungeonHistory: (token: string) =>
    request<DungeonRun[]>("/api/v1/dungeon/history", {
      headers: authHeader(token),
    }),
};
