import type { ApiResponse, TalentTree, UserProfile, FollowUpQuestionsResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
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

export const api = {
  // Profile
  getProfile: () => request<UserProfile>("/api/v1/profile"),

  // Trees
  listTrees: (token: string) =>
    request<TalentTree[]>("/api/v1/trees", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getTree: (treeId: string, token: string) =>
    request<TalentTree>(`/api/v1/trees/${treeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  generateTree: (goalPrompt: string, token: string) =>
    request<FollowUpQuestionsResponse>("/api/v1/trees/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ goal_prompt: goalPrompt }),
    }),

  submitFollowUp: (sessionId: string, answers: Record<string, string>, token: string) =>
    request<TalentTree>("/api/v1/trees/followup", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ session_id: sessionId, answers }),
    }),

  deleteTree: (treeId: string, token: string) =>
    request<null>(`/api/v1/trees/${treeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Nodes
  completeNode: (nodeId: string, token: string) =>
    request<{ xp_earned: number }>(`/api/v1/nodes/${nodeId}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),

  startNode: (nodeId: string, token: string) =>
    request<null>(`/api/v1/nodes/${nodeId}/start`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),

  resetNode: (nodeId: string, token: string) =>
    request<null>(`/api/v1/nodes/${nodeId}/reset`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
