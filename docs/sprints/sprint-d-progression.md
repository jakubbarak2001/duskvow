# Sprint D — Progression & Unlocks (ARCHIVED)

> **Status**: COMPLETED. Archived 2026-04-14.
> Original tasks extracted from TASKS.md. Kept for reference.

---

> **Goal**: Make levels meaningful. Levels currently change a number and a title —
> they should gate features, unlock dungeon tiers, raise generation limits, and
> grant achievements. Add a hero profile page as the central "character sheet."
> Connect the inventory system so dungeon loot has somewhere to live. Add streak
> bonuses so daily consistency is rewarded mechanically, not just cosmetically.
>
> **Key design principle**: Every unlock must be *visible before it's earned*.
> A locked dungeon tier with "Requires Lv.10" creates aspiration. A hidden
> reward that appears with no foreshadowing feels arbitrary. Show the path,
> gate the progress.
>
> **Depends on**: Sprint C (Dungeon AFK Combat) — DONE

---

### TASK D1: DB Migration — Inventory, Achievements, Level Unlocks
**Status**: `DONE`
**Scope**: Supabase migration only — no app code changes
**Effort**: M

**What to do**:
1. Create migration `supabase/migrations/20260413_progression_system.sql`
2. Create table `hero_inventory`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `item_type TEXT NOT NULL CHECK (item_type IN ('scroll_of_clarity','ember_shard','shadowsteel_fragment','heros_ration','rune_of_focus','ashen_token'))`
   - `item_name TEXT NOT NULL`
   - `description TEXT NOT NULL`
   - `effect TEXT NOT NULL`
   - `source_run_id UUID REFERENCES dungeon_runs(id) ON DELETE SET NULL` — which dungeon dropped this
   - `used BOOLEAN NOT NULL DEFAULT FALSE`
   - `used_at TIMESTAMPTZ` — null until consumed
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - RLS: users can only read/update their own inventory
   - Index: `hero_inventory(user_id, used)` — quick lookup for active items
3. Create table `hero_achievements`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `achievement_key TEXT NOT NULL` — e.g. 'first_vow', 'iron_will'
   - `unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - `UNIQUE(user_id, achievement_key)` — prevent duplicate awards
   - RLS: users can only read their own achievements
   - Index: `hero_achievements(user_id)`
4. Add columns to `profiles`:
   - `streak_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00` — current streak XP multiplier
   - `achievements_count INT NOT NULL DEFAULT 0` — denormalized count for quick display
5. Create RPC function `claim_dungeon_loot(p_user_id UUID, p_run_id UUID)`:
   - Selects all unclaimed loot from `dungeon_loot` WHERE `run_id = p_run_id AND user_id = p_user_id AND claimed = FALSE`
   - For each row: insert into `hero_inventory`, set `dungeon_loot.claimed = TRUE`
   - Returns the number of items claimed
   - This moves loot from the "pending" table into the persistent inventory
6. Create RPC function `use_inventory_item(p_user_id UUID, p_item_id UUID)`:
   - Validates item exists, belongs to user, and `used = FALSE`
   - Sets `used = TRUE, used_at = NOW()`
   - Returns the item row (so the frontend knows what effect to apply)
   - Item effects are applied client-side / in specific backend flows (Sprint D2+ will wire effects)

**Validation**: `npx supabase migration list` shows new migration. Tables created cleanly. RPC functions callable via `/rest/v1/rpc/`.

---

### TASK D2: Level Unlock Configuration & Backend Logic
**Status**: `DONE`
**Depends on**: D1
**Effort**: M

**What to do**:
1. Create `backend/app/data/level_unlocks.json`:
   ```json
   {
     "dungeon_tiers": {
       "shallow_crypts": 1,
       "ember_mines": 5,
       "hollow_deep": 10,
       "abyssal_rift": 20
     },
     "generation_limits": {
       "1": 2, "5": 3, "15": 4, "25": 5
     },
     "active_tree_cap": {
       "1": 5, "20": 7, "30": 10
     },
     "feature_unlocks": {
       "hero_profile": 1,
       "challenge_quests": 3,
       "custom_daily_quest": 15,
       "fog_of_war_toggle": 8,
       "prestige": 30
     },
     "streak_bonuses": {
       "3": 1.05,
       "7": 1.10,
       "14": 1.15,
       "30": 1.20
     }
   }
   ```
2. Create `backend/app/services/progression.py`:
   - `get_level_unlocks()` — load and cache the JSON config (same pattern as `dungeon.py`)
   - `get_generation_limit(hero_level: int) -> int` — return the generation limit for the user's level (highest threshold <= level)
   - `get_active_tree_cap(hero_level: int) -> int` — return the active tree cap for the user's level
   - `get_streak_multiplier(current_streak: int) -> float` — return XP multiplier based on streak length (highest threshold <= streak)
   - `get_unlocked_features(hero_level: int) -> list[str]` — return list of feature keys unlocked at this level
   - `get_all_unlocks_for_display(hero_level: int) -> list[dict]` — return ALL unlocks with `unlocked: bool` for each, sorted by level. Used by the profile page to show what's earned and what's next.
3. Update `backend/app/api/v1/trees.py` — generation-status endpoint:
   - Replace hardcoded `generations_limit = 2` and `active_tree_cap = 5` with calls to `get_generation_limit(hero_level)` and `get_active_tree_cap(hero_level)`
   - Fetch profile to get hero_level, then compute limits
   - Include `next_unlock_at: int | null` in response — level where the next limit increase happens
4. Update `backend/app/api/v1/dungeon.py` — tiers endpoint:
   - Already uses `hero_level >= cfg["min_level"]` — no change needed, but verify it matches the JSON config
5. Apply streak multiplier to XP awards:
   - Update `add_xp_to_profile` calls in `quests.py`, `dungeon.py`, and `nodes.py`:
     - Before calling `supa.add_xp_to_profile(user_id, xp)`, fetch the user's streak multiplier
     - Apply it: `adjusted_xp = math.floor(xp * streak_multiplier)`
     - Pass `adjusted_xp` to the RPC
   - Create a helper `get_user_streak_multiplier(user_id: str) -> float` in `progression.py` that fetches profile and computes the multiplier
   - Return both `base_xp` and `bonus_xp` (from streak) in the response so the frontend can show "+10% streak bonus"
6. Update streak recording (`supa.update_streak`) to also update `streak_multiplier` on the profile whenever the streak changes.

**Validation**: Generation limit increases when hero levels up past thresholds. Dungeon tier gating still works. Streak multiplier applies to XP awards (test with a streak of 7+).

---

### TASK D3: Achievement Tracking Service
**Status**: `DONE`
**Depends on**: D1
**Effort**: L

**What to do**:
1. Create `backend/app/data/achievements.json`:
   ```json
   {
     "first_vow": {
       "name": "First Vow",
       "description": "Complete your first talent tree.",
       "category": "tree",
       "icon": "scroll",
       "condition": { "type": "trees_completed", "count": 1 }
     },
     "oath_keeper": {
       "name": "Oath Keeper",
       "description": "Complete 3 talent trees.",
       "category": "tree",
       "icon": "scroll",
       "condition": { "type": "trees_completed", "count": 3 }
     },
     "vow_collector": {
       "name": "Vow Collector",
       "description": "Have 5 active trees simultaneously.",
       "category": "tree",
       "icon": "shield",
       "condition": { "type": "active_trees", "count": 5 }
     },
     "the_long_road": {
       "name": "The Long Road",
       "description": "Complete a tree with 20 or more nodes.",
       "category": "tree",
       "icon": "road",
       "condition": { "type": "tree_nodes_completed", "count": 20 }
     },
     "first_descent": {
       "name": "First Descent",
       "description": "Complete your first dungeon delve.",
       "category": "dungeon",
       "icon": "sword",
       "condition": { "type": "dungeons_completed", "count": 1 }
     },
     "iron_will": {
       "name": "Iron Will",
       "description": "Complete 10 dungeons without retreating.",
       "category": "dungeon",
       "icon": "shield",
       "condition": { "type": "dungeons_completed_no_retreat", "count": 10 }
     },
     "deep_diver": {
       "name": "Deep Diver",
       "description": "Complete a 90-minute dungeon delve.",
       "category": "dungeon",
       "icon": "abyss",
       "condition": { "type": "dungeon_duration_completed", "minutes": 90 }
     },
     "loot_hoarder": {
       "name": "Loot Hoarder",
       "description": "Collect 50 items from dungeon runs.",
       "category": "dungeon",
       "icon": "chest",
       "condition": { "type": "total_loot_collected", "count": 50 }
     },
     "consistent": {
       "name": "Consistent",
       "description": "Maintain a 7-day activity streak.",
       "category": "quest",
       "icon": "flame",
       "condition": { "type": "streak_reached", "days": 7 }
     },
     "relentless": {
       "name": "Relentless",
       "description": "Maintain a 30-day activity streak.",
       "category": "quest",
       "icon": "flame",
       "condition": { "type": "streak_reached", "days": 30 }
     },
     "the_summit": {
       "name": "The Summit",
       "description": "Reach hero level 25.",
       "category": "meta",
       "icon": "mountain",
       "condition": { "type": "level_reached", "level": 25 }
     },
     "vow_eternal": {
       "name": "Vow Eternal",
       "description": "Reach hero level 50.",
       "category": "meta",
       "icon": "crown",
       "condition": { "type": "level_reached", "level": 50 }
     },
     "well_rounded": {
       "name": "Well Rounded",
       "description": "Complete a tree node, a dungeon, and all daily quests in one day.",
       "category": "meta",
       "icon": "star",
       "condition": { "type": "daily_trifecta" }
     }
   }
   ```
2. Create `backend/app/services/achievements.py`:
   - `get_all_achievements() -> dict` — load and cache the JSON
   - `get_user_achievements(user_id: str) -> list[dict]` — fetch from `hero_achievements` table, join with definitions
   - `check_and_award(user_id: str, trigger: str, context: dict) -> list[dict]` — the main function:
     - `trigger` is one of: `"node_complete"`, `"tree_complete"`, `"dungeon_complete"`, `"dungeon_retreat"`, `"quest_complete"`, `"streak_update"`, `"level_up"`, `"loot_claimed"`
     - `context` carries relevant data (e.g. `{"streak": 7, "level": 10, "dungeon_duration": 90}`)
     - Loads all achievement definitions, fetches user's already-unlocked keys
     - For each un-earned achievement, evaluates the condition against the trigger + context
     - For qualifying achievements: inserts into `hero_achievements`, increments `profiles.achievements_count`
     - Returns list of newly awarded achievements (for frontend notification)
   - Condition evaluators (private functions):
     - `_check_trees_completed(user_id, count)` — count completed trees in DB
     - `_check_active_trees(user_id, count)` — count active trees
     - `_check_tree_nodes_completed(user_id, count)` — check if any tree has >= N completed nodes
     - `_check_dungeons_completed(user_id, count)` — count completed (not retreated) runs
     - `_check_dungeons_completed_no_retreat(user_id, count)` — count consecutive completions with no retreats in the last N
     - `_check_dungeon_duration_completed(user_id, minutes)` — check if any completed run had `duration_minutes >= minutes`
     - `_check_total_loot_collected(user_id, count)` — count rows in `hero_inventory`
     - `_check_streak_reached(user_id, days)` — check current_streak or longest_streak >= days
     - `_check_level_reached(user_id, level)` — check hero_level >= level
     - `_check_daily_trifecta(user_id)` — check today's activity includes a node, dungeon, and all quests
3. Wire `check_and_award` into existing flows:
   - `backend/app/api/v1/nodes.py` — after `completeNode`: call `check_and_award(user_id, "node_complete", {...})`
   - `backend/app/api/v1/dungeon.py` — after `complete_run`: call `check_and_award(user_id, "dungeon_complete", {...})`
   - `backend/app/api/v1/dungeon.py` — after `retreat_run`: call `check_and_award(user_id, "dungeon_retreat", {...})`
   - `backend/app/api/v1/quests.py` — after `complete_quest`: call `check_and_award(user_id, "quest_complete", {...})`
   - In the `increment_profile_xp` flow — after a level-up is detected, check level-based achievements
   - After `update_streak` — check streak-based achievements
   - Include `new_achievements: list[dict]` in the response envelope alongside existing fields
4. Add supabase.py helpers:
   - `get_user_achievement_keys(user_id)` → list of already-earned achievement keys
   - `award_achievement(user_id, achievement_key)` → insert row, increment count
   - `get_user_inventory(user_id)` → list of inventory items (used + unused)
   - `get_user_inventory_count(user_id)` → count for achievement checks
   - `count_completed_trees(user_id)` → for achievement evaluation
   - `count_completed_dungeons(user_id)` → for achievement evaluation

**Validation**: Complete a node → "First Descent" (if first dungeon was already done) or tree achievements fire. Complete a dungeon → dungeon achievements checked. Duplicate awards prevented by UNIQUE constraint.

---

### TASK D4: Loot Claiming & Inventory Backend
**Status**: `DONE`
**Depends on**: D1, D3
**Effort**: M

**What to do**:
1. Create `backend/app/api/v1/inventory.py`:
   - `GET /api/v1/inventory` — return user's inventory items
     - Query params: `used=false` (default) to show active items, `used=true` for history
     - Response: `{ "data": [{ id, item_type, item_name, description, effect, used, used_at, created_at }] }`
   - `POST /api/v1/inventory/claim/{run_id}` — claim loot from a dungeon run
     - Calls the `claim_dungeon_loot` RPC
     - Also calls `check_and_award(user_id, "loot_claimed", {"total_count": new_count})`
     - Response: `{ "data": { "claimed_count": N, "items": [...], "new_achievements": [...] } }`
   - `POST /api/v1/inventory/{item_id}/use` — consume an inventory item
     - Calls the `use_inventory_item` RPC
     - Response: `{ "data": { item row with used=true } }`
     - NOTE: Item *effects* (XP buffs, streak shields) are tracked client-side or via a simple `active_buffs` field on the profile. Actual effect implementation is Sprint D scope only for streak shields (ember_shard). Other effects are placeholder — they show a toast but don't mechanically alter anything yet.
   - `GET /api/v1/inventory/count` — return count of unused items (for badge display)
     - Response: `{ "data": { "count": N } }`
2. Register router in `backend/app/api/v1/__init__.py`
3. Wire the BattleReport's "Collect All" button to call `POST /api/v1/inventory/claim/{run_id}` instead of (or in addition to) the current client-side-only flow
4. Implement Ember Shard effect (streak protection):
   - When `update_streak` detects a broken streak (gap > 1 day), check if user has an unused Ember Shard in inventory
   - If yes: auto-consume it, preserve the streak, include `streak_saved: true, item_used: "Ember Shard"` in the streak update response
   - If no: break the streak as normal

**Validation**: Collect loot on battle report → items appear in inventory. Use an item → marked as used. Ember Shard prevents streak break.

---

### TASK D5: Frontend Types & API Client for Progression
**Status**: `DONE`
**Depends on**: D2, D3, D4
**Effort**: S

**What to do**:
1. `types/index.ts` — Add:
   ```typescript
   // Achievement Types
   interface Achievement {
     key: string;
     name: string;
     description: string;
     category: "tree" | "dungeon" | "quest" | "meta";
     icon: string;
     unlocked: boolean;
     unlocked_at: string | null;
   }

   // Inventory Types
   interface InventoryItem {
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

   // Level Unlock Types
   interface LevelUnlock {
     feature: string;
     description: string;
     required_level: number;
     unlocked: boolean;
   }
   ```
2. Update `UserProfile` interface:
   - Add `streak_multiplier: number`
   - Add `achievements_count: number`
3. Update `DungeonCompleteResult` and `DailyQuestCompletionResult`:
   - Add `new_achievements: Achievement[]`
   - Add `base_xp: number` and `streak_bonus_xp: number` (so UI can show breakdown)
4. Update `NodeCompletionResult`:
   - Add `new_achievements: Achievement[]`
   - Add `streak_bonus_xp: number`
5. `lib/api.ts` — Add:
   - `getInventory(token, used?: boolean)` → `GET /api/v1/inventory?used={used}`
   - `claimLoot(runId, token)` → `POST /api/v1/inventory/claim/{runId}`
   - `useItem(itemId, token)` → `POST /api/v1/inventory/{itemId}/use`
   - `getInventoryCount(token)` → `GET /api/v1/inventory/count`
   - `getAchievements(token)` → `GET /api/v1/achievements` (read-only list)
   - `getLevelUnlocks(token)` → `GET /api/v1/profile/unlocks`
6. Add achievement-related endpoints to backend:
   - `GET /api/v1/achievements` — returns all achievements with user's unlock status
   - `GET /api/v1/profile/unlocks` — returns all level unlocks with current status

**Validation**: `npx tsc --noEmit` passes. All new types compile correctly.

---

### TASK D6: Achievement Notification Component
**Status**: `DONE`
**Depends on**: D5
**Effort**: M

**What to do**:
1. Create `frontend/src/components/ui/AchievementToast.tsx`:
   - A toast/banner that slides in from the top-right when an achievement is earned
   - Smaller than LevelUpModal — NOT a full-screen overlay. Think "notification banner."
   - Layout: icon (left) + text (right). Icon is a gold-bordered circle with the achievement icon symbol.
   - Text: achievement name (Cinzel, gold) + description (Inter, muted) on two lines
   - Background: `rgba(18,18,26,0.95)` with thin gold border and subtle glow
   - Auto-dismisses after 5 seconds, or click to dismiss
   - Supports stacking: if 2 achievements fire at once, show them sequentially (300ms delay)
   - Entry animation: slide in from right + fade in (0.3s). Exit: slide out right + fade out (0.2s).
   - Sound hook: `data-sound="achievement-unlock"` on the container

2. Create `frontend/src/components/ui/AchievementProvider.tsx`:
   - React context provider that wraps the app layout
   - Exposes `showAchievement(achievement: Achievement)` and `showAchievements(achievements: Achievement[])`
   - Manages a queue of pending toasts, renders `AchievementToast` for the active one
   - Place in `frontend/src/app/layout.tsx` (or the authenticated layout wrapper)

3. Wire into existing flows:
   - `TreeViewPage.tsx` — after node completion, if response includes `new_achievements`, show them
   - `dungeon/page.tsx` — after dungeon complete/retreat, if response includes `new_achievements`, show them
   - `vows/page.tsx` — after quest completion, if response includes `new_achievements`, show them

4. Achievement icon mapping (CSS-only, no image files):
   - Map achievement `icon` field to Unicode symbols or CSS shapes:
     - `scroll` → ◆, `shield` → ⛊, `sword` → ⚔, `flame` → 🔥 (but as CSS gradient, not emoji),
       `road` → ═, `chest` → ⬡, `abyss` → ◈, `mountain` → ▲, `crown` → ♔, `star` → ✦
   - Render in a circular badge with `var(--accent-gold)` border and dark background
   - These are placeholders — can be replaced with custom SVGs later

**Validation**: `npm run build` passes. Toast appears on achievement. Multiple achievements queue correctly. Dismisses after 5s. No layout shift on appearance.

---

### TASK D7: Hero Profile Page
**Status**: `DONE`
**Depends on**: D5, D6
**Effort**: L

**What to do**:
1. Create `frontend/src/app/profile/page.tsx`:
   - Full page: `/profile` route. Accessible from dashboard header (hero name becomes a link).
   - Dark background with noise overlay (reuse dashboard pattern)
   - Back link: "← Return to Hub" (same pattern as dungeon/vows pages)

2. **Hero Identity Section** (top):
   - Hero name (large Cinzel, gold)
   - Hero title below name (smaller Cinzel, muted)
   - Level badge: large "Lv.{N}" with gold glow
   - XP progress bar to next level:
     - Current XP / XP needed for next level
     - Bar fill: gold gradient, background: dark surface
     - Label: "{current_xp} / {next_level_xp} XP" in small text
     - Compute thresholds from formula: `level_xp = level^2 * 25` (inverse of `compute_level_from_xp`)
   - Hero title progression: show current title, next title, level required
   - Streak display: current streak + longest streak + active multiplier
     - "🔥 {N}-day streak" in ember color
     - If streak multiplier > 1.0: "+{N}% XP bonus active" badge

3. **Stats Grid** (below identity):
   - 2x3 or 3x2 grid of stat cards:
     - Total XP earned (all time)
     - Trees completed / active
     - Nodes completed (all time)
     - Dungeons completed (all time, with avg duration)
     - Total dungeon time (hours/minutes)
     - Quests completed (all time)
   - Fetch these via a new `GET /api/v1/profile/stats` endpoint that returns aggregated counts
   - Backend: add `get_profile_stats(user_id)` in supabase.py with COUNT queries

4. **Achievement Grid** (middle section):
   - "◆ Achievements ◆" eyebrow label
   - Grid of achievement badges (4-5 per row on desktop, 2-3 on mobile)
   - Earned achievements: full opacity, gold border, icon + name below
   - Unearned achievements: 30% opacity, muted border, "???" name, description hidden
   - Click on earned achievement: shows description + unlock date in a tooltip/popover
   - Progress indicator on partially-complete achievements where applicable (e.g., "3/10 dungeons")
   - Show count: "X of Y Achievements Unlocked"

5. **Inventory Section** (below achievements):
   - "◆ Inventory ◆" eyebrow label
   - List/grid of unused items from `hero_inventory`
   - Each item: rarity-colored border + item name + effect description + "Use" button
   - "Use" button calls `api.useItem(itemId, token)`, optimistic UI removes from list
   - Empty state: "Your pack is empty. Delve deeper." in muted text
   - Show count badge in section header: "Inventory (3)"

6. **Level Unlocks Section** (bottom):
   - "◆ Path of Ascension ◆" eyebrow label
   - Vertical timeline/list showing what unlocks at each level threshold
   - Earned unlocks: gold check + feature name + "Unlocked at Lv.{N}"
   - Future unlocks: muted lock icon + "Unlocks at Lv.{N}" + feature name
   - Highlights the NEXT unlock: "Next: Lv.{N} — {feature description}"

7. **Backend endpoint**: `GET /api/v1/profile/stats`:
   - Returns: `{ trees_completed, trees_active, nodes_completed, dungeons_completed, total_dungeon_minutes, quests_completed, total_loot_collected }`
   - All are simple COUNT/SUM queries against existing tables

**Validation**: `npm run build` passes. Profile page loads with real data. Achievement grid renders correctly (earned vs locked). Inventory items usable. Level unlocks timeline shows progression. Responsive on mobile.

---

### TASK D8: Unlock Indicators Across UI
**Status**: `DONE`
**Depends on**: D2, D5
**Effort**: M

**What to do**:
1. **Dungeon tier selector** (`dungeon/page.tsx`):
   - Already shows locked tiers with `unlocked: false` — verify this still works with the JSON config
   - Add: "Unlocks at Lv.{N}" text on locked tier cards (currently just shows the level requirement)
   - Add: subtle lock icon overlay on the card image for locked tiers

2. **Tree generation** (`vows/page.tsx`):
   - Currently shows generation count as "X/2 used today"
   - Update to show dynamic limit: "X/{limit} used today" where limit comes from `GenerationStatus`
   - Below the count: "Next slot unlocks at Lv.{N}" if there's a higher tier available
   - Update `GenerationStatus` response from backend to include `next_unlock_level: number | null`

3. **Dashboard hub header** (`dashboard/page.tsx`):
   - Show streak multiplier badge next to the streak count when multiplier > 1.0
   - Small text: "+{N}%" in gold, with tooltip "Streak XP bonus"
   - Show inventory count badge (small number) if user has unclaimed/unused items
   - Hero name becomes a `<Link href="/profile">` — clicking navigates to profile

4. **XP award displays** (everywhere XP is shown after an action):
   - When streak multiplier > 1.0, show XP breakdown: "+{base} XP (+{bonus} streak)"
   - Applies to: node completion, quest completion, dungeon complete/retreat
   - Example: "+30 XP (+3 streak)" instead of just "+33 XP"
   - The backend already returns `base_xp` and `streak_bonus_xp` (from D2)

5. **Navigation to profile**:
   - Add "Hero Profile" link in the dashboard header or as a fourth hub door
   - OR: make the hero name/level section in the header clickable → navigates to `/profile`
   - Prefer the clickable header approach to avoid a fourth door card

**Validation**: `npm run build` passes. Locked tiers show unlock requirement. Generation limit reflects hero level. Streak bonus visible when active. Hero name navigates to profile.

---

### TASK D9: Streak Bonus Visual Feedback
**Status**: `DONE`
**Depends on**: D2, D8
**Effort**: S

**What to do**:
1. **StatsBar streak display** (used in Vow Chamber):
   - If streak multiplier > 1.0: show a glowing ember icon next to streak count
   - Text: "{N}-day streak • +{X}% XP" in ember color
   - Next milestone hint: "3 more days until +15% XP"
   - Compute from `streak_bonuses` thresholds: find the next threshold above current streak

2. **Streak milestone celebration**:
   - When a streak reaches a bonus threshold (3, 7, 14, 30):
   - Show a brief toast/banner: "🔥 {N}-Day Streak! +{X}% XP bonus activated."
   - Reuse the AchievementToast component with a different color (ember instead of gold)
   - Backend: include `streak_milestone: { days: N, multiplier: 1.10 } | null` in streak update response when a threshold is crossed

3. **Streak at risk indicator** (dashboard):
   - If the user has a streak >= 3 and hasn't logged activity today:
   - Show "Your flame dims..." in muted ember text below the streak counter
   - Subtle pulse animation on the streak number
   - This requires checking `last_activity_date` vs today on the frontend

**Validation**: `npm run build` passes. Streak bonus visible in StatsBar. Milestone toast fires on threshold. "Your flame dims" appears when at risk.

---

### TASK D10: Loot Claiming Flow Polish
**Status**: `DONE`
**Depends on**: D4, D5
**Effort**: S

**What to do**:
1. **BattleReport "Collect All" wiring** (`BattleReport.tsx`):
   - Currently the loot display is view-only. Wire the "Collect" action to `api.claimLoot(runId, token)`
   - On success: show each item with a brief "Added to inventory" confirmation
   - On success: check for `new_achievements` in response (e.g., "Loot Hoarder")
   - Disable the button after claiming (prevent double-claim)
   - Show "Collected!" state with gold checkmark

2. **Dungeon page post-complete flow**:
   - After calling `api.completeDungeon()`, the response includes loot
   - Don't auto-claim — let the user see the loot first on the BattleReport, then claim
   - If user navigates away without claiming, loot remains unclaimed in DB (they can claim later from inventory/profile)

3. **Unclaimed loot reminder**:
   - On dashboard mount: check if user has any runs with unclaimed loot
   - If yes: show a subtle banner or badge: "Unclaimed spoils await" with a link to the dungeon history or profile
   - This prevents "lost" loot from forgotten runs

**Validation**: `npm run build` passes. Collect button claims loot to inventory. Achievement fires if threshold met. Unclaimed loot banner shows on dashboard.

---
