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
  streak_multiplier: number;
  achievements_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakMilestone {
  days: number;
  multiplier: number;
}

export interface NodeCompletionResult {
  node_id: string;
  new_state: string;
  xp_earned: number;
  base_xp: number;
  streak_bonus_xp: number;
  total_xp: number;
  leveled_up: boolean;
  new_level: number;
  previous_level: number;
  new_title: string;
  new_achievements: Achievement[];
  streak_milestone: StreakMilestone | null;
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
  next_unlock_level: number | null;
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
// Daily Quest Types
// ============================================================

export interface DailyQuest {
  id: string;
  tree_id: string;
  user_id: string;
  title: string;
  description: string;
  xp_reward: number;
  sort_order: number;
  estimated_minutes: number | null;
  created_at: string;
  completed_today: boolean;
}

export interface DailyQuestCompletionResult {
  quest_id: string;
  xp_earned: number;
  base_xp: number;
  streak_bonus_xp: number;
  total_xp: number;
  leveled_up: boolean;
  new_level: number;
  previous_level: number;
  new_title: string;
  new_achievements: Achievement[];
  streak_milestone: StreakMilestone | null;
}

// ============================================================
// Dungeon Types
// ============================================================

export interface DungeonTier {
  key: string;
  name: string;
  description: string;
  min_level: number;
  floors: number;
  base_xp: number;
  unlocked: boolean;
}

export interface DungeonEvent {
  id: string;
  run_id: string;
  floor_number: number;
  event_type: "combat" | "discovery" | "trap" | "rest" | "boss";
  title: string;
  description: string;
  monster_name: string | null;
  monsters_defeated: number;
  trigger_at_seconds: number;
  sort_order: number;
}

export interface DungeonLootItem {
  id: string;
  run_id: string;
  user_id: string;
  item_type: string;
  item_name: string;
  description: string;
  effect: string;
  claimed: boolean;
  created_at: string;
}

export interface DungeonRun {
  id: string;
  user_id: string;
  tier: string;
  status: "active" | "completed" | "retreated";
  total_floors: number;
  cleared_floors: number;
  duration_minutes: number;
  xp_earned: number;
  linked_node_id: string | null;
  linked_quest_id: string | null;
  created_at: string;
  completed_at: string | null;
  events: DungeonEvent[];
}

export interface DungeonStartResult {
  id: string;
  user_id: string;
  tier: string;
  status: "active";
  total_floors: number;
  cleared_floors: number;
  duration_minutes: number;
  xp_earned: number;
  linked_node_id: string | null;
  linked_quest_id: string | null;
  created_at: string;
  completed_at: string | null;
  events: DungeonEvent[];
  loot: DungeonLootItem[];
}

export interface DungeonCompleteResult {
  run_id: string;
  status: "completed" | "retreated";
  cleared_floors: number;
  total_floors: number;
  xp_earned: number;
  base_xp: number;
  streak_bonus_xp: number;
  total_xp: number;
  leveled_up: boolean;
  new_level: number;
  previous_level: number;
  new_title: string;
  loot: DungeonLootItem[];
  quest_auto_completed?: boolean;
  linked_quest_id?: string | null;
  new_achievements: Achievement[];
  streak_milestone: StreakMilestone | null;
}

// ============================================================
// Achievement Types
// ============================================================

export interface Achievement {
  key: string;
  name: string;
  description: string;
  category: "tree" | "dungeon" | "quest" | "meta";
  icon: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

// ============================================================
// Inventory Types
// ============================================================

export interface InventoryItem {
  id: string;
  user_id: string;
  item_type: string;
  item_name: string;
  description: string;
  effect: string;
  source_run_id: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

// ============================================================
// Level Unlock Types
// ============================================================

export interface LevelUnlock {
  feature: string;
  description: string;
  required_level: number;
  unlocked: boolean;
}

// ============================================================
// Profile Stats Types
// ============================================================

export interface ProfileStats {
  trees_completed: number;
  trees_active: number;
  nodes_completed: number;
  dungeons_completed: number;
  total_dungeon_minutes: number;
  quests_completed: number;
  total_loot_collected: number;
}

// ============================================================
// Loot Claim Result
// ============================================================

export interface LootClaimResult {
  claimed_count: number;
  items: InventoryItem[];
  new_achievements: Achievement[];
}

// ============================================================
// Leaderboard Types
// ============================================================

export interface LeaderboardEntry {
  id: string;
  hero_name: string | null;
  display_name: string | null;
  hero_level: number;
  hero_title: string;
  total_xp: number;
  weekly_xp: number;
  current_streak: number;
  rank: number;
  score: number;
}

export interface LeaderboardRank {
  rank: number;
  score: number;
  total_participants: number;
  hero_name: string | null;
  hero_level: number;
  hero_title: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: { message: string; code: string } | null;
}
