# Duskvow Strategic Analysis — Octalysis Framework
> Date: 2026-04-11 | Author: PM/Senior Dev Review
> Reference: "Actionable Gamification" by Yu-kai Chou

---

## Part 1: Octalysis Audit — Current State

The Octalysis framework maps human motivation onto 8 Core Drives. A product
that only activates 2-3 drives feels shallow. A product that activates 6+
with the right balance creates long-term engagement. Here is where Duskvow
stands today.

```
                    CD1: Epic Meaning
                    ████████░░  (8/10)
                         |
    CD8: Loss ───────────┼─────────── CD2: Accomplishment
    ██░░░░░░░░ (2/10)    |           ████░░░░░░ (4/10)
                         |
   CD7: Unpredictability ┼ CD3: Creativity
   ███░░░░░░░ (3/10)     |  █░░░░░░░░░ (1/10)
                         |
    CD6: Scarcity ───────┼─────────── CD4: Ownership
    ██░░░░░░░░ (2/10)    |           ███░░░░░░░ (3/10)
                         |
                    CD5: Social
                    ░░░░░░░░░░  (0/10)
```

### CD1: Epic Meaning & Calling — 8/10 (STRONGEST)

This is Duskvow's superpower. The dark fantasy framing transforms mundane
self-improvement into something that *feels important*. The user isn't
"checking off habits" — they're "forging vows in the dark." The landing page
sells this brilliantly. Cinzel headings, ember particles, the "A Different
Oath" anti-section, hero naming, titles like "Flamewarden" and "Duskwalker."

**What's working:**
- Hero naming ceremony ("What Shall They Call You?")
- Title progression (Wanderer → Oath-Bound → Ironsworn → ...)
- The entire visual language (Dark Souls meets Notion, not Habitica)
- Tree-as-vow framing (not "project" or "goal list")
- Ember / brazier lore objects on the dashboard

**What's missing:**
- The epic framing dies the moment you enter the actual tree view. You go
  from "Seal My Name" to staring at a node graph that looks like a Jira
  dependency chart. The mundane inner loop doesn't match the epic outer shell.
- No narrative progression. You get a title at certain levels, but there's no
  story, no world that changes, no "you've pushed back the darkness" moment.
- Daily quests have zero narrative wrapping. "Practice for 20 minutes" is
  the same text Todoist would generate.

---

### CD2: Development & Accomplishment — 4/10

This is where most gamified apps start, and Duskvow has the skeleton but not
the muscle.

**What's working:**
- XP system exists and is mathematically sound (quadratic curve)
- Level-up modal with title change is a genuine reward moment
- Node tiers (common → mythic) create a visual sense of progression
- StatsBar shows level + XP progress to next level

**What's broken:**
- **Levels are cosmetic.** Level 10 and Level 1 unlock the same features,
  see the same UI, have the same capabilities. There is no functional reason
  to level up. Yu-kai Chou calls this a "Sham Progression" — the counter
  goes up but nothing changes.
- **No milestones.** No achievement badges, no "first tree completed," no
  "7-day streak." The only marker is the level number.
- **XP feels arbitrary.** A common node gives 10 XP, a daily quest gives 15.
  There is no visible economy that makes 10 XP feel like it *means* something.
  Compare to a game where 10 gold buys a potion — the value is anchored to
  something tangible.
- **No completion celebration.** Node completion changes a border color. There's
  no particle burst, no sound, no satisfying moment. The level-up modal is good,
  but you might complete 20 nodes between level-ups with zero celebration.
- **Tree completion is anticlimactic.** Finish all nodes and... the tree is
  just "done." No capstone animation, no summary, no trophy.

---

### CD3: Empowerment of Creativity & Feedback — 1/10 (CRITICAL GAP)

This is the "Lego factor" — does the user feel like they're building
something, making meaningful choices, and seeing the system respond?

**Current state: almost zero.**
- The user types a goal. AI generates a tree. The user checks boxes.
- There are no meaningful choices *within* the tree. Choice nodes exist in
  the schema but don't functionally branch the experience.
- The user cannot rearrange nodes, add custom nodes, adjust difficulty,
  or personalize the tree in any way.
- Daily quests are AI-assigned. The user cannot create their own.
- The Ember/Brazier feature (reflections) is the ONE creative outlet, but
  it's disconnected from progression.

**Why this matters:**
Yu-kai Chou identifies CD3 as the "evergreen" drive — it's what makes people
play Minecraft for 10 years. Without it, Duskvow is a fancy checklist with
a timer. The user is a *consumer* of AI output, not a *creator* of their path.

---

### CD4: Ownership & Possession — 3/10

**What exists:**
- Hero name and title (yours)
- Multiple trees (your collection)
- XP total (your number)
- Embers/reflections (your thoughts)

**What's weak:**
- Trees are generic. Two users with the same goal get functionally the same
  tree. There's no sense that "this tree is uniquely mine."
- No visual customization. No avatar, no theme unlocks, no personal
  flourishes.
- No inventory or collectibles. The "loot from dungeon" concept doesn't
  exist yet.
- No profile page where you can see your hero's journey in totality.

---

### CD5: Social Influence & Relatedness — 0/10

**Completely absent.** No social features of any kind.

This isn't necessarily a problem for MVP — plenty of successful apps start
single-player. But it's worth noting that the dark fantasy aesthetic is
*inherently communal*. Guilds, oaths, covenants — these words imply bonds
between people. The theme is promising something the product doesn't deliver.

Low priority for now, but a major unlock later.

---

### CD6: Scarcity & Impatience — 2/10

**What exists:**
- 2 AI generations per day (free tier limit)
- 5 active tree cap

**What's missing:**
- These limits feel punitive, not motivating. There's no "I can't wait to
  unlock my next generation" feeling because there's nothing to unlock.
- Daily quests reset at midnight but there's no urgency mechanic. Miss a
  day? Nothing happens. No "your streak is at risk" nudge.
- No time-limited events, seasonal content, or urgency triggers.

---

### CD7: Unpredictability & Curiosity — 3/10

**What exists:**
- AI-generated trees are somewhat unpredictable (you don't know what nodes
  you'll get)
- Follow-up questions create anticipation during generation

**What's weak:**
- After generation, the tree is static. Zero surprises from that point
  forward. You see every node immediately. There's no fog-of-war, no
  hidden nodes, no "what's next?" tension.
- Daily quests are the same every day per tree. No rotation, no variety.
- Dungeon has no randomness at all — it's a countdown timer.
- No loot tables, no random rewards, no variable-ratio reinforcement.

---

### CD8: Loss & Avoidance — 2/10

**What exists:**
- Streak counter (but losing it has no consequence)

**What's weak:**
- There are no stakes. Miss a daily quest? Nothing happens. Abandon a tree?
  Just delete it. Let your streak die? The number resets to 0 but you lose
  nothing tangible.
- No "decay" on skills — a completed node stays completed forever with zero
  maintenance.
- The Pomodoro timer has no penalty for quitting mid-session.

---

## Part 2: Why the Pomodoro/Dungeon Doesn't Work

The Dungeon is a **beautifully themed timer that exists in a vacuum.** Here
is the specific breakdown of why it fails to compel use:

### Problem 1: Zero Integration with the Game Economy

The timer is 100% client-side. No API calls. No XP awarded. No sessions
logged. Completing a 45-minute focus session gives you exactly nothing —
not XP, not loot, not progress, not even a record that it happened. It is
functionally identical to opening a browser tab with a countdown timer.

**Octalysis diagnosis:** Fails CD2 (no accomplishment), CD4 (nothing earned),
CD7 (no surprise reward).

### Problem 2: No Narrative Fantasy

You described the vision perfectly: "AFK dungeon while you study — hero
fights monsters, returns with loot and battle reports." What currently exists
is an hourglass icon that changes opacity. The word "Dungeon" is theming
on a timer, not a *dungeon*.

The fantasy should be: "While I study, my hero is fighting. When I finish,
I see what happened." Instead: "While I study, a number counts down. When it
finishes, the number says 00:00."

**Octalysis diagnosis:** Fails CD1 (no epic narrative), CD7 (no curiosity
about what happened while you were away), CD3 (no meaningful output).

### Problem 3: No Stakes for Quitting

"Retreat" is the quit button. It resets the timer. That's it. In the Shakes
& Fidget model you referenced, leaving a dungeon early means your hero
*doesn't return* — you don't get the loot. The current Dungeon has no
equivalent. The user can start and stop 15 sessions and nothing changes.

**Octalysis diagnosis:** Fails CD8 (no loss from abandoning).

### Problem 4: No Connection to Active Vows/Trees

The dungeon exists on a separate page, separate from your trees. There's no
"I'm doing this focus session to work on Node X" linking. No daily quest
says "Complete a 25-min dungeon delve." The systems are islands.

### Problem 5: Visual Monotony

Every session looks the same. Same hourglass. Same background. Same text
cycling between "Delving..." and "Resting at Campfire." There's no visual
progression within a session (floor 1 → floor 2 → floor 3), no variety
between sessions, no evolution over time.

---

## Part 3: SWOT Analysis

### Strengths

| # | Strength | Octalysis Drive |
|---|----------|----------------|
| S1 | **Exceptional aesthetic identity.** The dark fantasy theme is unique in the self-improvement space. No competitor looks like this. | CD1 |
| S2 | **AI tree generation is a genuine differentiator.** No other app turns a goal into a structured skill tree with one prompt. | CD3 (potential) |
| S3 | **Sound technical foundation.** FastAPI + Supabase + Next.js is a scalable, modern stack. RLS, optimistic UI, atomic XP — the plumbing is solid. | Infrastructure |
| S4 | **Hero identity system is compelling.** Name, level, title — this is more character investment than most habit apps offer. | CD1, CD4 |
| S5 | **Daily quests are freshly implemented.** The hardest retention feature (recurring engagement hooks) has already been built at the schema and API level. | CD2 |

### Weaknesses

| # | Weakness | Octalysis Drive | Severity |
|---|----------|----------------|----------|
| W1 | **Levels are cosmetic.** Nothing unlocks. No functional progression. | CD2 | Critical |
| W2 | **Dungeon is disconnected.** No backend, no rewards, no narrative. | CD1, CD2, CD7 | Critical |
| W3 | **Trees are static post-generation.** No surprises, no hidden content, no user agency. | CD3, CD7 | High |
| W4 | **No celebration/feedback loops.** Node completion is visually flat. | CD2 | High |
| W5 | **Daily quests are plain text.** No narrative, no variety, no rotation. | CD1, CD7 | Medium |
| W6 | **No stakes or loss mechanics.** Missing a day costs nothing. | CD8 | Medium |
| W7 | **No social features.** | CD5 | Low (for now) |
| W8 | **No mobile experience.** Web-only limits "check off daily quest on the go" UX. | Accessibility | Medium |

### Opportunities

| # | Opportunity | Impact | Effort |
|---|------------ |--------|--------|
| O1 | **Dungeon combat system** — hero fights monsters AFK, returns with loot/reports. Directly addresses user request and activates CD1+CD7. | Very High | High |
| O2 | **Level-gated unlocks** — new tree themes, dungeon tiers, cosmetic upgrades tied to level milestones. | High | Medium |
| O3 | **Loot/inventory system** — dungeon drops items that buff XP, unlock cosmetics, or enhance trees. | High | High |
| O4 | **Dynamic daily quests** — rotating quest pool, streak bonuses, "challenge quests" on weekends. | High | Medium |
| O5 | **Tree fog-of-war** — hide nodes beyond the current unlocked frontier. Reveal on unlock. | Medium | Low |
| O6 | **Node completion ceremonies** — particle bursts, screen shake, ember flare on complete. | Medium | Low |
| O7 | **Weekly/monthly challenges** — time-limited objectives with unique rewards. | Medium | Medium |
| O8 | **Hero profile page** — a comprehensive view of your journey, stats, completed vows, achievements. | Medium | Medium |
| O9 | **Streak stakes** — streak shields, streak freeze tokens, "your flame dims" warning at day's end. | Medium | Low |
| O10 | **PWA / mobile wrapper** — push notifications for daily quests, streak warnings. | High | Medium |

### Threats

| # | Threat | Mitigation |
|---|--------|-----------|
| T1 | **Feature creep.** The vision is massive. Shipping nothing because you're building everything is the #1 risk. | Tight sprint scoping. Ship vertical slices, not horizontal foundations. |
| T2 | **AI generation costs at scale.** Gemini 2.5 Pro for every tree + potential image gen = real spend. | Cache common templates. Use Flash for generation, Pro only for quality tier. |
| T3 | **Habitica comparison.** Users who know Habitica will measure against it. Duskvow must differentiate on *depth of narrative* and *quality of AI*, not feature count. | Lean into the dark fantasy identity. Don't try to match Habitica's breadth. |
| T4 | **Retention cliff.** User creates 1-2 trees, completes some nodes, has no reason to return after week 2. | Daily quests + dungeon + streak stakes are the solution. Prioritize these. |
| T5 | **AI-generated content feels generic.** If every tree for "learn guitar" looks the same, the AI mystique fades fast. | Improve prompts, add user context, allow tree customization. |

---

## Part 4: The Connection Problem — How Everything Should Flow Together

Right now Duskvow has three islands:

```
[Vow Chamber]          [Dungeon]          [Hearth]
 - Trees                - Timer             - Embers
 - Nodes                - (nothing else)    - Reflections
 - Daily Quests
      |                      |                   |
      └──── No connection ───┴─── No connection ─┘
```

The vision should be a **single economy** where every action feeds into
everything else:

```
                    ┌─────────────────┐
                    │   HERO PROFILE  │
                    │  Level / Title  │
                    │  Inventory/Loot │
                    │  Achievements   │
                    └────────┬────────┘
                             │ XP + Loot + Reputation
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌─────────────┐  ┌──────────┐
     │ VOW CHAMBER│  │   DUNGEON   │  │  HEARTH  │
     │            │  │             │  │          │
     │ Trees      │  │ AFK Combat  │  │ Embers   │
     │ Nodes      │  │ Focus Timer │  │ Journal  │
     │ Dailies    │  │ Loot Drops  │  │ Buffs    │
     └─────┬──────┘  └──────┬──────┘  └────┬─────┘
           │                │               │
           │  ┌─────────────┤               │
           ▼  ▼             ▼               ▼
     ┌──────────────────────────────────────────┐
     │           UNIFIED PROGRESSION            │
     │                                          │
     │  - Complete node → XP + unlock next      │
     │  - Complete daily → XP + streak + ember  │
     │  - Dungeon session → XP + loot + gold    │
     │  - Write ember → reflection buff (+XP%)  │
     │  - Loot buffs trees (XP boost, reveal)   │
     │  - Streaks multiply all XP sources       │
     │  - Level unlocks dungeon tiers + themes  │
     └──────────────────────────────────────────┘
```

### The Core Loop (What a Day Should Look Like)

1. **Open app.** Dashboard shows: hero level, today's daily quests (3-5),
   active vow progress, streak status, "your hero returned from the dungeon"
   notification if applicable.

2. **Check dungeon results.** "Your hero defeated 3 Hollow Sentinels and found
   a Scroll of Clarity (+10% XP for 24h)." Brief combat log. Collect loot.

3. **Do daily quests.** Check off 3-5 recurring tasks. Each awards 15 XP.
   Streak counter increments. If all dailies done: bonus reward.

4. **Work on a tree node.** Open a vow, pick an available node, do the work,
   mark it complete. XP + unlock cascade. Maybe a level-up.

5. **Send hero back into the dungeon.** Start a focus session (25/45/60 min).
   Hero enters a dungeon floor. You study/work. Timer counts down.

6. **Write an ember (optional).** Reflect on today's progress. The brazier
   feature. Gives a small XP buff or streak protection.

7. **End of day.** App shows daily summary: XP earned, quests completed,
   dungeon results, streak status. "Tomorrow your hero must rest unless you
   light the brazier again."

---

## Part 5: Dungeon Reimagination — "AFK Combat" Design

### The Fantasy

The user isn't "running a timer." They are **sending their hero into a
dungeon**. While the user focuses on real-world work, the hero fights
through floors of monsters. When the timer completes, the hero returns
with loot, a battle report, and XP.

### Mechanical Design

**Starting a Delve:**
- User picks a dungeon tier (unlocked by hero level):
  - Lv 1+: The Shallow Crypts (25 min)
  - Lv 5+: The Ember Mines (45 min)
  - Lv 10+: The Hollow Deep (60 min)
  - Lv 20+: The Abyssal Rift (90 min)
- Optionally link to an active tree node ("I'm working on this node right now")
- Hero enters. Timer starts. **The hero's fate is sealed when you start.**

**During the Delve:**
- Minimal distraction UI. The timer shows floor progress:
  - "Floor 1 of 5... Your hero encounters Hollow Sentinels"
  - "Floor 2 of 5... A locked chest. Your hero attempts to pick it..."
  - "Floor 3 of 5... An ambush! Three Shade Crawlers attack..."
- These are **pre-generated flavor events** that tick every N minutes.
  They're cosmetic but create the feeling that something is *happening*
  while you work. Simple text log, not full animation.
- If the user **leaves early (Retreat)**: hero returns wounded. Reduced
  XP. No loot. "Your hero was forced to retreat from Floor 3. They return
  empty-handed but alive." — This is the CD8 (Loss) mechanic.

**Completing a Delve:**
- Timer hits zero. **Battle Report** screen appears:
  - Floors cleared: 5/5
  - Monsters defeated: 12 (list with names)
  - XP earned: 50 (base) + 15 (linked node bonus) = 65 XP
  - Loot found: 1-3 items from the loot table
  - Optional: linked tree node auto-progresses if applicable
- Battle report is saved to DB. Can be revisited in hero profile.

**Loot System (Light):**
- Loot is simple consumable buffs, not a full inventory system:
  - **Scroll of Clarity** — +10% XP from all sources for 24h
  - **Ember Shard** — Streak protection (one missed day forgiven)
  - **Shadowsteel Fragment** — Reveal one hidden node on any tree
  - **Hero's Ration** — Extend next dungeon by +5 minutes for bonus floor
  - **Rune of Focus** — Next dungeon delve gives 2x loot
- Drop rates based on dungeon tier and completion (full clear vs retreat)
- Items stored in a simple inventory (hero profile page)
- This is NOT a complex RPG inventory — think 5-10 item types max

**Combat Generation:**
- Pre-generate a "dungeon run" when the user starts the timer
- Simple algorithm: pick N monsters from a tier-appropriate pool, assign
  them to floors, generate 1-2 events per floor
- Monster names/descriptions from a curated list (themed to dark fantasy)
- No real-time AI needed — this is template-based generation with randomness
- Store the full run in DB so it can be replayed in the battle report

---

## Part 6: Daily Quest Revamp

### Current Problem

Daily quests are AI-generated alongside the tree and never change. If your
tree is "Run a Marathon," your daily quests might be:
- "Run for 20 minutes"
- "Do stretching exercises"
- "Log your meals"

These are fine on day 1. By day 14, they're wallpaper. The user doesn't
read them anymore.

### Proposed Redesign

**1. Quest Categories (not just "do this daily")**

| Category | Description | Example |
|----------|-------------|---------|
| **Core Practice** | The main recurring habit. Always present. | "Run for 20 minutes" |
| **Maintenance** | Supporting habits. Rotate weekly. | "Stretch for 10 min" / "Foam roll" / "Ice bath" |
| **Knowledge** | Learn something related. Rotate daily. | "Watch 1 running form video" / "Read a training article" |
| **Reflection** | Journal/think about progress. | "Write an ember about today's run" |
| **Challenge** | Harder optional quest. Bonus XP. Weekend-only. | "Run an extra mile today" / "Try a new route" |

**2. Quest Rotation**
- 2 Core quests: always the same (anchor habits)
- 2 Maintenance quests: rotate from a pool of 6-8, refreshed weekly
- 1 Knowledge quest: rotates daily from a pool of 10+
- 1 Challenge quest: appears Fri-Sun only, 2x XP reward

The AI generates the *pools* at tree creation time (not just 3-5 quests,
but 15-20 quest templates). The backend selects today's active set.

**3. Streak Bonuses**
- 3-day streak: +5% XP from all quests
- 7-day streak: +10% XP + unlock a dungeon loot chest
- 14-day streak: +15% XP + Ember Shard (streak protection)
- 30-day streak: +20% XP + unique title suffix ("the Relentless")

**4. All-Clear Bonus**
Complete all daily quests in one day → bonus XP reward + "All Quests
Conquered" visual flair on the dashboard. This incentivizes finishing
*all* quests, not just the easy ones.

---

## Part 7: Progression System Overhaul

### What Levels Should Unlock

| Level | Unlock | Drive |
|-------|--------|-------|
| 1 | Base experience. 1 dungeon tier. 2 AI gens/day. | — |
| 3 | Hero title: change freely. Daily quest challenge quests appear. | CD4 |
| 5 | Dungeon Tier 2 (Ember Mines, 45 min). 3 AI gens/day. | CD2, CD6 |
| 8 | Tree fog-of-war toggle (choose to hide unseen nodes). | CD7 |
| 10 | Dungeon Tier 3 (Hollow Deep, 60 min). Profile page unlocks. | CD2 |
| 15 | 4 AI gens/day. Custom daily quest slot (write your own). | CD3 |
| 20 | Dungeon Tier 4 (Abyssal Rift, 90 min). 7 active tree cap (up from 5). | CD2, CD6 |
| 25 | Loot rarity upgrade (higher chance of rare drops). | CD7 |
| 30 | Prestige option: reset level for a permanent +10% XP buff. | CD2 |
| 40 | ??? (leave room for endgame content not yet designed) | — |
| 50 | Title: "Vow Eternal" — permanent, cannot be lost. | CD1 |

### Achievement System (Badges)

Achievements are one-time accomplishments displayed on the hero profile.
They activate CD2 (accomplishment) and CD4 (collection/ownership).

**Tree Achievements:**
- "First Vow" — Complete your first tree
- "Oath Keeper" — Complete 3 trees
- "Vow Collector" — Have 5 active trees simultaneously
- "Perfectionist" — Complete all optional nodes in a tree
- "Speedrunner" — Complete a tree in under 7 days
- "The Long Road" — Complete a tree with 20+ nodes

**Dungeon Achievements:**
- "First Descent" — Complete your first dungeon
- "Iron Will" — Complete 10 dungeons without retreating
- "Deep Diver" — Complete a 90-minute dungeon
- "Loot Hoarder" — Collect 50 items total

**Daily Quest Achievements:**
- "Consistent" — 7-day quest streak
- "Relentless" — 30-day quest streak
- "All Clear" — Complete all daily quests in one day, 10 times

**Meta Achievements:**
- "Well Rounded" — Complete a tree, a dungeon, and all dailies in one day
- "The Summit" — Reach Level 25
- "Vow Eternal" — Reach Level 50

---

## Part 8: Sprint Plans

### Sprint C — Dungeon AFK Combat (The Big One)
> **Goal**: Transform the Pomodoro timer into an AFK dungeon crawler.
> **Duration**: ~2 weeks | **Priority**: Critical (addresses biggest engagement gap)

| Task | Description | Effort |
|------|-------------|--------|
| C1 | **DB Migration**: `dungeon_runs` table (id, user_id, tier, status, floors, started_at, completed_at, xp_earned, linked_node_id), `dungeon_events` table (run_id, floor, event_type, description, monster_name), `dungeon_loot` table (run_id, item_type, item_name, description, effect) | M |
| C2 | **Monster & Event Pools**: Create `backend/app/data/dungeon_pools.json` — curated lists of monsters, events, and loot per tier. 20+ monsters, 15+ events, 10 loot item types. No AI needed — hand-crafted dark fantasy content. | M |
| C3 | **Dungeon Generation Service**: `backend/app/services/dungeon.py` — on delve start, generate a full run: pick monsters per floor, assign events, pre-roll loot drops. Store in DB. Return floor-by-floor event schedule with timestamps. | L |
| C4 | **Backend Endpoints**: POST `/dungeon/start` (create run, return schedule), POST `/dungeon/complete` (award XP + loot, save report), POST `/dungeon/retreat` (partial XP, no loot, mark incomplete), GET `/dungeon/report/{id}` (full battle report), GET `/dungeon/active` (current run if any) | L |
| C5 | **Frontend Dungeon Overhaul**: Replace timer-only UI with floor-based progression. Show current floor, event text feed, monster encounters as text. Keep the timer, but surround it with narrative. "Floor 3/5 — Your hero faces a Hollow Sentinel..." | XL |
| C6 | **Battle Report Screen**: Post-completion screen showing floors cleared, monsters defeated, XP earned, loot collected. Dark fantasy card layout. "Collect" button to claim rewards. | L |
| C7 | **Loot System (Light)**: Inventory as a simple list on the hero profile. Consumable items with "Use" button. Effects applied server-side. 5-10 item types only. | M |
| C8 | **Retreat Penalty**: Leaving early → hero returns wounded. 25% XP, no loot. Visual: hero portrait dimmed, "forced to retreat" message. CD8 activation. | S |
| C9 | **Link to Tree Node**: Optional dropdown when starting a delve — "What are you working on?" Selecting a node gives +20% XP bonus and auto-marks the node as "in progress." | S |
| C10 | **Dungeon Tier Gating**: Check hero level before allowing tier selection. Show locked tiers with level requirement. | S |

---

### Sprint D — Progression & Unlocks
> **Goal**: Make levels meaningful. Add achievements. Connect XP to tangible benefits.
> **Duration**: ~1.5 weeks | **Priority**: High

| Task | Description | Effort |
|------|-------------|--------|
| D1 | **DB Migration**: `hero_inventory` table, `hero_achievements` table (id, user_id, achievement_key, unlocked_at), `level_unlocks` config table or hardcoded map | M |
| D2 | **Level Unlock Logic**: Backend middleware/helper that checks level before allowing actions (dungeon tier, AI gen count, active tree cap). Return `locked_reason` in API responses. | M |
| D3 | **Achievement Tracking Service**: `backend/app/services/achievements.py` — checks achievement conditions after every significant action (node complete, dungeon complete, quest complete). Awards achievement if conditions met. | L |
| D4 | **Achievement Notification**: Frontend toast/modal when achievement unlocked. Similar to level-up modal but smaller. Badge icon + name + description. | M |
| D5 | **Hero Profile Page**: New page `/profile` — hero name, level, title, XP bar, achievement grid, inventory, completed vows list, dungeon stats (total runs, total time, favorite tier). | L |
| D6 | **Unlock Indicators in UI**: Show level requirements on locked features. Dungeon tier selector shows "Unlocks at Lv 10" on locked options. Tree creation shows current/max gen count with level for next upgrade. | M |
| D7 | **Streak Bonus System**: Backend applies streak multiplier to XP awards. Frontend shows active multiplier on StatsBar. Streak milestones trigger mini celebrations. | M |

---

### Sprint E — Daily Quest Enhancement
> **Goal**: Make dailies feel alive, varied, and worth returning for.
> **Duration**: ~1 week | **Priority**: High

| Task | Description | Effort |
|------|-------------|--------|
| E1 | **AI Prompt Overhaul**: Expand tree generation prompt to create quest *pools* (15-20 templates) with categories (core, maintenance, knowledge, challenge). Store full pool in DB. | M |
| E2 | **Quest Rotation Logic**: Backend selects today's active quests from the pool. 2 core (static) + 2 rotating + 1 challenge (weekends). New endpoint or modify existing `/quests/today`. | M |
| E3 | **Quest Narrative Wrapping**: AI generates quests with dark fantasy flavor text. "Practice for 20 minutes" → "The Iron Litany — Forge your discipline with 20 minutes of focused practice. The dark rewards consistency." Title + flavor text + mechanical description. | S |
| E4 | **All-Clear Bonus**: Backend detects when all daily quests are completed. Awards bonus XP (50). Frontend shows "All Quests Conquered" banner with gold flair. | S |
| E5 | **Streak Milestones UI**: Show upcoming streak milestone on dashboard. "3 more days until +10% XP bonus." Visual streak flame that grows with consecutive days. | M |
| E6 | **Quest-Dungeon Integration**: One daily quest per tree is "Complete a dungeon delve." Bridges the two systems. | S |

---

### Sprint F — Tree Experience Polish
> **Goal**: Make the core tree interaction feel satisfying and mysterious.
> **Duration**: ~1 week | **Priority**: Medium-High

| Task | Description | Effort |
|------|-------------|--------|
| F1 | **Node Completion Celebration**: Particle burst on complete. Ember flare animation. Brief screen pulse. The node "ignites." | M |
| F2 | **Tree Completion Ceremony**: Full-screen overlay when all nodes done. "Your Vow Has Been Fulfilled." Summary: nodes completed, XP earned, time taken. Option to "Forge Anew" (create related tree). | M |
| F3 | **Fog of War (Optional Toggle)**: Hide nodes more than 2 steps ahead of current progress. Reveal on unlock. Creates CD7 curiosity. Level 8+ unlock. | L |
| F4 | **Choice Node Branching**: When a choice node is reached, grey out the unchosen branch permanently. Make the choice feel consequential. "You chose the Path of Endurance over the Path of Speed." | M |
| F5 | **Node Flavor Text**: Add atmospheric description to each node tier. Common: plain. Rare: "The knowledge deepens." Legendary: "Few have walked this far." Mythic capstone: unique generated text. | S |

---

### Sprint Prioritization Matrix

```
Impact ▲
       │
  HIGH │  Sprint C          Sprint D
       │  (Dungeon)         (Progression)
       │
  MED  │  Sprint E          Sprint F
       │  (Quest Revamp)    (Tree Polish)
       │
  LOW  │                    Sprint G+ (Social, Mobile, etc.)
       │
       └──────────────────────────────────────────► Effort
            LOW              MEDIUM            HIGH
```

**Recommended order: C → D → E → F**

Sprint C is the highest-risk, highest-reward. It transforms the weakest
feature into the most differentiated one. No other self-improvement app has
an AFK dungeon crawler. Ship this first, even if rough — the concept is
more important than polish.

Sprint D makes the rest of the game matter. Without it, Sprint C's loot has
nowhere to go and levels remain cosmetic.

Sprint E is high-value, low-effort. Most of it is prompt engineering and
simple backend logic. Can be done in parallel with C if capacity allows.

Sprint F is polish. Important but not urgent. Do it when the core loop is
solid.

---

## Part 9: Additional Ideas

### 1. "Covenant" System (Future — Social Lite)
Instead of full social features, allow users to form small groups (2-5 people)
called Covenants. Shared streak tracking. "Your covenant maintained a 14-day
streak." This adds CD5 (social) without building a social network. Light
accountability.

### 2. Seasonal Events
Every month or quarter, introduce a limited-time dungeon with unique loot.
"The Ashen Carnival — 2 weeks only." Creates CD6 (scarcity) and gives lapsed
users a reason to return.

### 3. "New Game+" for Completed Trees
When you complete a tree, option to "Forge Anew" — AI generates a harder
version of the same goal. Same structure, higher expectations. "You ran a
marathon. Now run a faster one." This prevents the "I completed everything,
now what?" cliff.

### 4. Ember-to-Buff Pipeline
Currently Embers (brazier reflections) are write-only. Connect them to the
game: writing a daily ember gives +5% XP for 24h. This makes the journaling
feature feel mechanically relevant, not just emotionally relevant. "Reflection
fuels the flame."

### 5. Node Difficulty Rating
Let users rate nodes as "too easy" / "just right" / "too hard" on completion.
Feed this back into AI generation for future trees. Over time, AI learns
what difficulty level the user prefers. This is CD3 — the system adapts to
you.

### 6. "The Vigil" — Midnight Reset Ritual
Instead of silently resetting quests at midnight, show a brief ritual screen
if the user is active: "The old day ends. The vigil begins. Your quests
renew." 3-second animation. Makes the daily reset feel like a *moment*, not
a database operation.

---

## Summary: The One Slide

**Duskvow's aesthetic shell is 8/10. Its mechanical core is 3/10.**

The landing page, hero naming, title system, and visual identity are best-in-class
for the self-improvement space. But once you're past the onboarding, you're
using a checklist with an XP counter and a disconnected timer.

**The fix is connection.** Every feature must feed into one economy:
- Trees give XP and structure
- Dailies give XP and streaks
- Dungeons give XP and loot
- Loot buffs trees and dailies
- Streaks multiply everything
- Levels unlock new tiers of all three
- Embers (reflections) fuel buffs

**The priority is the Dungeon.** It's the feature with the widest gap between
its current state (plain timer) and its potential (AFK combat crawler). It's
also the most unique — no competitor has this. Ship it rough, iterate fast.

**The second priority is making levels matter.** Every other system depends on
progression feeling real. Right now, leveling up changes a number and sometimes
a title. It should unlock dungeons, increase generation limits, reveal hidden
nodes, and gate achievements.

**The third priority is daily quest variety.** The retention loop depends on
users wanting to open the app every day. Static quests become invisible after
a week. Rotating quests, challenge quests, and streak bonuses keep it fresh.
