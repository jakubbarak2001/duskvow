import type {
  ApiResponse,
  TalentTree,
  UserProfile,
  FollowUpQuestionsResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const json = await res.json();
  return json as ApiResponse<T>;
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
    request<TalentTree>("/api/v1/trees/followup", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ session_id: sessionId, answers }),
    }),

  deleteTree: (treeId: string, token: string) =>
    request<null>(`/api/v1/trees/${treeId}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // Nodes
  completeNode: (nodeId: string, token: string) =>
    request<{ node_id: string; new_state: string; xp_earned: number; total_xp: number }>(
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
};
