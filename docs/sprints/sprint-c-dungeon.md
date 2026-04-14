# Sprint C — Dungeon AFK Combat Overhaul (ARCHIVED)

> **Status**: COMPLETED. Archived 2026-04-14.
> Original tasks extracted from TASKS.md. Kept for reference.

---

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
