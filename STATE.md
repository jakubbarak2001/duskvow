# STATE.md — Duskvow Living Project State

> **Purpose**: Decisions log + current state snapshot. Updated every session.
> Coding standards, visual rules, and workflow are in CLAUDE.md (single source of truth).
>
> Last updated: 2026-04-14

---

## DECISIONS LOG (Append-Only)

> Format: `[DATE] DECISION: <what> — REASON: <why>`

[2026-03-30] DECISION: Use Dagre for tree layout instead of AI-provided positions — REASON: AI positions were inconsistent and overlapping. Dagre gives clean left-to-right hierarchical layout every time. See `TreeCanvas.tsx` `applyDagreLayout()`.

[2026-03-30] DECISION: Landing page uses scoped CSS (template literal in page.tsx) with `lp-` prefix — REASON: Avoids collision with app-wide Tailwind/globals. Landing uses Crimson Pro serif for body text (literary/dark tone), while app pages use Inter.

[2026-03-30] DECISION: Optimistic UI updates for node completion — REASON: Waiting for server round-trip made completion feel sluggish (10s+). Now: update Zustand store immediately, revert if API fails. See `TreeViewPage.tsx` `handleNodeUpdate`.

[2026-03-30] DECISION: `completionPending` flag in treeStore blocks concurrent completions — REASON: Users were rapid-clicking and creating race conditions with multiple PATCH calls.

[2026-03-30] DECISION: Supabase anon key hardcoded in `next.config.ts` as fallback — REASON: Cloudflare Pages static export doesn't inject env vars at build time without the `write-env.mjs` prebuild script. The anon key is NOT a secret (protected by RLS).

[2026-03-30] DECISION: TreeViewPage loaded via `dynamic(() => ..., { ssr: false })` — REASON: React Flow requires browser APIs. The wrapper pattern (`TreeViewPageWrapper.tsx`) keeps the dynamic import in a Client Component.

[2026-03-30] DECISION: Dashboard progress reads from tree aggregate fields (`completed_nodes`, `earned_xp` on the tree object) — REASON: Counting individual node states on every render is expensive. Backend keeps these counts in sync on every node state change.

[2026-03-30] DECISION: Generation rate limiting (2/day free tier) tracked server-side with `GenerationStatus` endpoint — REASON: Client-side limits are trivially bypassed.

[2026-03-30] DECISION: Active tree cap (currently 5) prevents users from hoarding unfinished trees — REASON: Forces focus, reduces AI generation abuse.

[2026-03-31] DECISION: `--accent-gold` is ONLY for XP numbers, node completion states, rarity indicators, progress bar fills, and the logo. All page headings use `--text-primary`. Ornamental labels/dividers use `--text-secondary`/`--text-muted`/`--gold-dim`.

[2026-04-11] DECISION: Dungeon combat is template-based, not AI-generated — REASON: AI calls during a focus session add latency, cost, and fragility. Monster pools, events, and loot tables are curated JSON (`backend/app/data/dungeon_pools.json`). Randomness comes from weighted selection, not generation. This means instant dungeon starts and zero API cost per session.

[2026-04-11] DECISION: Dungeon events pre-rolled at start, ticked forward by elapsed time — REASON: The user's timer IS the dungeon. Events have `trigger_at_seconds` and appear in the feed as time elapses. This lets the frontend work offline after start (only needs backend for start/complete/retreat). Handles tab switches and phone-in-pocket scenarios gracefully.

[2026-04-11] DECISION: Daily quests with `estimated_minutes` link to dungeon sessions — REASON: "Practice guitar for 25 min" should naturally become "enter a 25-min dungeon." The quest is auto-completed when the dungeon finishes. This connects two previously-isolated systems and gives the dungeon a reason to exist beyond "focus timer."

[2026-04-11] DECISION: Retreat = partial XP, zero loot — REASON: The user needs a reason to finish. Retreating is not punished harshly (you still get proportional XP) but the loot loss creates meaningful stakes. This activates Octalysis CD8 (Loss & Avoidance) without being cruel.

[2026-04-11] DECISION: One active dungeon run per user (DB constraint) — REASON: Prevents gaming the system with parallel runs. Simplifies frontend state — there's always 0 or 1 active run.

[2026-04-11] DECISION: Loot items are simple consumable buffs, not a full inventory RPG — REASON: Keep scope manageable. 6 item types, all consumable, stored in a flat table. No equipment slots, no crafting, no trading. Can expand later without schema changes.

[2026-04-11] DECISION: Level unlocks and streak bonuses configured in JSON, not DB — REASON: `backend/app/data/level_unlocks.json` is the single source of truth for all progression thresholds. Easy to tune without migrations. Backend services load and cache it.

[2026-04-11] DECISION: Achievement evaluation is trigger-based, not polling — REASON: `check_and_award()` only runs relevant checks based on the trigger type (node_complete, dungeon_complete, etc.), preventing unnecessary DB queries. Each trigger maps to a subset of achievements.

[2026-04-11] DECISION: Streak milestone toasts reuse AchievementToast with ember variant — REASON: Avoids a separate component. The queue system in AchievementProvider handles both achievement and streak milestone toasts sequentially.

[2026-04-14] DECISION: Disable Gemini 2.5 Flash thinking mode for tree generation (`thinking_config=ThinkingConfig(thinking_budget=0)`) — REASON: Thinking on by default was adding 30-80s of internal reasoning tokens to a task that is "fill a strict schema," not a reasoning task. Verified empirically: long prompts (~600 words) were timing out at 90s in prod. With thinking disabled, the same prompt completes in ~11s. Do NOT set budget to -1 (dynamic is what broke) or 512 (2.5 Flash burns the whole budget unnecessarily). Only 0 or off.

[2026-04-14] DECISION: Post-hoc structural validation in `_validate_tree` (exactly 1 mythic, ≥2 nodes in every Tier 2-5 row) — REASON: Insurance policy for running 2.5 Flash without thinking. The model could theoretically miscount tiers without its reasoning budget; the validator catches violations and raises 502 so the retry path in `generate_tree` picks them up. Defense-in-depth alongside the prompt rules, not a replacement.

[2026-04-14] DECISION: `generate_tree` retries ONCE on 502 OR 504 (not just 504) with `temperature=0.5` — REASON: Real post-thinking-disable flakiness is malformed/structurally-invalid trees (caught as 502 by `_validate_tree`), not timeouts. A 504-only retry papers over almost nothing. Two retries compound latency so we cap at one. Non-502/504 errors (auth, network, rate limit) re-raise immediately.

[2026-04-14] DECISION: Removed `edges` from the AI schema and prompt entirely — REASON: `save_generated_tree` never read `ai_result["edges"]` — React Flow derives edges from `node.prerequisites` in `TreeCanvas.tsx:207-220`. The `edges` field was dead weight, AND the prompt said `{"from","to"}` while the schema expected `{"source","target"}` — a silent mismatch that was costing output tokens and confusing the model. One cleanup fixed both.

[2026-04-14] DECISION: Structured JSON logging for every Gemini call (`gemini_call` event with `model`, `elapsed_ms`, `prompt_chars`, `status`) via stdlib `logging` — REASON: Plain-text `elapsed_ms=8123` makes p50 eyeballable but p95 impossible without shell-fu. JSON lets us `jq '.elapsed_ms' | sort -n` directly from Railway log export. This is the measurement tool that will tell us whether we actually hit the "p95 < 30s" target in prod.

[2026-04-14] DECISION: `ai_timeout_seconds` 90 → 45; frontend client timeout 55s in `api.ts submitFollowUp` — REASON: With thinking disabled, 45s is ~3x our p95 target so it catches real stalls without making users stare at a spinner for 1.5 minutes. The 55s / 45s gap (10s slack) ensures the backend's 504 usually wins the race over the client's abort — Vercel edge + Next.js overhead eats most of that gap. On client abort, `request()` returns a distinct `TIMEOUT` error code with a user-friendly message instead of the stale `NETWORK_ERROR` ("check your connection") which was wrong for the timeout case.

---

## CURRENT STATE

### What's Built & Working
- [x] **Landing page** — Full dark fantasy design with ember particles, noise overlay, Cinzel/Crimson Pro typography
- [x] **Auth flow** — Supabase email/password + Google OAuth, auth guard on protected routes
- [x] **Hub (`/dashboard`)** — Three door cards: Vow Chamber (unlocked), Dungeon (unlocked, shows active run status), Hearth (locked). Hero name links to profile. Level badge. Streak with multiplier badge + "flame dims" at-risk indicator. Unclaimed loot reminder banner.
- [x] **Vow Chamber (`/vows`)** — Tree management: New Vow CTA, dynamic generation limits with next unlock hint, StatsBar with streak multiplier + milestone hints, tree list (active/finished), delete confirmation, daily quest checklists per tree with dungeon links
- [x] **Tree creation wizard** — 3-step flow: goal input → AI follow-up → generating → tree view
- [x] **Interactive skill tree** — React Flow canvas, custom nodes (circle/square/diamond/hexagon), Dagre layout, zoom/pan, node states, tier glows
- [x] **Node detail panel** — Slide-in panel: description/type/tier/XP/status, Start/Complete/Reset with optimistic updates, XP breakdown with streak bonus after completion
- [x] **Node completion flow** — Optimistic update, XP tracking, prerequisite auto-unlock, completion pending lock, streak milestone toast
- [x] **Hero & Level System** — hero_name, hero_level, hero_title. Titles: Wanderer→Vow Eternal. Level-up modal. Hero naming flow.
- [x] **Hero Profile (`/profile`)** — Full character sheet: Hero Identity (level badge, XP bar, streak info), Stats Grid (8 stat cards), Achievement Grid (earned vs locked), Inventory (items with Use button, rarity colors), Path of Ascension (level unlock timeline)
- [x] **Daily Quest System** — AI generates 3-5 per tree (with `estimated_minutes`). Backend: GET/POST/DELETE. Frontend: Vow Chamber checklist + Tree View QuestLogPanel overlay. Streak milestone toasts on threshold crossings.
- [x] **Dungeon AFK Combat** — Full dungeon system: 4 tiers (Shallow Crypts → Abyssal Rift) with "Unlocks at Lv.N" on locked tiers, duration picker, optional quest/node linking, pre-rolled event generation, real-time event feed, floor progress bar, retreat confirmation, battle report with loot display + Collect All button → inventory, XP breakdown with streak bonus, quest auto-completion, browser notifications, level-up integration.
- [x] **Progression System** — Level-gated features: dynamic generation limits (2→5), active tree caps (5→10), dungeon tier access. Streak XP multiplier (3-day=+5%, 7-day=+10%, 14-day=+15%, 30-day=+20%). All configured in `level_unlocks.json`.
- [x] **Achievement System** — 13 one-time badges across 4 categories (tree/dungeon/quest/meta). Trigger-based evaluation. Toast notifications with sequential queue. Profile grid shows earned vs locked.
- [x] **Inventory System** — Dungeon loot → claim to hero_inventory. Consumable items with Use button. Ember Shard streak protection. Profile inventory section.
- [x] **Embers/Brazier** — `embers` table + CRUD API. Brazier component with add/delete/glow.
- [x] **Hearth (`/hearth`)** — Atmospheric page with Brazier. "Coming soon" for trophy room/customization.
- [x] **Backend API** — FastAPI: profile (with stats/unlocks), trees CRUD, nodes, AI generation, rate limiting, embers, quests, dungeon, achievements, inventory (with claim/use/unclaimed)
- [x] **Database** — Supabase PostgreSQL: profiles (with streak_multiplier, achievements_count), talent_trees, skill_nodes, daily_activity, embers, daily_quests, daily_quest_completions, dungeon_runs, dungeon_events, dungeon_loot, hero_inventory, hero_achievements. All with RLS.

### Known Issues
- [ ] Tree layout can be ugly with 25+ nodes (Dagre nodesep/ranksep tuning needed)
- [ ] Node completion visual feedback is flat (no particle burst yet)
- [ ] No automated tests (backend has minimal scaffolding only)
- [ ] No error boundaries (React Flow crashes can take down the page)
- [ ] Unpushed migrations: `20260410_hero_level_system.sql`, `20260411_daily_quests.sql`, `20260412_dungeon_system.sql`, `20260413_progression_system.sql`, `20260413_streak_multiplier_in_rpc.sql`

### What's Next
1. Sprint E — Daily Quest Enhancement (quest pools, rotation, streak bonuses)
2. Sprint F — Tree Experience Polish (celebrations, fog of war, choice branching)
3. Sprint G — Hearth Page + Ember Economy (ember buffs, journal → XP, loot spending)

### File Change Log (Current Session)

**Session: 2026-04-14 (Tree generation latency fix — thinking mode off)**
- `backend/app/services/gemini.py` — `thinking_config=ThinkingConfig(thinking_budget=0)` on `_quality_config`; removed `_AIEdge` class and `edges` field; added structural validation in `_validate_tree` (mythic count, Tier 2-5 cardinality); added 502/504 retry in `generate_tree` with lower temperature; structured `gemini_call` logging in `_call`; added `logging`/`time` imports and module logger
- `backend/app/prompts/generate_tree.txt` — compressed 118 → 68 lines: dropped the full JSON shape example (source of the `from`/`to` vs `source`/`target` mismatch) and the guitar example; KEPT rules 1-5 and "WHY THESE RULES MATTER" verbatim (load-bearing constraints); added explicit field list in intro since schema example is gone
- `backend/app/core/config.py` — `ai_timeout_seconds: 90 → 45`
- `backend/app/core/supabase.py` — `save_generated_tree` docstring no longer references `edges[]`
- `frontend/src/lib/api.ts` — `request<T>()` gains optional `timeoutMs`: `AbortController` + cleared `setTimeout`, `DOMException AbortError → TIMEOUT` error code with distinct user message; `submitFollowUp` passes `55_000`
- `frontend/src/components/tree-wizard/GeneratingStep.tsx` — "up to 30 seconds" → "up to a minute"

**Session: 2026-04-11 (Sprint D — Progression & Unlocks)**
- `supabase/migrations/20260413_progression_system.sql` — hero_inventory, hero_achievements tables + profile columns + RPCs
- `supabase/migrations/20260413_streak_multiplier_in_rpc.sql` — Updated update_streak_atomic to return JSONB with milestone info
- `backend/app/data/level_unlocks.json` — Level-gated features, generation limits, tree caps, streak bonuses
- `backend/app/data/achievements.json` — 13 achievement definitions across 4 categories
- `backend/app/services/progression.py` — Level unlock logic, streak multiplier, generation/tree cap helpers
- `backend/app/services/achievements.py` — Achievement tracking: check_and_award with trigger-based evaluation
- `backend/app/api/v1/achievements.py` — GET /api/v1/achievements endpoint
- `backend/app/api/v1/inventory.py` — CRUD + claim + use + unclaimed count endpoints
- `backend/app/api/v1/profile.py` — Added /unlocks and /stats endpoints
- `backend/app/api/v1/__init__.py` — Registered achievements + inventory routers
- `backend/app/api/v1/nodes.py` — Streak multiplier on XP, achievement checks, streak_milestone in response
- `backend/app/api/v1/quests.py` — Streak multiplier on XP, achievement checks, streak_milestone in response
- `backend/app/api/v1/dungeon.py` — Streak multiplier on XP, achievement checks, streak_milestone in response
- `backend/app/core/supabase.py` — Many new helpers: achievements, inventory, profile stats, unclaimed loot
- `frontend/src/types/index.ts` — StreakMilestone, Achievement, InventoryItem, LevelUnlock, ProfileStats, LootClaimResult + updated completion results
- `frontend/src/lib/api.ts` — 8 new API methods for achievements, inventory, unlocks, stats, unclaimed loot
- `frontend/src/components/ui/AchievementToast.tsx` — Toast with variant support (achievement=gold, streak=ember)
- `frontend/src/components/ui/AchievementProvider.tsx` — Queue-based toast context with showStreakMilestone
- `frontend/src/components/ui/StatsBar.tsx` — Streak multiplier badge + next milestone hint
- `frontend/src/components/tree/NodeDetailPanel.tsx` — XP breakdown display after completion, streak milestone toast
- `frontend/src/components/tree/TreeViewPage.tsx` — Streak multiplier in StatsBar, streak milestone toasts
- `frontend/src/components/dungeon/BattleReport.tsx` — Collect All button with real claim API, XP streak breakdown
- `frontend/src/app/layout.tsx` — AchievementProvider wrapping app
- `frontend/src/app/profile/page.tsx` — Full hero profile page
- `frontend/src/app/dashboard/page.tsx` — Hero name→profile link, streak multiplier badge, flame dims indicator, unclaimed loot banner
- `frontend/src/app\vows/page.tsx` — Next generation unlock hint, streak milestone toasts
- `frontend/src/app/dungeon/page.tsx` — Lock icon on locked tiers, streak milestone toasts, runId passed to BattleReport

> Older session logs archived in git history. See `git log --oneline` for file-level diffs.

---

## KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Design tokens | `frontend/src/app/globals.css` |
| Landing page (visual reference) | `frontend/src/app/page.tsx` |
| API client | `frontend/src/lib/api.ts` |
| TypeScript types | `frontend/src/types/index.ts` |
| Tree state store | `frontend/src/stores/treeStore.ts` |
| User state store | `frontend/src/stores/userStore.ts` |
| Tree rendering | `frontend/src/components/tree/TreeCanvas.tsx` |
| Node interaction | `frontend/src/components/tree/TreeViewPage.tsx` |
| Supabase client (FE) | `frontend/src/lib/supabase.ts` |
| Supabase client (BE) | `backend/app/core/supabase.py` |
| AI prompts | `backend/app/prompts/generate_tree.txt` |
| Auth hook | `frontend/src/hooks/useUser.ts` |
| Dungeon pools | `backend/app/data/dungeon_pools.json` |
| Dungeon service | `backend/app/services/dungeon.py` |
| Dungeon API | `backend/app/api/v1/dungeon.py` |
| Battle Report | `frontend/src/components/dungeon/BattleReport.tsx` |
| Level unlocks config | `backend/app/data/level_unlocks.json` |
| Achievements config | `backend/app/data/achievements.json` |
| Progression service | `backend/app/services/progression.py` |
| Achievement service | `backend/app/services/achievements.py` |
| Hero Profile | `frontend/src/app/profile/page.tsx` |
| Achievement toast | `frontend/src/components/ui/AchievementProvider.tsx` |
