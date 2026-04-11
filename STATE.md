# STATE.md — Duskvow Living Project State

> **Purpose**: Decisions log + current state snapshot. Updated every session.
> Coding standards, visual rules, and workflow are in CLAUDE.md (single source of truth).
>
> Last updated: 2026-04-11

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

---

## CURRENT STATE

### What's Built & Working
- [x] **Landing page** — Full dark fantasy design with ember particles, noise overlay, Cinzel/Crimson Pro typography
- [x] **Auth flow** — Supabase email/password + Google OAuth, auth guard on protected routes
- [x] **Hub (`/dashboard`)** — Three door cards: Vow Chamber (unlocked), Dungeon (unlocked, shows active run status), Hearth (locked). Hero name + level badge header.
- [x] **Vow Chamber (`/vows`)** — Tree management: New Vow CTA, generation status, StatsBar, tree list (active/finished), delete confirmation, daily quest checklists per tree with dungeon links for timed quests
- [x] **Tree creation wizard** — 3-step flow: goal input → AI follow-up → generating → tree view
- [x] **Interactive skill tree** — React Flow canvas, custom nodes (circle/square/diamond/hexagon), Dagre layout, zoom/pan, node states, tier glows
- [x] **Node detail panel** — Slide-in panel: description/type/tier/XP/status, Start/Complete/Reset with optimistic updates
- [x] **Node completion flow** — Optimistic update, XP tracking, prerequisite auto-unlock, completion pending lock
- [x] **Hero & Level System** — hero_name, hero_level, hero_title. Titles: Wanderer→Vow Eternal. Level-up modal. Hero naming flow.
- [x] **Daily Quest System** — AI generates 3-5 per tree (now with `estimated_minutes` for timed quests). Backend: GET/POST/DELETE. Frontend: Vow Chamber checklist + Tree View QuestLogPanel overlay.
- [x] **Dungeon AFK Combat** — Full dungeon system: 4 tiers (Shallow Crypts → Abyssal Rift), tier selection cards, duration picker, optional quest/node linking, pre-rolled event generation from curated JSON pools, real-time event feed, floor progress bar, retreat confirmation, battle report with loot display, XP/streak awards, quest auto-completion, browser notifications, level-up integration, page visibility handling.
- [x] **Embers/Brazier** — `embers` table + CRUD API. Brazier component with add/delete/glow.
- [x] **Hearth (`/hearth`)** — Atmospheric page with Brazier. "Coming soon" for trophy room/customization.
- [x] **Backend API** — FastAPI: profile, trees CRUD, nodes, AI generation, rate limiting, embers, quests, dungeon (6 endpoints)
- [x] **Database** — Supabase PostgreSQL: profiles, talent_trees, skill_nodes, daily_activity, embers, daily_quests, daily_quest_completions, dungeon_runs, dungeon_events, dungeon_loot. All with RLS.

### Known Issues
- [ ] Tree layout can be ugly with 25+ nodes (Dagre nodesep/ranksep tuning needed)
- [ ] Node completion visual feedback is flat (no particle burst yet)
- [ ] No automated tests (backend has minimal scaffolding only)
- [ ] No error boundaries (React Flow crashes can take down the page)
- [ ] Unpushed migrations: `20260410_hero_level_system.sql`, `20260411_daily_quests.sql`, `20260412_dungeon_system.sql`

### What's Next
1. Sprint D — Progression & Unlocks (levels gate features, achievements, hero profile)
2. Sprint E — Daily Quest Enhancement (quest pools, rotation, streak bonuses)
3. Sprint F — Tree Experience Polish (celebrations, fog of war, choice branching)

### File Change Log (Current Session)

**Session: 2026-04-11 (Sprint C — Dungeon AFK Combat)**
- `supabase/migrations/20260412_dungeon_system.sql` — Dungeon tables: dungeon_runs, dungeon_events, dungeon_loot + RLS + indexes
- `backend/app/data/dungeon_pools.json` — Curated content: 4 tiers, 26 monsters, 24+ events, 4 bosses, 6 loot items
- `backend/app/services/dungeon.py` — Generation service: pre-roll events + loot, XP computation
- `backend/app/schemas/dungeon.py` — DungeonStartRequest schema
- `backend/app/core/supabase.py` — 7 dungeon helper functions + estimated_minutes in save_generated_tree
- `backend/app/api/v1/dungeon.py` — 6 REST endpoints: tiers, active, start, complete, retreat, history
- `backend/app/api/v1/__init__.py` — Registered dungeon router
- `backend/app/prompts/generate_tree.txt` — Added estimated_minutes to daily quest schema
- `frontend/src/types/index.ts` — Dungeon types: DungeonTier, DungeonEvent, DungeonLootItem, DungeonRun, DungeonStartResult, DungeonCompleteResult + estimated_minutes on DailyQuest
- `frontend/src/lib/api.ts` — 6 dungeon API methods
- `frontend/src/app/dungeon/page.tsx` — Full rewrite: pre-delve tier selection, active run timer+events, battle report, notifications
- `frontend/src/components/dungeon/BattleReport.tsx` — Post-dungeon reward screen with stats, loot, expandable log
- `frontend/src/app/globals.css` — fadeIn keyframe for event/loot animations
- `frontend/src/app/vows/page.tsx` — Quest-to-dungeon sword icon links for timed quests
- `frontend/src/app/dashboard/page.tsx` — Active dungeon run status on hub card

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
