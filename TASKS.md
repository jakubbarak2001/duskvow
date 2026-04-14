# TASKS.md — Duskvow Task Queue

> **Purpose**: Current sprint tasks only. Completed sprints archived in `docs/sprints/`.
> **Status values**: `QUEUED` → `IN_PROGRESS` → `DONE` / `FAILED`
> **Rule**: Execute tasks in order. Do NOT skip ahead. Run `npm run validate` after each.
> **History**: Sprint A (Hero & Level), Sprint B (Daily Quests), Sprint C (Dungeon AFK), Sprint D (Progression & Unlocks) — all DONE. See `docs/sprints/`.

---

## Blocked / Backlog (Deferred — Not Part of Current Sprint)

> These are parked ideas. Reference only. Do not execute unless moved to a sprint.

### 🔴 P0 TECH DEBT — React 19 Compiler Rule Violations (12 errors, blocks pre-commit hook)
As of 2026-04-14, `npm run validate` fails on pre-existing ESLint errors in committed code. These are React 19 Compiler rule violations (`react-hooks/set-state-in-effect`, `react-hooks/refs`, `react-hooks/preserve-manual-memoization`) that surfaced when the upgraded pre-commit hook started enforcing the full validate pipeline. **Fix required before next commit** (or the pre-commit hook will block).

Affected files:
- `frontend/src/components/ui/StreakFlame.tsx:41` — setState in effect body (wrap in setTimeout or event handler)
- `frontend/src/components/ui/StatsBar.tsx:113` — ref access during render (move to effect or event handler)
- `frontend/src/components/tree/TreeViewPage.tsx:135,186` — useCallback deps mismatch with manual memoization
- `frontend/src/app/dungeon/page.tsx:118, 203, 1105, 1118` — 4× setState in effect
- `frontend/src/app/leaderboard/page.tsx:87` — setState in effect, plus memoization warning at :71
- `frontend/src/app/vows/page.tsx:819` — setState in effect

Approach: each violation is a small, local refactor. None require architectural changes. Budget ~2h. Don't suppress rules — they flag real cascading-render bugs.

### Other Backlog
- **WoW-Style Tree Grid Layout** — needs design decision (Dagre vs fixed grid)
- **Node Icon Image Generation** — needs budget/speed research
- **Tree Background Generation** — depends on icon gen research
- **Playwright Smoke Tests** — 5-test golden path: auth → dashboard → generate tree → complete node → dungeon → collect loot. Recommended next tooling investment.
- **Backend type checking in validate.mjs** — add `mypy` or `pyright` pass on `backend/app/`.

---

## Current Sprint — (none active)

> No sprint is currently active. When starting a new sprint, replace this section with
> the sprint goal, design principle, and ordered task list. Sprint E is the next planned.

---

## Sprint Backlog (Future Sprints — Not Yet Specified)

| Sprint | Theme | Status |
|--------|-------|--------|
| Sprint E | Daily Quest Enhancement (Quest Pools, Rotation, Streak Bonuses) | `PLANNED` |
| Sprint F | Tree Experience Polish (Celebrations, Fog of War, Choice Branching) | `PLANNED` |
| Sprint G | Hearth Page + Ember Economy (Ember Buffs, Journal → XP, Loot Spending) | `PLANNED` |
