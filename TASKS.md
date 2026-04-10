# TASKS.md — Duskvow Task Queue

> **Purpose**: Ordered list of tasks for Claude Code to execute.
> Each task has specs tight enough to run without human supervision.
> Claude reads STATE.md first, then picks up the next `QUEUED` task.
>
> **Status values**: `QUEUED` → `IN_PROGRESS` → `DONE` / `FAILED`
> **Rule**: Execute tasks in order. Do NOT skip ahead. Run `npm run validate` after each.

---

## Sprint A — Hero Identity & Level System

> **Goal**: Make XP meaningful. Give users a persistent hero with a level, title,
> and name. Every node completion feeds into visible character progression.
> The level-up moment should feel like a real event, not a counter increment.

### TASK A1: DB Migration — Hero Columns & Level Function
**Status**: `DONE`
**Scope**: Supabase migration only — no app code changes

**What to do**:
1. Create migration `supabase/migrations/20260410_hero_level_system.sql`
2. Add columns to `profiles`:
   - `hero_name TEXT` (nullable — user sets it on first visit)
   - `hero_level INT NOT NULL DEFAULT 1`
   - `hero_title TEXT NOT NULL DEFAULT 'Wanderer'`
3. Create function `compute_level_from_xp(p_xp INT) RETURNS INT`:
   - Formula: `floor(0.5 + sqrt(p_xp / 25.0))`  — minimum return 1
   - Level 2 = 100 XP, Level 5 = 700 XP, Level 10 = 2500 XP, Level 20 = 10000 XP
4. Create function `title_for_level(p_level INT) RETURNS TEXT`:
   - 1→'Wanderer', 5→'Oath-Bound', 10→'Ironsworn', 15→'Flamewarden',
     20→'Duskwalker', 30→'Shadowforged', 40→'Mythbreaker', 50→'Vow Eternal'
   - Returns the title for the highest threshold ≤ p_level
5. Modify `increment_profile_xp(p_user_id, p_xp)`:
   - After incrementing total_xp, compute new level via `compute_level_from_xp`
   - If level changed: update `hero_level` and `hero_title` on the profile row
   - Change return type from `INT` to `JSONB`:
     `{"new_total_xp": N, "new_level": N, "previous_level": N, "leveled_up": bool, "new_title": "..."}`
6. Backfill existing profiles: `UPDATE profiles SET hero_level = compute_level_from_xp(total_xp), hero_title = title_for_level(compute_level_from_xp(total_xp))`

**Validation**: Run `npx supabase migration list` — new migration shows. Test RPC via `npx supabase db execute`.

---

### TASK A2: Backend — Profile & Node Endpoint Updates
**Status**: `DONE`
**Depends on**: A1

**What to do**:
1. `app/api/v1/profile.py` — Add `PATCH ""` endpoint:
   - Accepts `{"hero_name": "string"}` body (1-30 chars, alphanumeric + spaces)
   - Calls `supa.upsert_profile(user_id, {"hero_name": name})`
   - Returns updated profile envelope
2. `app/core/supabase.py` — Update `add_xp_to_profile`:
   - RPC now returns JSONB instead of INT
   - Parse the JSON response: extract `new_total_xp`, `new_level`, `previous_level`, `leveled_up`, `new_title`
   - Return full dict instead of just int
3. `app/api/v1/nodes.py` — Update `complete_node`:
   - `add_xp_to_profile` now returns dict — destructure it
   - Add to response data: `leveled_up`, `new_level`, `previous_level`, `new_title`
   - Keep existing `xp_earned` and `total_xp` fields for backward compat
4. `app/schemas/` — Add `ProfileUpdate` Pydantic schema for the PATCH body validation

**Validation**: `pytest` passes. Manual test: complete a node near level threshold, verify `leveled_up: true` in response.

---

### TASK A3: Frontend Types, API Client & Store Updates
**Status**: `DONE`
**Depends on**: A2

**What to do**:
1. `types/index.ts` — Extend `UserProfile`:
   - Add `hero_name: string | null`, `hero_level: number`, `hero_title: string`
2. `lib/api.ts` — Add `updateProfile` method:
   - `PATCH /api/v1/profile` with `{ hero_name }` body
   - Returns `ApiResponse<UserProfile>`
3. `lib/api.ts` — Update `completeNode` response type:
   - Add `leveled_up: boolean`, `new_level: number`, `previous_level: number`, `new_title: string`
4. `stores/userStore.ts` — Extend store:
   - Add `setHeroName(name: string)` action
   - Add `setLevel(level: number, title: string)` action
   - Modify `addXp` to also accept level info

**Validation**: `npx tsc --noEmit` passes. No runtime changes yet — just type plumbing.

---

### TASK A4: StatsBar Redesign — Level-Centric Display
**Status**: `DONE`
**Depends on**: A3

**What to do**:
1. `components/ui/StatsBar.tsx` — Replace current XP-centric layout:
   - **Left section**: Hero level (large gold Cinzel number) + title below in muted text
   - **Middle section**: XP progress bar to next level (replace hardcoded `XP_MILESTONE = 500` with real level thresholds)
     - Label: `{currentXp} / {xpForNextLevel} XP` in small muted text
     - Progress bar: gold fill with glow, same visual style as current
   - **Right section**: Day Streak (keep as-is)
2. Add props: `heroLevel: number`, `heroTitle: string` (alongside existing `totalXp`, `currentStreak`)
3. Compute XP thresholds client-side: `xpForLevel(n) = 25 * n * n` — matches the DB function
4. Show XP within current level: `currentLevelXp = totalXp - xpForLevel(heroLevel)`, `neededXp = xpForLevel(heroLevel + 1) - xpForLevel(heroLevel)`
5. Update `VowChamberPage` (`vows/page.tsx`) to pass new props from profile data

**Validation**: `npm run build` passes. Visual check: level + progress bar renders correctly.

---

### TASK A5: Dashboard Header — Level Badge
**Status**: `DONE`
**Depends on**: A3

**What to do**:
1. `dashboard/page.tsx` — Modify the header stats section (lines 159-229):
   - Replace raw XP display with: `Lv.{level}` in large gold Cinzel + hero title below
   - Keep streak display as-is
   - Add hero name to the left side if set (next to logo or as a subtitle)
2. Style: level number uses `--accent-gold` with text-shadow glow, title in `--text-muted`, Cinzel uppercase

**Validation**: `npm run build` passes. Visual consistency with landing page aesthetic.

---

### TASK A6: Level-Up Modal
**Status**: `DONE`
**Depends on**: A3

**What to do**:
1. Create `components/ui/LevelUpModal.tsx`:
   - Full-screen fixed overlay with dark backdrop (`rgba(10,10,18,0.85)`)
   - Center content: radial ember glow behind text
   - Large Cinzel heading: `LEVEL {N}` with gold gradient text
   - Subtitle if title changed: `You are now known as "{title}"`
   - XP earned line: `+{xp} XP`
   - Single CTA button: "Continue" in ember style
   - Entry animation: fade in + scale up (CSS transition, 300ms)
2. Props: `level: number`, `title: string`, `titleChanged: boolean`, `previousTitle: string`, `xpEarned: number`, `onClose: () => void`
3. Integration point: `TreeViewPage.tsx` — after `handleNodeUpdate` gets a response with `leveled_up: true`, show the modal
4. Store the pending level-up in a local state (not Zustand — it's ephemeral to this interaction)

**Validation**: `npm run build` passes. Trigger manually by mocking a level-up response.

---

### TASK A7: Hero Naming Flow
**Status**: `DONE`
**Depends on**: A5, A6

**What to do**:
1. Create `components/ui/HeroNamingModal.tsx`:
   - Full-screen overlay, same dark backdrop as LevelUpModal
   - Heading: "What Shall They Call You?" (Cinzel, gold)
   - Subtitle: "Choose the name that will echo through the dark." (Crimson Pro, italic, muted)
   - Text input: max 30 chars, Cinzel font, ember border on focus, centered
   - Validation: 1-30 chars, letters/spaces/hyphens only
   - CTA button: "Seal My Name" — calls `api.updateProfile`
   - No skip/cancel — hero name is required (but can be changed later)
2. Trigger: `dashboard/page.tsx` — after profile loads, if `hero_name === null`, show modal
3. On submit: save via API, update userStore, dismiss modal

**Validation**: `npm run build` passes. Flow: new user signs up → lands on dashboard → naming modal appears → submits name → modal closes → name visible in header.

---

## Blocked / Needs Decision

### TASK 2C-1: WoW-Style Tree Grid Layout
**Status**: `BLOCKED` — needs design decision
- Current layout is Dagre auto-layout (left-to-right). WoW trees are top-down grid with fixed columns. Switch completely or keep Dagre as fallback?
- WoW has 3 separate talent panels. Multiple panels per tree, or keep single tree?
- Node shapes: keep circle/square/diamond/hexagon per type, or go uniform square icons like WoW?
- What background treatment for the tree panel?

### TASK 2C-2: Node Icon Image Generation Research
**Status**: `BLOCKED` — needs research/budget decision
- Budget per tree gen is currently ~$0.01 (Gemini only). Adding 20-30 image gens could add $0.20–$2.00+.
- Speed: image gen could push tree creation from 30s to 5-10 minutes. Acceptable?
- Style consistency approach: LoRA fine-tuning, style prompt engineering, or pre-generated icon library?
- Provider options: Flux, DALL-E 3, Replicate SD, or hybrid pre-generated library.

### TASK 2C-3: Tree Background Generation
**Status**: `BLOCKED` — depends on 2C-2 results

---

## Completed Tasks

| Task | Description | Completed |
|------|-------------|-----------|
| 2A-1 | Auth Page Visual Refactor | 2026-03-31 |
| 2A-2 | Tree Wizard Visual Refactor | 2026-03-31 |
| 2A-3 | Dashboard Visual Refactor | 2026-03-31 |
| 2A-4 | Follow-Up "Something Else" Freetext Option | 2026-03-31 |
| 2B-1 | Google OAuth Implementation | 2026-03-31 |
| 3A-1 | Remove Nodes Done Stat from Dashboard | 2026-04-02 |
| 3B-1 | Ember Database Table & API Endpoints | 2026-04-02 |
| 3B-2 | Frontend API Client & Types for Embers | 2026-04-02 |
| 3B-3 | Brazier Component — Visual Container | 2026-04-02 |
| 3B-4 | Add Ember Form & Drop Animation | 2026-04-02 |
| 3B-5 | Brazier Integration — Dashboard + API Wiring | 2026-04-02 |
| P1-1 | Hub Page — Layout & Atmosphere | 2026-04-02 |
| P1-2 | Vow Chamber Page — Tree List Migration | 2026-04-02 |
| P1-3 | Hub Door Active State — Live Data on Vow Chamber | 2026-04-02 |
| P1-4 | Update Auth Redirect & Navigation Flow | 2026-04-02 |
| P1-5 | Move Brazier to Hearth Placeholder | 2026-04-02 |
| 2B-1 | Asset Optimization (dashboard assets) | 2026-04-02 |
| 2B-2 | Dashboard Page Background | 2026-04-02 |
| 2B-3 | Card Component — Texture & Styling | 2026-04-02 |
| 2B-4 | Card Icon — Vow Chamber (Anvil Video) | 2026-04-02 |
| 2B-5 | Card Icon — The Hearth (Brazier) | 2026-04-02 |
| 2B-6 | Card Icon — The Dungeon (Sealed Door) | 2026-04-02 |
| 2B-7 | Typography & Label Polish | 2026-04-02 |
| 2B-8 | Performance Validation | 2026-04-02 |
| 4A-1 | Dashboard Card Polish — Image Sizes & Dungeon CTA | 2026-04-05 |
| 4A-2 | Dungeon Page Scaffold — Layout, Background & Navigation | 2026-04-05 |
| 4A-3 | Dungeon Timer Engine — Pomodoro Logic | 2026-04-05 |
| 4A-4 | Dungeon Timer UI — Dark Fantasy Interface | 2026-04-05 |
| 4A-5 | Dungeon Polish & Validation | 2026-04-05 |

---

---

## Sprint B — Daily Quest System

> **Goal**: Give users a reason to open the app every day. AI generates recurring
> daily tasks alongside milestone nodes. Dashboard shows today's quests with
> checkboxes. Tree view shows a quest log overlay. Completing dailies awards XP,
> feeds streaks, and progresses the hero.

### TASK B1: DB Migration — Daily Quest Tables
**Status**: `QUEUED`
**Scope**: Supabase migration only

**What to do**:
1. Create migration `supabase/migrations/20260411_daily_quests.sql`
2. Create table `daily_quests`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `tree_id UUID NOT NULL REFERENCES talent_trees(id) ON DELETE CASCADE`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `title TEXT NOT NULL`
   - `description TEXT NOT NULL`
   - `xp_reward INT NOT NULL DEFAULT 15`
   - `sort_order INT NOT NULL DEFAULT 0`
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
3. Create table `daily_quest_completions`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `quest_id UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `completed_date DATE NOT NULL DEFAULT CURRENT_DATE`
   - `UNIQUE(quest_id, user_id, completed_date)` — one completion per quest per day
4. RLS policies: users can only see/modify their own quests and completions
5. Indexes on `daily_quests(tree_id)`, `daily_quests(user_id)`, `daily_quest_completions(user_id, completed_date)`

**Validation**: Migration applies cleanly.

---

### TASK B2: AI Prompt — Generate Daily Quests with Trees
**Status**: `QUEUED`
**Depends on**: B1

**What to do**:
1. Modify `backend/app/prompts/generate_tree.txt`:
   - Add a `daily_quests` array to the JSON output schema
   - Each daily quest: `{ "id": "dq_1", "title": "...", "description": "...", "xp_reward": 15 }`
   - Instruct AI: "Generate 3-5 daily recurring tasks that support the goal. These are habits the user should do EVERY DAY (e.g., 'Practice for 20 minutes', 'Review yesterday's notes'). They are separate from milestone nodes."
   - XP rewards for dailies: 10-25 range (lower than milestone nodes)
2. Update `backend/app/services/gemini.py`:
   - Add `_AIDailyQuest` Pydantic model with id, title, description, xp_reward
   - Add `daily_quests: list[_AIDailyQuest]` to `_AITreeResponse`
3. Update `backend/app/core/supabase.py` — `save_generated_tree`:
   - After saving nodes, also bulk-insert daily_quests from `ai_result["daily_quests"]`
   - Return daily quests as part of the tree response

**Validation**: Generate a test tree and verify daily_quests appear in the response JSON.

---

### TASK B3: Backend — Daily Quest API Endpoints
**Status**: `QUEUED`
**Depends on**: B1

**What to do**:
1. Create `backend/app/api/v1/quests.py` with routes:
   - `GET /api/v1/quests/today` — returns all daily quests for user's active trees, with today's completion status
     - Response: `{ "data": [{ quest fields..., "completed_today": bool }], "error": null }`
   - `POST /api/v1/quests/{quest_id}/complete` — mark a quest as completed for today
     - Awards XP via `add_xp_to_profile`, records daily activity, updates streak
     - Returns: `{ "data": { "quest_id": "...", "xp_earned": N, "total_xp": N, "leveled_up": bool, ... }, "error": null }`
   - `DELETE /api/v1/quests/{quest_id}/complete` — un-complete a quest for today (undo misclick)
2. Create `backend/app/schemas/quests.py` with response schemas
3. Add supabase.py helpers:
   - `list_daily_quests(user_id)` — all quests for active trees
   - `get_today_completions(user_id)` — today's completion records
   - `complete_daily_quest(quest_id, user_id)` — insert completion + award XP
   - `uncomplete_daily_quest(quest_id, user_id)` — delete today's completion
4. Register router in `backend/app/api/v1/__init__.py`

**Validation**: Backend imports clean. Manual test via `/docs`.

---

### TASK B4: Frontend Types & API Client for Daily Quests
**Status**: `QUEUED`
**Depends on**: B3

**What to do**:
1. `types/index.ts` — Add:
   - `DailyQuest` interface: `id, tree_id, title, description, xp_reward, completed_today`
   - `DailyQuestCompletionResult` interface (mirrors node completion: xp_earned, total_xp, leveled_up, etc.)
2. `lib/api.ts` — Add:
   - `getTodayQuests(token)` → `GET /api/v1/quests/today`
   - `completeQuest(questId, token)` → `POST /api/v1/quests/{questId}/complete`
   - `uncompleteQuest(questId, token)` → `DELETE /api/v1/quests/{questId}/complete`

**Validation**: `npx tsc --noEmit` passes.

---

### TASK B5: Vow Chamber — Daily Quests Below Tree Cards
**Status**: `QUEUED`
**Depends on**: B4

**What to do**:
1. Modify `TreeCard` component in `vows/page.tsx`:
   - Accept optional `dailyQuests: DailyQuest[]` prop
   - Render 3-5 daily quests below the progress bar as a compact checklist
   - Each quest: checkbox + title + XP reward on the right
   - Completed quests: muted text, checked checkbox, strikethrough title
   - Uncompleted: ember-colored checkbox border, normal text
   - Click toggles completion (calls API, optimistic update)
2. Fetch today's quests alongside trees in `VowChamberPage`:
   - Call `api.getTodayQuests(token)` in the initial data load
   - Group quests by `tree_id` and pass to each `TreeCard`
3. Add a "Resets in Xh Ym" timer below the quest list (time until midnight UTC)
4. Show level-up modal if quest completion triggers a level-up
5. Style: compact, muted — this is secondary to the tree card itself. Small text, minimal padding.

**Validation**: `npm run build` passes. Visual: quests appear under each tree card.

---

### TASK B6: Tree View — Quest Log Overlay
**Status**: `QUEUED`
**Depends on**: B4

**What to do**:
1. Create `components/tree/QuestLogPanel.tsx`:
   - Fixed-position panel in upper-left corner of the tree canvas
   - Collapsible (click header to toggle)
   - Shows daily quests for the current tree only
   - Same checklist UX as B5 (checkbox + title + XP)
   - Collapsed state: just the header with quest count ("Daily Quests 2/4")
2. Style: semi-transparent bg (`rgba(18,18,26,0.85)`), thin border, small text
   - Should not interfere with tree canvas interaction
   - Width: 260px max, positioned with padding from edge
3. Integrate into `TreeViewPage.tsx`:
   - Fetch quests for current tree on load
   - Render `QuestLogPanel` over the canvas
   - Quest completions trigger XP/level-up updates same as node completions

**Validation**: `npm run build` passes. Panel renders over tree canvas without blocking interaction.

---

## Sprint Backlog (Future Sprints — Not Yet Specified)

| Sprint | Theme | Status |
|--------|-------|--------|
| Sprint C | Dungeon AFK Combat Overhaul | `PLANNED` |
| Sprint D | Hearth Page + Ember Economy | `PLANNED` |
