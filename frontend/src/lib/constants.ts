export const RARITY_COLORS: Record<string, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

export const STATE_COLORS: Record<string, string> = {
  locked: "var(--state-locked)",
  available: "var(--state-available)",
  in_progress: "var(--state-progress)",
  completed: "var(--state-complete)",
};

export const NODE_TYPES = ["habit", "action", "choice", "keystone"] as const;
export const NODE_TIERS = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export const NODE_STATES = ["locked", "available", "in_progress", "completed"] as const;

export const FREE_TIER_DAILY_GENERATIONS = 2;
export const AI_TIMEOUT_MS = 30_000;
export const MAX_NODES_PER_TREE = 30;
export const MIN_NODES_PER_TREE = 20;
