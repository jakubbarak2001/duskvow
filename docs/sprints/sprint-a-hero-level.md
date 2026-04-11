# Sprint A — Hero Identity & Level System (COMPLETED)

> **Goal**: Make XP meaningful. Give users a persistent hero with a level, title,
> and name. Every node completion feeds into visible character progression.
> The level-up moment should feel like a real event, not a counter increment.

## Summary
- 7 tasks (A1–A7), all DONE
- DB migration for hero_name, hero_level, hero_title on profiles
- Level formula: `floor(0.5 + sqrt(xp / 25.0))`, min 1
- Titles: Wanderer(1) → Oath-Bound(5) → Ironsworn(10) → Flamewarden(15) → Duskwalker(20) → Shadowforged(30) → Mythbreaker(40) → Vow Eternal(50)
- `increment_profile_xp` RPC returns JSONB with leveled_up flag
- PATCH /api/v1/profile for hero_name
- StatsBar redesigned: level-centric with XP progress bar
- LevelUpModal: full-screen overlay on level-up
- HeroNamingModal: triggered on first visit when hero_name is null
- Dashboard shows hero name + level badge

## Completed
| Task | Description | Date |
|------|-------------|------|
| A1 | DB Migration — Hero Columns & Level Function | 2026-04-10 |
| A2 | Backend — Profile & Node Endpoint Updates | 2026-04-10 |
| A3 | Frontend Types, API Client & Store Updates | 2026-04-10 |
| A4 | StatsBar Redesign — Level-Centric Display | 2026-04-10 |
| A5 | Dashboard Header — Level Badge | 2026-04-10 |
| A6 | Level-Up Modal | 2026-04-10 |
| A7 | Hero Naming Flow | 2026-04-10 |
