# CONTEXT.md — Fast Session Bootstrap

> **Read this first.** 30-second orientation. For full details, see `STATE.md` + `CLAUDE.md`.
> Last updated: 2026-04-14

---

## What is Duskvow
Dark-fantasy AI self-improvement app. Users enter goals → AI generates RPG talent trees → users complete nodes → earn XP → progression, achievements, dungeons, loot. Aesthetic: **Dark Souls meets Notion, NOT Habitica.**

## Current Phase
**Between sprints.** Sprints A–D are DONE. Sprint E (Daily Quest Enhancement) is next. TASKS.md has no active tasks — current work is tooling/workflow polish.

## Stack (30-sec)
- **Frontend**: Next.js 16 App Router, TypeScript strict, Tailwind v4, Zustand, React Flow, Supabase client
- **Backend**: FastAPI, Pydantic v2, async, Gemini 2.5 Flash (thinking off)
- **DB**: Supabase Postgres + RLS
- **Hosting**: Vercel (FE) + Railway (BE)

## Hot Files (likely to touch in Sprint E)
- `backend/app/services/quests.py` — daily quest logic
- `backend/app/data/` — will need quest pools JSON
- `frontend/src/components/tree/QuestLogPanel.tsx` — quest UI
- `frontend/src/stores/userStore.ts` — streak state

## Golden Rules (non-negotiable)
1. CSS custom properties for all colors — never inline hex. See `globals.css`.
2. `npm run validate` before declaring done (pre-commit hook enforces).
3. No `any`, no `console.log`, no features outside sprint scope.
4. Optimistic UI < 300ms on all user actions.
5. Read `STATE.md` decisions log before contradicting past choices.

## Last Session (2026-04-14)
- Workflow overhaul: pre-commit → full validate, PostToolUse tsc hook added, SPEC.md archived, Sprint C/D rotated out of TASKS.md, STRATEGY.md trimmed to 66 lines, CONTEXT.md created, error boundaries added, custom slash commands + subagents scaffolded.
- Previous session: Tree generation latency fix — Gemini thinking disabled, p95 < 30s confirmed.

## Known Blockers / Fragility
- No frontend tests (backend has test scaffolding)
- Tree layout gets cramped at 25+ nodes (Dagre tuning)
- Node completion still visually flat (particle burst pending Sprint F)

## Where to Find More
- **Decisions + detailed session log**: `STATE.md`
- **Coding standards + visual tokens**: `CLAUDE.md`
- **Strategic direction + Octalysis**: `STRATEGY.md` (lean) or `docs/strategy/octalysis-audit-2026-04-11.md` (full)
- **Completed sprints**: `docs/sprints/`
- **Current/next tasks**: `TASKS.md`
