# CLAUDE.md — Duskvow Project Configuration

> Read STATE.md before writing code. Update STATE.md Layer 3 before ending a session.

## Project

**Duskvow** — dark fantasy AI-powered self-improvement app. Users enter goals, AI generates RPG-style talent trees, users complete nodes and earn XP. Aesthetic: Dark Souls meets Notion. NOT Habitica.

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), TypeScript strict, Tailwind v4, Zustand, React Flow |
| Backend | Python 3.11+ FastAPI, Pydantic v2, async everywhere |
| Database | Supabase PostgreSQL + RLS + Auth |
| AI | Google Gemini (2.0-flash for speed, 2.5-pro for quality) |
| Hosting | Vercel (frontend) + Railway (backend) |

## Architecture

```
frontend/src/ — app/ (pages), components/ (tree/, ui/, layout/, tree-wizard/, auth/),
                hooks/, lib/ (api.ts, supabase.ts), stores/, types/
backend/app/  — api/v1/, core/, schemas/, services/, prompts/, data/
supabase/     — migrations/
```

## Coding Standards

**Python**: Type hints on all signatures. Pydantic v2 schemas. `async def` for routes + DB. `Depends()` for DI. `HTTPException` with meaningful detail. Google-style docstrings. snake_case functions, PascalCase classes.

**TypeScript**: Strict — no `any`. Functional components only. Named exports. Zustand for global state. All API calls through `lib/api.ts`. camelCase functions, PascalCase components. Path aliases `@/`.

**Styling**: CSS custom properties for ALL colors (defined in `globals.css`). NEVER inline hex. Dark mode ONLY. Cinzel (headings), Inter (body), Crimson Pro (landing body). Min contrast 4.5:1 body, 3:1 large text.

**API**: REST `/api/v1/...`. Envelope: `{ "data": ..., "error": null }`. Supabase JWT in `Authorization: Bearer`. Cursor-based pagination.

## Visual Identity (THE GOLDEN RULE)

The landing page defines the quality bar. Every page must match this level of craft.

```
Backgrounds: var(--bg-abyss) #0A0A12 → var(--bg-highlight) #2E2E3A
Text:        var(--text-primary) #E0D8C8 | var(--text-secondary) #A09888 | var(--text-muted) #6B6358
Accents:     var(--accent-ember) #C84B11 | var(--accent-gold) #FFD700 | var(--accent-blood) #8B0000
Rarity:      --rarity-common #808080 → --rarity-mythic #FFD700
States:      --state-locked rgba(128,128,128,0.4) → --state-complete #FFD700
```

NEVER: pure black #000, pure white #FFF, inline hex colors, light mode.
Tailwind aliases: `bg-bg-surface`, `text-text-primary`, etc. OR `style={{ color: "var(--text-primary)" }}`.

## Node System

| Shape | Type | Description |
|-------|------|-------------|
| Circle | habit | Daily/recurring tasks |
| Square | action | One-time tasks |
| Diamond | choice | User picks one branch |
| Hexagon | keystone | Major milestones |

States: locked (40% opacity) → available (pulse animation) → in_progress (filling ring) → completed (gold border, particle burst).

Tiers: common → uncommon → rare → epic → legendary → mythic. XP: 10 → 20 → 35 → 50 → 75 → 100.

## Pitfalls

- No `localStorage` — Zustand + Supabase
- No `console.log` — proper error handling
- No features outside current sprint — ask first
- No relative imports past 2 levels — use `@/`
- Optimistic UI on all user actions (< 300ms feedback)

## Supabase CLI

```bash
npx supabase migration new <name>   # Create migration
npx supabase db push                # Push to remote
npx supabase migration list         # Check status
```

## Git

Commits: `type(scope): description` — feat, fix, refactor, style, test, docs, chore.
Branches: `feature/description`, `fix/description`. Never commit .env or secrets.

## Workflow Rules

### Planning Rule
For any task estimated as L or XL size, enter plan mode first. Present the approach, get approval, then execute. Small/medium tasks can be executed directly.

### Post-Task Self-Review (MANDATORY)
After completing any task, before declaring done:
1. `cd frontend && npx tsc --noEmit` — zero errors
2. `cd frontend && npm run build` — succeeds
3. Re-read every file you modified — check for:
   - Inline hex colors (must use design tokens)
   - `console.log` statements
   - `any` types
   - Missing error handling on API calls
4. If you changed a component's props, grep for all importers and verify they pass the new props
5. State what you verified in your completion message

### Task Execution
- Execute tasks from TASKS.md in order. Do NOT skip ahead.
- Follow the outcome and acceptance criteria. Choose the best implementation approach.
- Follow existing patterns in the codebase (check similar files before writing new ones).
- After completing a task, update its status in TASKS.md to `DONE`.

### Image Placeholders
When building UI that needs generated images, add `<img>` with descriptive `src` paths and include the AI generation prompt as a code comment above the element. User generates images externally (Leonardo.ai or similar).
