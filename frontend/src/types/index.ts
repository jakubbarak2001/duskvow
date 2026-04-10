// ============================================================
// Core Domain Types — mirrors the Python Pydantic schemas
// ============================================================

export interface SkillNode {
  id: string;
  tree_id?: string;
  title: string;
  description: string;
  node_type: "habit" | "action" | "choice" | "keystone";
  tier: "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
  state: "locked" | "available" | "in_progress" | "completed";
  /** Canvas X coordinate (pixels) */
  position_x: number;
  /** Canvas Y coordinate (pixels) */
  position_y: number;
  prerequisites: string[];
  is_optional: boolean;
  xp_reward: number;
  estimated_time?: string;
  sort_order?: number;
  completed_at?: string | null;
}

export interface TalentTree {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_prompt: string;
  ai_context?: Record<string, unknown> | null;
  total_nodes: number;
  completed_nodes: number;
  total_xp: number;
  earned_xp: number;
  status: "active" | "completed" | "abandoned";
  nodes: SkillNode[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  hero_name: string | null;
  hero_level: number;
  hero_title: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface NodeCompletionResult {
  node_id: string;
  new_state: string;
  xp_earned: number;
  total_xp: number;
  leveled_up: boolean;
  new_level: number;
  previous_level: number;
  new_title: string;
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
  session_id: string;
  questions: FollowUpQuestion[];
}


export interface TreeGenerationResult {
  tree: TalentTree;
  generations_remaining: number;
  generations_used: number;
}

export interface GenerationStatus {
  generations_used: number;
  generations_remaining: number;
  generations_limit: number;
  active_trees: number;
  active_tree_cap: number;
}

// ============================================================
// Ember Types
// ============================================================

export interface Ember {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}
