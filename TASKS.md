# TASKS.md — Duskvow Task Queue

> **Purpose**: Current sprint tasks. Completed sprints archived in `docs/sprints/`.
> **Status values**: `QUEUED` → `IN_PROGRESS` → `DONE` / `FAILED`
> **Rule**: Execute tasks in order. Do NOT skip ahead. Run validation after each.
> **History**: Sprint A (Hero & Level) — DONE | Sprint B (Daily Quests) — DONE | See `docs/sprints/`

---

## Blocked / Backlog (Deferred — Not Part of Current Sprint)

> These are parked ideas. Reference only. Do not execute unless moved to a sprint.

- **WoW-Style Tree Grid Layout** — needs design decision (Dagre vs fixed grid)
- **Node Icon Image Generation** — needs budget/speed research
- **Tree Background Generation** — depends on icon gen research

---

## Sprint C — Dungeon AFK Combat Overhaul

> **Goal**: Transform the Pomodoro timer into an AFK dungeon crawler. While the
> user focuses on real-world work, their hero fights through dungeon floors.
> On completion the hero returns with a battle report, XP, and loot. Retreating
> early means reduced rewards. Time-based daily quests ("practice for 25 min")
> naturally trigger a dungeon session — the dungeon IS the mechanism for
> completing those quests.
>
> **Key design principle**: The dungeon is template-based generation with
> randomness — no AI calls during combat. Monster pools, events, and loot
> tables are curated JSON data. The narrative is pre-rolled when the user hits
> "Venture Forth" and events tick forward on a schedule as the timer runs.

---

### TASK C1: DB Migration — Dungeon Tables
**Status**: `DONE`
**Scope**: Supabase migration only — no app code changes

**What to do**:
1. Create migration `supabase/migrations/20260412_dungeon_system.sql`
2. Create table `dungeon_runs`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `tier TEXT NOT NULL CHECK (tier IN ('shallow_crypts','ember_mines','hollow_deep','abyssal_rift'))`
   - `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','retreated'))`
   - `total_floors INT NOT NULL`
   - `cleared_floors INT NOT NULL DEFAULT 0`
   - `duration_minutes INT NOT NULL` — the timer duration user selected
   - `xp_earned INT NOT NULL DEFAULT 0`
   - `linked_node_id UUID REFERENCES skill_nodes(id) ON DELETE SET NULL` — optional tree node the user is working on
   - `linked_quest_id UUID REFERENCES daily_quests(id) ON DELETE SET NULL` — optional daily quest being fulfilled
   - `started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - `completed_at TIMESTAMPTZ` — null while active
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
3. Create table `dungeon_events`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `run_id UUID NOT NULL REFERENCES dungeon_runs(id) ON DELETE CASCADE`
   - `floor_number INT NOT NULL`
   - `event_type TEXT NOT NULL CHECK (event_type IN ('combat','discovery','trap','rest','boss'))`
   - `title TEXT NOT NULL` — e.g. "Hollow Sentinel Ambush"
   - `description TEXT NOT NULL` — flavor text of what happened
   - `monster_name TEXT` — null for non-combat events
   - `monsters_defeated INT NOT NULL DEFAULT 0`
   - `trigger_at_seconds INT NOT NULL` — seconds elapsed since run start when this event appears
   - `sort_order INT NOT NULL DEFAULT 0`
4. Create table `dungeon_loot`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `run_id UUID NOT NULL REFERENCES dungeon_runs(id) ON DELETE CASCADE`
   - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `item_type TEXT NOT NULL CHECK (item_type IN ('scroll_of_clarity','ember_shard','shadowsteel_fragment','heros_ration','rune_of_focus','ashen_token'))`
   - `item_name TEXT NOT NULL`
   - `description TEXT NOT NULL`
   - `effect TEXT NOT NULL` — human-readable effect description
   - `claimed BOOLEAN NOT NULL DEFAULT FALSE` — user must click "Collect" on battle report
   - `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
5. RLS policies: users can only read/modify their own runs, events, and loot
6. Indexes: `dungeon_runs(user_id, status)`, `dungeon_events(run_id, sort_order)`, `dungeon_loot(user_id, claimed)`
7. Constraint: only 1 active run per user at a time:
   `CREATE UNIQUE INDEX idx_one_active_run ON dungeon_runs(user_id) WHERE status = 'active'`

**Validation**: `npx supabase migration list` shows new migration. Tables created cleanly.

---

### TASK C2: Monster & Event Data Pools
**Status**: `DONE`
**Depends on**: None (can parallel with C1)

**What to do**:
1. Create `backend/app/data/` directory
2. Create `backend/app/data/dungeon_pools.json` with this structure:
```json
{
  "tiers": {
    "shallow_crypts": {
      "name": "The Shallow Crypts",
      "description": "Crumbling tombs where restless dead still wander.",
      "min_level": 1,
      "floors": 3,
      "base_xp": 30,
      "monsters": [
        { "name": "Hollow Sentinel", "description": "An empty suit of armor, animated by fading spite." },
        { "name": "Crypt Rat Swarm", "description": "Hundreds of pale vermin, moving as one." },
        { "name": "Bone Warden", "description": "A skeleton fused to the wall, still swinging its rusted blade." },
        { "name": "Dust Wraith", "description": "A whisper given form — barely visible, but its touch chills to the marrow." },
        { "name": "Grave Tender", "description": "Once a caretaker. Now it tends the dead with... enthusiasm." }
      ],
      "events": {
        "discovery": [
          { "title": "Forgotten Alcove", "description": "Your hero finds a recess in the wall, hidden behind crumbling mortar. Something glints inside." },
          { "title": "Ancient Inscription", "description": "Faded runes carved into the floor. Your hero traces them, gaining a fragment of old knowledge." },
          { "title": "Collapsed Passage", "description": "The ceiling gives way behind your hero. No turning back — only forward." }
        ],
        "trap": [
          { "title": "Pressure Plate", "description": "A click underfoot. Darts fly from the walls — your hero rolls aside, mostly unscathed." },
          { "title": "False Floor", "description": "The stones give way. A short fall into cold water. Your hero climbs out, shaken but whole." }
        ],
        "rest": [
          { "title": "Quiet Chamber", "description": "An empty room. The air is still. Your hero catches their breath before pressing on." },
          { "title": "Abandoned Campfire", "description": "Someone was here before. The embers are cold, but the shelter remains." }
        ]
      },
      "boss": { "name": "The Warden Below", "description": "A massive figure of rusted iron and fused bone, blocking the deepest passage. It has not moved in centuries — until now." },
      "loot_weights": { "scroll_of_clarity": 30, "ember_shard": 25, "ashen_token": 25, "heros_ration": 15, "shadowsteel_fragment": 5, "rune_of_focus": 0 }
    },
    "ember_mines": {
      "name": "The Ember Mines",
      "description": "Abandoned mining shafts where fire still burns in the deep rock.",
      "min_level": 5,
      "floors": 5,
      "base_xp": 55,
      "monsters": [
        { "name": "Cinder Crawler", "description": "An insect the size of a hound, its carapace glowing with trapped heat." },
        { "name": "Soot Phantom", "description": "A shape in the smoke. It solidifies just long enough to strike." },
        { "name": "Molten Husk", "description": "A miner who never left. The fire took everything but the hunger." },
        { "name": "Ember Tick", "description": "Small. Fast. Latches on and drains warmth until your hero pries it free." },
        { "name": "Forge Golem", "description": "Slag and steel fused by underground heat into a shambling guardian." },
        { "name": "Vein Stalker", "description": "It moves through cracks in the rock. You only see it when it wants you to." }
      ],
      "events": {
        "discovery": [
          { "title": "Ore Vein", "description": "A seam of dark metal pulses with faint heat. Your hero pockets a shard." },
          { "title": "Miner's Cache", "description": "A locked chest beneath a collapsed beam. Inside — supplies left by someone who never returned." },
          { "title": "Underground Spring", "description": "Cool water in a burning place. Your hero drinks deeply and presses on refreshed." }
        ],
        "trap": [
          { "title": "Gas Pocket", "description": "A hiss from the wall. Noxious fumes fill the tunnel. Your hero covers their face and pushes through." },
          { "title": "Unstable Shaft", "description": "The ground shakes. Rocks fall. Your hero sprints through the collapse." }
        ],
        "rest": [
          { "title": "Cool Alcove", "description": "A pocket of breathable air away from the heat. Your hero rests against the cool stone." },
          { "title": "Old Elevator Platform", "description": "The mechanism is broken, but the platform makes a decent resting spot." }
        ]
      },
      "boss": { "name": "Furnace Heart", "description": "The mine's core — a mass of molten rock and twisted metal that beats like a living organ. It does not want you to leave." },
      "loot_weights": { "scroll_of_clarity": 25, "ember_shard": 20, "ashen_token": 15, "heros_ration": 15, "shadowsteel_fragment": 15, "rune_of_focus": 10 }
    },
    "hollow_deep": {
      "name": "The Hollow Deep",
      "description": "A vast cavern system where sound itself seems to decay.",
      "min_level": 10,
      "floors": 7,
      "base_xp": 85,
      "monsters": [
        { "name": "Shade Crawler", "description": "It has too many legs. They make no sound on the stone." },
        { "name": "Echo Devourer", "description": "It eats sound. Near it, your hero's footsteps vanish and their heartbeat becomes deafening." },
        { "name": "Hollow Knight", "description": "Armor without a body. Sword without a hand. It fights as if remembering a war long ended." },
        { "name": "Abyssal Leech", "description": "Translucent. Enormous. It drops from the ceiling without warning." },
        { "name": "Stone Singer", "description": "It hums a note that makes the walls weep. Your hero's bones vibrate in sympathy." },
        { "name": "Void Spinner", "description": "A spider of pure darkness. Its web is invisible until you're in it." },
        { "name": "Deep Watcher", "description": "A single eye, embedded in the cave wall. It follows. It always follows." }
      ],
      "events": {
        "discovery": [
          { "title": "Crystalline Chamber", "description": "The walls explode with color — bioluminescent crystals light a hidden grotto. Your hero gathers what they can." },
          { "title": "Petrified Explorer", "description": "A previous adventurer, turned to stone mid-stride. Their pack still holds useful supplies." },
          { "title": "Underground River", "description": "Black water flowing in silence. Your hero follows it deeper and finds a new passage." }
        ],
        "trap": [
          { "title": "Sound Trap", "description": "A chamber that amplifies every noise. Your hero's breathing draws attention from deeper in." },
          { "title": "Gravity Anomaly", "description": "The floor becomes the ceiling for a terrifying moment. Your hero lands hard but keeps moving." }
        ],
        "rest": [
          { "title": "Fungal Garden", "description": "Soft bioluminescent moss carpets a small chamber. The air is surprisingly fresh." },
          { "title": "Abandoned Outpost", "description": "Someone tried to establish a base here. They failed, but left behind useful remnants." }
        ]
      },
      "boss": { "name": "The Hollow King", "description": "It sits on a throne of fused stalactites, wearing a crown of absolute silence. When it stands, the entire cavern holds its breath." },
      "loot_weights": { "scroll_of_clarity": 20, "ember_shard": 15, "ashen_token": 10, "heros_ration": 15, "shadowsteel_fragment": 20, "rune_of_focus": 20 }
    },
    "abyssal_rift": {
      "name": "The Abyssal Rift",
      "description": "The wound at the bottom of the world. Reality thins here.",
      "min_level": 20,
      "floors": 9,
      "base_xp": 120,
      "monsters": [
        { "name": "Rift Stalker", "description": "It exists in two places at once. Striking one only angers the other." },
        { "name": "Void Sentinel", "description": "A guardian of nothing, defending an absence with lethal precision." },
        { "name": "Entropy Worm", "description": "Where it passes, stone crumbles to sand and metal returns to ore." },
        { "name": "Fractured Angel", "description": "Something holy, broken and remade wrong. It weeps as it fights." },
        { "name": "Abyss Maw", "description": "Not a creature — a place. A mouth in the ground that is also somehow alive." },
        { "name": "Memory Eater", "description": "Your hero forgets why they came. Then forgets the exit. Then forgets their name." },
        { "name": "The Unnamed", "description": "It was something once. Now it is the absence of that something. Its shape hurts to perceive." },
        { "name": "Dusk Herald", "description": "It speaks in a voice your hero recognizes but cannot place. It offers a deal no sane person would take." }
      ],
      "events": {
        "discovery": [
          { "title": "Tear in Reality", "description": "A rift in the air itself. Through it, your hero glimpses something they shouldn't — and gains strength from the knowledge." },
          { "title": "Fallen Vow-Bearer", "description": "Another who swore an oath like yours. They did not make it this far. Their weapon is still sharp." },
          { "title": "The Inverse Flame", "description": "A fire that burns downward into the stone. It consumes darkness instead of fuel. Your hero warms their hands." }
        ],
        "trap": [
          { "title": "Time Distortion", "description": "Your hero ages a year in a heartbeat, then snaps back. The memory of those unlived days remains." },
          { "title": "Gravity Well", "description": "The floor pulls harder. Each step costs twice the effort. Your hero crawls through on willpower alone." }
        ],
        "rest": [
          { "title": "Ember Shrine", "description": "An altar to something older than the dark. The ember on it still burns. Your hero rests in its warmth." },
          { "title": "The Still Point", "description": "A place where nothing moves. Not air, not time, not thought. Perfect rest, if brief." }
        ]
      },
      "boss": { "name": "Vow-Breaker", "description": "The final test is not a monster. It is every promise you failed to keep, given form and fury. It knows your name." },
      "loot_weights": { "scroll_of_clarity": 15, "ember_shard": 10, "ashen_token": 10, "heros_ration": 10, "shadowsteel_fragment": 25, "rune_of_focus": 30 }
    }
  },
  "loot_items": {
    "scroll_of_clarity": {
      "name": "Scroll of Clarity",
      "description": "Unfurl it and the world sharpens. Focus comes easier.",
      "effect": "+10% XP from all sources for 24 hours",
      "rarity": "uncommon"
    },
    "ember_shard": {
      "name": "Ember Shard",
      "description": "A fragment of living fire. It shields what matters most.",
      "effect": "Protects your streak for one missed day",
      "rarity": "rare"
    },
    "shadowsteel_fragment": {
      "name": "Shadowsteel Fragment",
      "description": "Dark metal that reveals what is hidden.",
      "effect": "Reveals one locked node's details on any tree",
      "rarity": "rare"
    },
    "heros_ration": {
      "name": "Hero's Ration",
      "description": "Preserved food for the long road. Eat it and press deeper.",
      "effect": "Adds +1 bonus floor to your next dungeon delve",
      "rarity": "common"
    },
    "rune_of_focus": {
      "name": "Rune of Focus",
      "description": "An ancient mark of concentration. The dungeon yields more to those who bear it.",
      "effect": "Next dungeon delve drops 2x loot",
      "rarity": "epic"
    },
    "ashen_token": {
      "name": "Ashen Token",
      "description": "A coin from a dead kingdom. Worth nothing — except to those who collect them.",
      "effect": "Collectible. Future use TBD (track count on profile).",
      "rarity": "common"
    }
  }
}
```
3. This file is the single source of truth for all dungeon content. No AI calls during combat.

**Validation**: JSON parses cleanly. All item_types referenced in loot_weights exist in loot_items.

---

### TASK C3: Dungeon Generation Service
**Status**: `DONE`
**Depends on**: C1, C2

**What to do**:
1. Create `backend/app/services/dungeon.py` with:
   - `load_pools() -> dict` — read and cache `dungeon_pools.json` at module level
   - `generate_dungeon_run(tier: str, duration_minutes: int) -> dict`:
     - Look up the tier config from pools
     - Determine floor count from tier config
     - For each floor, pick 1-2 random events:
       - Floor 1: always a `combat` event (random monster from tier pool)
       - Middle floors: weighted random — 50% combat, 20% discovery, 15% trap, 15% rest
       - Last floor: always `boss` event (the tier's boss)
     - Compute `trigger_at_seconds` for each event: evenly spaced across the total duration
       - e.g., 45 min run with 5 floors = events at ~0s, ~540s, ~1080s, ~1620s, ~2160s
     - Pre-roll loot: weighted random from `loot_weights`, 1-2 items per completed run
       - Higher tiers = higher chance of rarer items
     - Return: `{ "events": [...], "loot": [...], "total_floors": N, "base_xp": N }`
   - `compute_xp_reward(tier: str, cleared_floors: int, total_floors: int, linked_node: bool, linked_quest: bool) -> int`:
     - Base XP from tier config
     - Multiply by `cleared_floors / total_floors` (partial credit for retreats)
     - `+20%` bonus if linked to a tree node
     - `+15%` bonus if linked to a daily quest
     - Floor to int, minimum 5 XP even for early retreats
2. All randomness uses `random.choices` / `random.choice` with the pool weights

**Validation**: Unit-testable function — call with each tier, verify output structure.

---

### TASK C4: Backend — Dungeon API Endpoints
**Status**: `DONE`
**Depends on**: C1, C3

**What to do**:
1. Create `backend/app/schemas/dungeon.py`:
   - `DungeonStartRequest`: `tier: str`, `duration_minutes: int`, `linked_node_id: str | None`, `linked_quest_id: str | None`
   - `DungeonRunResponse`: full run object with events and loot
   - `DungeonCompleteResponse`: xp_earned, loot_items, leveled_up, etc.
   - `DungeonTierInfo`: name, description, min_level, floors, locked status
2. Create `backend/app/api/v1/dungeon.py` with routes:
   - `GET /api/v1/dungeon/tiers` — return all 4 tiers with lock status based on user's hero_level
     - Response: `{ "data": [{ tier info + "locked": bool, "locked_reason": "Requires Lv.10" }] }`
   - `GET /api/v1/dungeon/active` — return the user's current active run if any (with events)
     - Response: `{ "data": { run + events } | null }`
   - `POST /api/v1/dungeon/start` — create a new dungeon run
     - Validate: no active run exists, user meets level requirement for tier
     - Validate: if linked_node_id, verify user owns the node and it's in_progress/available
     - Validate: if linked_quest_id, verify user owns the quest and it's not completed today
     - Call `generate_dungeon_run()` to pre-roll events and loot
     - Save run + events to DB. Save loot to DB (unclaimed).
     - If linked_node_id, mark node as `in_progress` if it was `available`
     - Response: `{ "data": { run + events (with trigger_at_seconds) } }`
   - `POST /api/v1/dungeon/complete` — complete the active run
     - Validate: user has an active run
     - Set `status = 'completed'`, `cleared_floors = total_floors`, `completed_at = NOW()`
     - Compute XP via `compute_xp_reward()`
     - Award XP (reuse `add_xp_to_profile`), record activity, update streak
     - If linked_quest_id: auto-complete the daily quest for today
     - Update run's `xp_earned` field
     - Response: `{ "data": { xp_earned, loot_items, total_xp, leveled_up, ... } }`
   - `POST /api/v1/dungeon/retreat` — abandon the active run
     - Validate: user has an active run
     - Compute elapsed floors based on how much time has passed: `cleared = floor(elapsed_seconds / seconds_per_floor)`
     - Set `status = 'retreated'`, `cleared_floors = computed`, `completed_at = NOW()`
     - Compute partial XP via `compute_xp_reward()` (proportional to cleared floors)
     - Award reduced XP. **No loot** on retreat. Mark loot rows as unclaimed permanently.
     - Response: `{ "data": { xp_earned (reduced), cleared_floors, total_floors, leveled_up, ... } }`
   - `GET /api/v1/dungeon/history` — return last 10 completed/retreated runs for the user
     - Response: `{ "data": [{ run summaries }] }`
3. Add supabase.py helpers:
   - `create_dungeon_run(data)` → insert run row
   - `create_dungeon_events(events)` → bulk insert events
   - `create_dungeon_loot(items)` → bulk insert loot
   - `get_active_dungeon_run(user_id)` → select run where status='active' with events
   - `complete_dungeon_run(run_id, data)` → update run status/floors/xp
   - `get_dungeon_loot(run_id)` → select loot for a run
   - `get_dungeon_history(user_id, limit=10)` → recent runs
4. Register router in `backend/app/api/v1/__init__.py`

**Validation**: All endpoints respond correctly via `/docs`. Start + complete cycle works. Start + retreat cycle works. Level-gating prevents low-level users from accessing higher tiers.

---

### TASK C5: Frontend Types & API Client
**Status**: `DONE`
**Depends on**: C4

**What to do**:
1. `types/index.ts` — Add:
   ```typescript
   // Dungeon Types
   interface DungeonTier {
     tier: string;
     name: string;
     description: string;
     min_level: number;
     floors: number;
     locked: boolean;
     locked_reason: string | null;
   }

   interface DungeonEvent {
     id: string;
     floor_number: number;
     event_type: 'combat' | 'discovery' | 'trap' | 'rest' | 'boss';
     title: string;
     description: string;
     monster_name: string | null;
     monsters_defeated: number;
     trigger_at_seconds: number;
     sort_order: number;
   }

   interface DungeonLootItem {
     id: string;
     item_type: string;
     item_name: string;
     description: string;
     effect: string;
     claimed: boolean;
   }

   interface DungeonRun {
     id: string;
     tier: string;
     status: 'active' | 'completed' | 'retreated';
     total_floors: number;
     cleared_floors: number;
     duration_minutes: number;
     xp_earned: number;
     linked_node_id: string | null;
     linked_quest_id: string | null;
     started_at: string;
     completed_at: string | null;
     events: DungeonEvent[];
   }

   interface DungeonCompleteResult {
     xp_earned: number;
     total_xp: number;
     cleared_floors: number;
     total_floors: number;
     loot_items: DungeonLootItem[];
     leveled_up: boolean;
     new_level: number;
     previous_level: number;
     new_title: string;
     quest_completed: boolean;
   }
   ```
2. `lib/api.ts` — Add:
   - `getDungeonTiers(token)` → `GET /api/v1/dungeon/tiers`
   - `getActiveDungeon(token)` → `GET /api/v1/dungeon/active`
   - `startDungeon(tier, durationMinutes, linkedNodeId, linkedQuestId, token)` → `POST /api/v1/dungeon/start`
   - `completeDungeon(token)` → `POST /api/v1/dungeon/complete`
   - `retreatDungeon(token)` → `POST /api/v1/dungeon/retreat`
   - `getDungeonHistory(token)` → `GET /api/v1/dungeon/history`

**Validation**: `npx tsc --noEmit` passes.

---

### TASK C6: Dungeon Page — Pre-Delve (Idle State Overhaul)
**Status**: `DONE`
**Depends on**: C5

**What to do**:
Rewrite the idle state of `frontend/src/app/dungeon/page.tsx`. Keep the existing page shell (background, overlays, Navbar, "Return to Hub" link) but replace the idle content.

1. **Tier Selection Cards** — Replace mode/duration pickers with 4 dungeon tier cards:
   - Each card shows: tier image (placeholder), tier name (Cinzel), description (Crimson Pro italic), floor count, level requirement
   - Unlocked tiers: ember border, full opacity, clickable
   - Locked tiers: 40% opacity, muted border, lock icon, "Requires Lv.X" text, not clickable
   - Selected tier: gold border glow, slightly scaled up
   - Layout: 2x2 grid on desktop, single column on mobile
   - Fetch tiers from `api.getDungeonTiers(token)` on mount

2. **Duration Selector** — Below tier cards, only visible when a tier is selected:
   - Keep the existing preset buttons style (25, 45, 60 min)
   - Label: "Delve Duration" in Crimson Pro italic
   - Note below: "Longer delves yield more XP and loot" in muted text

3. **Link to Tree Node (Optional)** — Dropdown/selector:
   - Label: "What are you working on?" in Crimson Pro italic
   - Fetches user's active trees + their in_progress/available nodes
   - Dropdown shows: tree title → node title (grouped)
   - Selection shows "+20% XP bonus" badge
   - "None" option is default and always available

4. **Link to Daily Quest (Optional)** — If a daily quest for today is uncompleted and its description mentions a duration (heuristic: contains "minutes" or "min" or a number followed by time word), show:
   - "This delve fulfills: [quest title]" with a checkbox
   - Selecting it shows "+15% XP bonus" badge and pre-sets duration to match quest
   - Auto-detected from today's uncompleted quests

5. **"Venture Forth" Button** — Calls `api.startDungeon(...)`:
   - On success: transition to active state with returned run data
   - Disabled until a tier is selected
   - Shows combined XP bonus if node/quest linked: "+35% XP"

6. **Resume Active Run** — On mount, call `api.getActiveDungeon(token)`:
   - If an active run exists, skip idle state and go straight to active state
   - Compute remaining time from `started_at + duration_minutes` vs now

7. **Image placeholders**: Place `<img>` tags with `src="/images/dungeon_tier_{tier}.webp"` for the 4 tier cards. Use `dungeon_card.webp` as fallback until images are generated.

**Image prompts for AI generation** (add as comments in the component):
```
TIER CARD IMAGES (512x512, dark fantasy digital art, no text):
- shallow_crypts: "Dark crumbling stone crypt entrance with faint torchlight, broken sarcophagi visible inside, cobwebs and dust motes in the air, muted grey-blue palette, atmospheric perspective, digital painting style"
- ember_mines: "Underground mining tunnel glowing with veins of molten orange ore in the walls, pickaxes abandoned on the ground, oppressive heat haze, warm orange-red palette, dark fantasy digital art"
- hollow_deep: "Vast dark cavern with bioluminescent crystals on distant walls, a narrow stone bridge over an abyss, deep blue-purple palette with teal crystal light, eerie silence, digital painting"
- abyssal_rift: "A tear in reality at the bottom of a cavern, edges crackling with dark energy and inverse light, the void visible through the rift, deep purple-black with flashes of sickly gold, cosmic horror digital art"
```

**Validation**: `npm run build` passes. Tier cards render. Locked tiers show correctly. Selection state works.

---

### TASK C7: Dungeon Page — Active State (Floor Progression)
**Status**: `DONE`
**Depends on**: C6

**What to do**:
Replace the timer-only active UI with a floor-based narrative experience. Keep the timer but surround it with dungeon events.

1. **Layout** — Center column, max-width 520px:
   - Top: Floor progress indicator
   - Middle: Timer (keep existing large countdown)
   - Below timer: Event feed (the narrative heart)
   - Bottom: Control buttons

2. **Floor Progress Bar**:
   - Horizontal bar with segments for each floor
   - Cleared floors: gold fill with glow
   - Current floor: ember pulse animation
   - Future floors: muted/dark
   - Label: "Floor 3 of 5" in small Cinzel caps
   - Tier name shown above: "The Ember Mines" in Cinzel

3. **Event Feed** — The key feature:
   - A scrollable log (max-height 200px, auto-scroll to bottom)
   - Events appear based on `trigger_at_seconds` as the timer progresses
   - Compute which events should be visible: `elapsed = duration_total - secondsLeft`, show events where `trigger_at_seconds <= elapsed`
   - Each event entry: timestamp (dim) + icon (emoji/symbol per type) + title (bold) + description (muted)
     - Combat: `⚔` "Hollow Sentinel Ambush" — "An empty suit of armor..."
     - Discovery: `✦` "Forgotten Alcove" — "Your hero finds a recess..."
     - Trap: `⚠` "Pressure Plate" — "A click underfoot..."
     - Rest: `🔥` "Quiet Chamber" — "An empty room..."
     - Boss: `💀` "The Warden Below" — "A massive figure..."
   - New events fade in with a 0.5s opacity transition
   - Style: dark glass background, monospace-feeling timestamps, warm text

4. **Timer** — Keep existing countdown but add context:
   - Phase label changes per floor: "Floor 1 — Your hero descends..."
   - Timer pulse animation during combat events, calm during rest events
   - Show linked quest/node name below timer if applicable

5. **Controls**:
   - "Hold Position" (pause) — same as before, keeps timer paused
   - "Retreat" — calls `api.retreatDungeon(token)` instead of just resetting state
     - **Confirmation dialog first**: "Retreat now? Your hero will return wounded. Partial XP, no loot."
     - On confirm: POST retreat, transition to retreat report (abbreviated battle report)
   - No "Delve Again" during active — that's on the battle report

6. **Page Visibility Handling**:
   - Use `document.visibilitychange` event
   - When user returns to tab: recalculate `secondsLeft` from `run.started_at + run.duration_minutes * 60 - now`
   - If timer should have completed while away: auto-call `api.completeDungeon()` and show battle report
   - This handles the "put phone down, come back later" flow

**Validation**: `npm run build` passes. Events appear at correct times. Floor bar advances. Retreat triggers confirmation. Tab switch doesn't break timer.

---

### TASK C8: Battle Report Screen
**Status**: `DONE`
**Depends on**: C7

**What to do**:
Create the post-dungeon battle report. This replaces the current "The Dungeon Yields" text with a full reward screen.

1. **Create `frontend/src/components/dungeon/BattleReport.tsx`**:
   - Full-width card, centered, max-width 520px
   - Dark glass background (`rgba(18,18,26,0.9)`) with thin gold border

2. **Report Header**:
   - Status-dependent:
     - Completed: "THE DUNGEON YIELDS" in gold Cinzel + brief flavor text
     - Retreated: "FORCED RETREAT" in blood-red Cinzel + "Your hero returns wounded."
   - Placeholder image: `dungeon_report_complete.webp` / `dungeon_report_retreat.webp`

3. **Stats Section** — Compact grid:
   - Floors Cleared: `X / Y` (gold if full clear, ember if partial)
   - Monsters Defeated: `N` (sum from events)
   - Time Spent: `Xm Ys`
   - XP Earned: `+N XP` with gold glow (show bonuses: "+20% node bonus")

4. **Event Log Replay** — Collapsed by default, expandable:
   - "View Battle Log" toggle
   - Shows all events from the run in order (same format as active feed)
   - For retreats: shows only events up to cleared_floors

5. **Loot Section** (completed runs only):
   - "SPOILS" header in Cinzel
   - Each item: icon (based on rarity color) + name + effect description
   - "Collect All" button with gold gradient — claims loot, then enables "Delve Again"
   - For retreats: "No loot recovered." in muted text

6. **Quest Completion Note** (if linked_quest_id):
   - "Daily Quest Fulfilled: [quest title]" with checkmark icon
   - "+15 XP" shown next to it

7. **Level-Up Integration**:
   - If `leveled_up: true` in the response, show LevelUpModal (reuse existing component)
   - Level-up modal appears ON TOP of the battle report

8. **Actions**:
   - "Delve Again" — returns to idle state (tier pre-selected from last run)
   - "Return to Hub" — navigate to `/dashboard`

9. **Image placeholders**:
```
BATTLE REPORT IMAGES (800x300, dark fantasy digital art, no text, wide banner):
- complete: "A lone warrior walking out of a dark dungeon entrance into dim twilight, carrying spoils and trophies, atmospheric fog, torch lighting from behind, triumphant silhouette, dark fantasy digital painting"
- retreat: "A wounded warrior stumbling away from a dark cave entrance, one hand on the wall for support, dropping a torch behind them, cold blue lighting, defeated atmosphere, dark fantasy digital painting"
```

**Validation**: `npm run build` passes. Full completion report shows stats + loot + collect flow. Retreat report shows reduced stats, no loot. Level-up modal layers correctly.

---

### TASK C9: Quest-Dungeon Integration
**Status**: `DONE`
**Depends on**: C6, C7, C8

**What to do**:
Connect daily quests with the dungeon so time-based tasks trigger delves naturally.

1. **Backend — Quest Duration Detection**:
   - Add `estimated_minutes: int | null` column to `daily_quests` table (new migration or alter in C1)
   - Actually: add this to C1 migration. `ALTER TABLE daily_quests ADD COLUMN estimated_minutes INT;`
   - Update `save_generated_tree` in supabase.py: if AI includes `estimated_minutes` in daily quest, save it.
   - Update AI prompt (`generate_tree.txt`): add `"estimated_minutes": 25` to daily quest schema. Instruct: "If this quest involves a timed activity (practice, study, exercise), include estimated_minutes (15-60). Otherwise omit it."

2. **Backend — Auto-Complete Quest on Dungeon Finish**:
   - Already handled in C4's `POST /dungeon/complete`: if `linked_quest_id`, call `complete_daily_quest()`
   - Ensure the quest XP is added on top of dungeon XP (they're separate rewards)

3. **Frontend — Quest-to-Dungeon Quick Action**:
   - In `QuestLogPanel.tsx` and Vow Chamber quest list: for quests with `estimated_minutes`, show a small dungeon icon (⚔ or ⏳) next to the quest
   - Clicking the icon navigates to `/dungeon?quest={questId}&duration={minutes}&tree={treeId}`
   - Dungeon page reads query params on mount and pre-fills:
     - Selects appropriate tier based on hero level
     - Sets duration to `estimated_minutes`
     - Links the quest automatically
     - Shows: "This delve fulfills: [quest title]"
   - This is the "do X for Y minutes → enter dungeon" flow

4. **Frontend — Vow Chamber Dungeon Prompt**:
   - When a time-based daily quest is uncompleted, show a subtle CTA below it:
     - "Enter the Dungeon →" link in ember color, small text
     - Links to `/dungeon?quest=...&duration=...`

**Validation**: `npm run build` passes. Clicking dungeon icon on a timed quest pre-fills dungeon page. Completing a dungeon with linked quest auto-marks the quest done. Quest XP + Dungeon XP both awarded.

---

### TASK C10: Dungeon Polish & Edge Cases
**Status**: `DONE`
**Depends on**: C7, C8, C9

**What to do**:
1. **Browser Notification on Complete**:
   - Request `Notification.permission` when user starts a delve
   - On timer complete (including background tab): fire browser notification
   - Title: "The Dungeon Yields" / Body: "Your hero has returned. Collect your spoils."
   - Only if tab is not focused (`document.hidden === true`)

2. **Dungeon on Dashboard Hub Card**:
   - Update hub card for Dungeon to show active run status if one exists:
     - "In progress — Floor 3 of 5" with ember pulse
     - Clicking goes to `/dungeon` which auto-resumes
   - If no active run: show last run summary or "The Dungeon Awaits"

3. **Accessibility & Responsiveness**:
   - Tier cards: 2x2 grid → single column on mobile
   - Event feed: readable on small screens
   - All interactive elements keyboard-navigable
   - Retreat confirmation: proper focus trap

4. **Loading & Error States**:
   - Skeleton loaders while fetching tiers/active run
   - Error toast if dungeon start fails (network error, concurrent run, etc.)
   - Graceful handling if backend is unreachable during active run (timer keeps running locally, retry complete on reconnect)

5. **Animation Polish**:
   - Event feed entries: fade-in + slight slide-up on appear
   - Floor progress bar: smooth fill transition (0.5s ease)
   - Loot items on battle report: staggered fade-in (100ms delay between items)
   - "Venture Forth" button: ember particle burst on click (CSS only, brief)

6. **Sound Design Hooks (Optional — Placeholder)**:
   - Add `data-sound` attributes on key interactions for future Web Audio implementation:
     - `data-sound="dungeon-start"` on Venture Forth
     - `data-sound="event-combat"` on combat events
     - `data-sound="dungeon-complete"` on completion
     - `data-sound="loot-collect"` on Collect All
   - No actual audio files yet — just the hooks for Sprint D+

**Validation**: Full `npm run build` passes. `npx tsc --noEmit` clean. Test full flow: select tier → start → events tick → complete → collect loot → XP awarded → delve again. Test retreat flow. Test quest-linked flow. Test resume-from-active-run flow. Test mobile layout.

---

## Sprint D — Progression & Unlocks

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

## Sprint Backlog (Future Sprints — Not Yet Specified)

| Sprint | Theme | Status |
|--------|-------|--------|
| Sprint E | Daily Quest Enhancement (Quest Pools, Rotation, Streak Bonuses) | `PLANNED` |
| Sprint F | Tree Experience Polish (Celebrations, Fog of War, Choice Branching) | `PLANNED` |
| Sprint G | Hearth Page + Ember Economy (Ember Buffs, Journal → XP, Loot Spending) | `PLANNED` |
