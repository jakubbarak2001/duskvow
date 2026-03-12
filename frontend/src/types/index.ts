// ============================================================
// Core Domain Types
// ============================================================

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  type: "habit" | "action" | "choice" | "keystone";
  tier: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  state: "locked" | "available" | "in_progress" | "completed";
  position: { x: number; y: number };
  prerequisites: string[];
  optional: boolean;
  xp_reward: number;
  estimated_time?: string;
}

export interface SkillEdge {
  from: string;
  to: string;
}

export interface TalentTree {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_prompt: string;
  ai_context?: Record<string, unknown>;
  total_nodes: number;
  completed_nodes: number;
  total_xp: number;
  earned_xp: number;
  status: "active" | "completed" | "abandoned";
  nodes: SkillNode[];
  edges: SkillEdge[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// AI Generation Types
// ============================================================

export interface FollowUpQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface FollowUpQuestionsResponse {
  questions: FollowUpQuestion[];
}

export interface GenerateTreeRequest {
  goal_prompt: string;
}

export interface FollowUpRequest {
  session_id: string;
  answers: Record<string, string>;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}
