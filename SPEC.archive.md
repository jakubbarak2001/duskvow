# SPEC.archive.md — Historical Snapshot (DO NOT READ FOR SESSION CONTEXT)

> **ARCHIVED 2026-04-14.** This file is the original LAYER 1-4 STATE.md from 2026-03-30.
> It has been superseded by the slimmer STATE.md + CLAUDE.md. Kept only for historical reference.
>
> **For current state, read**: `CLAUDE.md`, `STATE.md`, `CONTEXT.md`.
>
> Last meaningful update: 2026-03-30

---

## LAYER 1 — SESSION RULES (Static)

### Claude's Role
You are a **senior full-stack developer** working on Duskvow. You are concise, opinionated, and ship production-quality code. You do NOT:
- Add features outside the current task scope
- Use `console.log` — use proper error handling
- Guess at design decisions — ask or check this file
- Write placeholder/TODO code without flagging it explicitly

### Project Vision
Duskvow is a **dark fantasy AI-powered self-improvement app**. Users enter goals → AI generates RPG-style talent trees → users complete nodes → earn XP → track progress. The aesthetic is **dark, atmospheric, and serious** — think Dark Souls meets Notion, not Habitica. No cute mascots, no pixel art, no pastel colors.

### Visual Identity — THE GOLDEN RULE
The landing page (`page.tsx`) defines the visual bar for the entire app. Every new page/component MUST match this level of craft:
- **Fonts**: Cinzel (headings, nav, buttons), Crimson Pro (landing body copy), Inter (app body text)
- **Color palette**: Midnight backgrounds (`#0A0A12` → `#2E2E3A`), warm parchment text (`#E0D8C8`), ember accent (`#C84B11`), gold accent (`#FFD700`), blood red (`#8B0000`)
- **Atmosphere**: Noise overlay, floating ember particles, radial glows, gold gradient dividers
- **Typography**: Large Cinzel headings, generous spacing, `letter-spacing: 0.15-0.35em` on labels
- **Buttons**: Ember gradient backgrounds, Cinzel font, uppercase, wide padding, hover glow effects
- **NEVER**: Pure black `#000000`, pure white `#FFFFFF`, inline hex colors, light mode anything

### Visual Reference Notes (from landing page screenshots)
The landing page is the **quality benchmark** for the entire app. Specific details:
- **Hero**: Full-bleed dark fantasy background image (`hero_bg.webp`) — ruined cityscape/fortress silhouettes in foreground, dark stormy sky, and a massive glowing ember tree on the right side with fire-like orbs in its branches. NOT a character/warrior — it's an environmental scene. Overlaid with gradient darkening (70% opacity top, 50% mid, 85% bottom) + radial text shadow for readability. Ember particles float upward over everything.
- **Anti-section**: Has its own subtle background image — a dark archway/corridor with warm light bleeding through, heavily overlaid at 85% opacity. Creates depth between sections without competing with text.
- **Section dividers**: Gold gradient horizontal lines (`linear-gradient(90deg, transparent, var(--gold-dim), transparent)`) + centered ornamental labels like `◆  A Different Oath  ◆` in small Cinzel caps with wide letter-spacing.
- **Spacing**: Extremely generous — sections have 4-8rem vertical padding. Text blocks max-width 560-700px centered. Breathing room is a core aesthetic choice.
- **Step indicators**: Roman numerals (I, II, III) in faded ember (`rgba(196, 85, 58, 0.3)`), grid-aligned left of content. Very large font size, intentionally low contrast — decorative more than functional.
- **Strikethrough pattern**: Used in anti-section — crossed-out text in muted `var(--ghost)` color contrasting with bright bone-white bold statement below ("We built for the rest of you.").
- **CTA buttons**: Ember gradient (`linear-gradient(135deg, var(--ember), #a03a28)`), wide padding (1.1rem 3.5rem), Cinzel uppercase, hover reveals brighter gradient + glow shadow.
- **Ember particles**: Floating upward across the entire page, multiple sizes (2-6px), mix of ember-red and gold colors, varying speeds and sway patterns. Subtle but always present — gives the page a living, atmospheric feel.
- **The app pages (dashboard, tree view) do NOT yet match this visual quality.** This is a known gap.

### Design Token Usage
All colors MUST use CSS custom properties from `globals.css`:
```
Backgrounds: var(--bg-abyss), var(--bg-shadow), var(--bg-surface), var(--bg-elevated), var(--bg-highlight)
Text: var(--text-primary), var(--text-secondary), var(--text-muted)
Accents: var(--accent-ember), var(--accent-gold), var(--accent-blood)
Borders: var(--border-default), var(--border-muted)
Rarity: var(--rarity-common) through var(--rarity-mythic)
States: var(--state-locked), var(--state-available), var(--state-progress), var(--state-complete)
```

Tailwind v4 theme aliases are registered in `globals.css` under `@theme inline` — use `bg-bg-surface`, `text-text-primary`, etc. in Tailwind classes, OR use `style={{ color: "var(--text-primary)" }}` for inline.

### Component Patterns
- **Shared UI** → `components/ui/` (StatsBar, buttons, inputs)
- **Layout** → `components/layout/` (Navbar)
- **Tree-specific** → `components/tree/` (SkillNodeComponent, TreeCanvas, NodeDetailPanel)
- **Wizard** → `components/tree-wizard/` (GoalInputStep, FollowUpQuestionsStep, GeneratingStep)
- **Auth** → `components/auth/` (AuthForm)

### Workflow Rules
- **Always work on a feature branch** — never commit directly to `main`
- Branch naming: `feature/description` or `fix/description`
- Commit messages: `type(scope): description` (e.g., `feat(tree): add node completion animation`)
- Run `npx tsc --noEmit` and `npm run build` before declaring any task done
- If you change a component's props, check ALL files that import it

### Performance Budgets
- Every user action (click, complete, navigate) must resolve UI feedback in **< 300ms**
- API calls must have **optimistic UI updates** — don't wait for server response to update visuals
- AI generation is the only acceptable "long wait" (up to 30s, with loading animation)
- No unnecessary re-renders — check Zustand selector patterns

### Tech Stack Quick Reference
| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js 16 (App Router) + TypeScript | Strict TS, no `any` |
| Styling | Tailwind CSS v4 + CSS custom properties | Dark-only, design tokens |
| State | Zustand | `stores/treeStore.ts`, `stores/userStore.ts` |
| Auth | Supabase Auth (email/password) | JWT in Bearer header |
| API Client | `lib/api.ts` centralized fetch wrapper | All calls go through here |
| Tree Rendering | React Flow (`@xyflow/react`) + Dagre layout | Custom node/edge components |
| Backend | Python FastAPI + Pydantic v2 | Railway hosting |
| Database | Supabase PostgreSQL + RLS | All tables have Row Level Security |
| AI | Google Gemini API | Structured JSON output only |
| Frontend Hosting | Vercel (primary), Cloudflare Pages (tested) | `write-env.mjs` prebuild script for CF |

---

## LAYER 2 — DECISIONS LOG (Append-Only)

> Record every significant architectural or design decision here.
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

---

## LAYER 3 — CURRENT STATE (Update Every Session)

### What's Built & Working
- [x] **Landing page** — Full dark fantasy design with ember particles, noise overlay, Cinzel/Crimson Pro typography, hero with background image, anti-section, how-it-works, CTA, footer
- [x] **Auth flow** — Supabase email/password login, auth guard on protected routes, middleware redirect
- [x] **Dashboard** — Lists active/finished trees, stats bar (XP, streak, nodes), delete with confirmation, "New Vow" button with generation limit display
- [x] **Tree creation wizard** — 3-step flow: goal input → AI follow-up questions → generating animation → redirect to tree view
- [x] **Interactive skill tree** — React Flow canvas with custom node shapes (circle/square/diamond/hexagon), Dagre auto-layout, zoom/pan, node state colors, tier glow effects
- [x] **Node detail panel** — Slide-in panel on node click, shows description/type/tier/XP/status, Start/Complete/Reset actions with optimistic updates
- [x] **Node completion flow** — Optimistic state update, XP tracking, prerequisite auto-unlock, completion pending lock
- [x] **Backend API** — FastAPI with all endpoints: profile, trees CRUD, node state mutations, AI generation with Gemini, rate limiting, generation status
- [x] **Database** — Supabase PostgreSQL with profiles, talent_trees, skill_nodes, daily_activity tables, all with RLS

### What's Broken / Known Issues
- [ ] **Tree UI quality inconsistency** — AI-generated trees sometimes produce ugly layouts despite Dagre. Node spacing can be too tight with 25+ nodes. Needs investigation into Dagre `nodesep`/`ranksep` tuning.
- [ ] **Dashboard progress only showing first node** — Previously reported bug where completing multiple nodes only reflected the first completion in dashboard stats. Status: believed fixed with optimistic update refactor, but needs regression testing.
- [ ] **Slow node completion perceived latency** — Optimistic updates help, but the visual feedback (golden border, glow) could be more dramatic. No particle burst animation implemented yet.
- [ ] **No automated tests** — Zero frontend tests. Backend has minimal test scaffolding (`tests/test_health.py`). This is a ticking time bomb.
- [ ] **No error boundaries** — CLAUDE.md specifies them but none are implemented. React Flow crashes can take down the whole page.

### What's Next (Priority Order)
1. **Validation infrastructure** — Add `npm run validate` script that runs `tsc --noEmit` + `next build` + any tests. Claude must run this before declaring tasks done.
2. **Visual polish on tree view** — Node completion particle burst, better node spacing, edge animation improvements
3. **Error boundaries** — Wrap TreeCanvas and major sections
4. **Landing page → App style consistency** — Dashboard and tree pages should feel as crafted as the landing page (currently functional but not polished)
5. **Streak tracking validation** — Verify daily_activity updates correctly on node completion

### File Change Log (Last 3 Sessions)
> Update this with what you changed each session.

**Session: 2026-03-30 (initial STATE.md creation)**
- Created STATE.md
- No code changes — documentation session

---

## LAYER 4 — VALIDATION CHECKLIST

> Claude: Run through this BEFORE saying "done" on any task.

### After Every Code Change
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] `npm run build` succeeds (no build errors)
- [ ] All design tokens used — no inline hex colors
- [ ] No `console.log` left in code
- [ ] No `any` types introduced
- [ ] Imports use `@/` path aliases (no `../../..`)
- [ ] New components follow existing patterns in their directory

### After UI Changes
- [ ] Dark fantasy aesthetic maintained (check against landing page)
- [ ] Cinzel for headings, Inter for body text
- [ ] Interactive elements have hover/focus states
- [ ] Mobile responsive (test at 375px width mentally)
- [ ] No visual regressions on existing pages

### After API/Data Changes
- [ ] Optimistic UI updates in place
- [ ] Error states handled and displayed to user
- [ ] Loading states shown during async operations
- [ ] Zustand store updated correctly
- [ ] Types in `types/index.ts` match backend schema

---

## APPENDIX — Key File Locations

| What | Where |
|------|-------|
| Design tokens | `frontend/src/app/globals.css` |
| Landing page (visual reference) | `frontend/src/app/page.tsx` |
| API client (all backend calls) | `frontend/src/lib/api.ts` |
| TypeScript types | `frontend/src/types/index.ts` |
| Tree state management | `frontend/src/stores/treeStore.ts` |
| Custom node rendering | `frontend/src/components/tree/SkillNodeComponent.tsx` |
| Tree layout algorithm | `frontend/src/components/tree/TreeCanvas.tsx` → `applyDagreLayout()` |
| Node interaction logic | `frontend/src/components/tree/TreeViewPage.tsx` → `handleNodeUpdate()` |
| Supabase client | `frontend/src/lib/supabase.ts` |
| Auth hook | `frontend/src/hooks/useUser.ts` |
| Tailwind config | `frontend/postcss.config.mjs` (v4 — PostCSS plugin, no separate config) |
| Env var bridge (Cloudflare) | `frontend/scripts/write-env.mjs` |