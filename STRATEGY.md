# STRATEGY.md — Duskvow Strategic Direction

> **Purpose**: Lean summary for session context. Full audit lives in `docs/strategy/octalysis-audit-2026-04-11.md`.
> **Last review**: 2026-04-11 | Framework: Octalysis (Yu-kai Chou)

---

## The One-Slide Thesis

**Duskvow's aesthetic shell is 8/10. Its mechanical core was 3/10 and is now ~6/10.**

The landing page, hero naming, title system, and visual identity are best-in-class for the self-improvement space. The 2026-04 sprints (C Dungeon, D Progression) closed the biggest mechanical gaps. Sprints E–G continue the "connection" thesis.

**The core design principle**: every feature must feed into one economy.
Trees → XP + structure. Dailies → XP + streaks. Dungeons → XP + loot. Loot → buffs trees/dailies. Streaks → multiply everything. Levels → unlock tiers. Embers → fuel buffs.

---

## Octalysis Scorecard (as of 2026-04-11)

| Core Drive | Score | Status |
|---|---|---|
| CD1 Epic Meaning | 8/10 | Strongest — landing page, hero titles, lore |
| CD2 Accomplishment | 4/10 → 6/10 | Sprint D fixed "sham progression" via level unlocks |
| CD3 Creativity | 1/10 | **Critical gap** — user is consumer of AI output, not creator |
| CD4 Ownership | 3/10 | Weak — trees are generic, no customization |
| CD5 Social | 0/10 | Intentional — solo focus is a brand choice |
| CD6 Scarcity | 2/10 → 4/10 | Generation limits + level gates added in D |
| CD7 Unpredictability | 3/10 → 5/10 | Dungeon loot + event rolls add surprise |
| CD8 Loss & Avoidance | 2/10 → 4/10 | Streak multiplier + retreat-no-loot stakes |

---

## Top 3 Priorities (Active)

1. **CD3 — Creativity gap**. User cannot reshape trees, create nodes, or author daily quests. This is the biggest remaining retention risk. Addressed partially in Sprint F (Choice Branching).
2. **Daily quest variety (retention loop)**. Static quests go invisible after a week. Sprint E (Quest Pools, Rotation, Streak Bonuses) is the primary fix.
3. **Celebration density**. Level-up modal is good, but users complete 20 nodes between level-ups with flat feedback. Sprint F (Tree Experience Polish — celebrations, particles).

---

## What the Next Three Sprints Must Ship

- **Sprint E — Daily Quest Enhancement**: Rotating quest pools, challenge quests, visible streak milestones, quest chain variety.
- **Sprint F — Tree Experience Polish**: Completion celebrations, fog-of-war for undiscovered branches, functional choice branching.
- **Sprint G — Hearth + Ember Economy**: Ember-to-buff pipeline, journal entries → XP, loot spending sinks, trophy room.

Each sprint's detailed design is in `docs/strategy/octalysis-audit-2026-04-11.md` (Parts 6-8).

---

## Design Guardrails (Non-Negotiable)

- **No Habitica energy**. Dark Souls meets Notion. No cute mascots, no pastels, no +1 confetti.
- **No social features until post-launch**. Solo focus is part of the brand. Covenants/guilds are Part 9 future work only.
- **No gacha, no lootboxes, no real-money currency**. Integrity > monetization hooks.
- **Every XP number must anchor to something tangible**. If 10 XP doesn't "buy" a visible outcome in the same session, the economy is broken.
- **Ship rough, iterate fast**. Dungeon shipped as MVP and is already the strongest retention feature.

---

## Post-Pivot Architecture (Follow-up Tasks)

Low-priority architectural items identified during the in-app voice pivot (2026-04-17). Not part of the pivot itself — implement once the copy work lands and polish bandwidth permits.

- **Extract `FirekeeperLine` into a shared component.** Currently inline in `app/dashboard/page.tsx:611–650`. It is the strongest on-brand mentor-voice pattern in the codebase (*"The flame waits. Name your vow." / "The path waits. The flame remembers you." / "The embers hold. Rest if you need to."*). Extracting it unlocks reuse on the tree page, the vows page, and empty-state moments across the app — surfaces that currently carry no atmospheric voice. Props to consider: `state: "no-tree" | "has-open-work" | "all-done"` + optional `treeTitle?: string` so the line can adapt per-surface.

---

> For the full audit — CD breakdown, SWOT, connection-flow diagram, sprint plans, and additional ideas — see `docs/strategy/octalysis-audit-2026-04-11.md`.
