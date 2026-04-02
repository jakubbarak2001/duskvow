# STATE.md — Duskvow Living Project State

> **Purpose**: This file is the single source of truth for every Claude session.
> Read this BEFORE touching any code. Update this BEFORE ending any session.
>
> Last updated: 2026-03-30

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
- **Hero**: Full-bleed dark fantasy background image (`hero_bg.webp`) — warrior silhouette in mist/fog. Overlaid with gradient darkening + radial text shadow for readability. Ember particles float upward over everything.
- **Section dividers**: Gold gradient horizontal lines (`linear-gradient(90deg, transparent, var(--gold-dim), transparent)`) + centered ornamental labels like `◆  A Different Oath  ◆` in small Cinzel caps with wide letter-spacing.
- **Spacing**: Extremely generous — sections have 4-8rem vertical padding. Text blocks max-width 560-700px centered. Breathing room is a core aesthetic choice.
- **Step indicators**: Roman numerals (I, II, III) at 3rem in faded ember (`rgba(196, 85, 58, 0.3)`), grid-aligned left of content.
- **Strikethrough pattern**: Used in anti-section — crossed-out text in muted `var(--ghost)` color contrasting with bright bone-white statement below.
- **CTA buttons**: Ember gradient (`linear-gradient(135deg, var(--ember), #a03a28)`), wide padding (1.1rem 3.5rem), Cinzel uppercase, hover reveals brighter gradient + glow shadow.
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
- [x] **Dashboard (Hub)** — Hub scene with three door cards (Vow Chamber → `/vows`, Dungeon locked, Hearth locked), compact XP/Streak header, ember particles
- [x] **Vow Chamber (`/vows`)** — Full tree management page: "The Vow Chamber" heading, "← Return to Hub" link, Navbar, New Vow CTA, generation status, StatsBar, Brazier, tree list (active/finished), delete confirmation, empty state
- [x] **Tree creation wizard** — 3-step flow: goal input → AI follow-up questions → generating animation → redirect to tree view
- [x] **Interactive skill tree** — React Flow canvas with custom node shapes (circle/square/diamond/hexagon), Dagre auto-layout, zoom/pan, node state colors, tier glow effects
- [x] **Node detail panel** — Slide-in panel on node click, shows description/type/tier/XP/status, Start/Complete/Reset actions with optimistic updates
- [x] **Node completion flow** — Optimistic state update, XP tracking, prerequisite auto-unlock, completion pending lock
- [x] **Backend API** — FastAPI with all endpoints: profile, trees CRUD, node state mutations, AI generation with Gemini, rate limiting, generation status, embers CRUD
- [x] **Embers backend** — `public.embers` table with RLS, GET/POST/DELETE `/api/v1/embers` endpoints, 50-ember cap enforced server-side
- [x] **Embers frontend** — `<Brazier>` on dashboard with real data; add flow (form → API → drop animation); delete flow (tooltip icon → confirm dialog → API remove); 50-cap enforced in UI; glow intensity scales with count; cold empty state
- [x] **Hub page** — `/dashboard` rewritten as atmospheric hub: three door cards (Vow Chamber unlocked → `/vows`, Dungeon locked, Hearth unlocked → `/hearth`), custom hub header (logo + compact XP/Streak stats + sign-out), ember particles, central radial glow, noise overlay, responsive mobile stack
- [x] **Hearth (`/hearth`)** — Atmospheric sanctum page: "The Hearth" Cinzel heading, "← Return to Hub" link, Navbar, `<Brazier>` with real user embers (API connected), `<AddEmberForm>` below, "coming soon" banner for trophy room/customization, auth guard, warmer dual-glow atmosphere (ember radial from top + firelight from bottom), 8 ember particles
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

**Session: 2026-04-02 (TASK 2B-1 — Asset Optimization)**
- `frontend/public/images/card_texture.webp` — New. Converted from `card_texture.jpg` at 512x512, quality 80. 21KB.
- `frontend/public/images/entry_background.webp` — New. Converted from `entry_background.jpg` at 1920x1080, quality 80. 58KB.
- `frontend/public/images/sealed_door.webp` — New. Converted from `sealed_door.jpg` at 256x256, quality 80. 5.7KB.
- `frontend/public/images/anvil.webp` — New. Converted from `anvil.jpg` at 256x256, quality 80. 3.4KB.
- Note: Task spec referenced `brazier.jpg` (absent) and `anvil_video.mp4` (absent) — skipped. Actual file was `anvil.jpg`, converted to `anvil.webp`. Total new asset size: ~89KB.

**Session: 2026-04-02 (TASK P1-5 — Move Brazier to Hearth Placeholder)**
- `frontend/src/app/hearth/page.tsx` — New page. Atmospheric hearth sanctum with auth guard. Fetches `api.listEmbers(token)`. `<Brazier>` centered with real embers, drop animation, add click, delete request. `<AddEmberForm>` below (toggleable, hidden while adding). 50-ember cap message. "Coming soon" banner: "Your sanctum grows. Trophy room, character customization, and more — forging soon." Warmer dual glow: top ember radial (0.13 opacity) + bottom firelight radial. 8 slow ember particles. Noise overlay, Navbar, "← Return to Hub" link. Ember delete confirm modal identical to vow chamber pattern.
- `frontend/src/app/dashboard/page.tsx` — Hearth door changed from locked (`div` + shake click handler) to unlocked (`Link href="/hearth"`). Now uses `hub-door-unlocked` classes, `hub-door-glow-ring` (dim, 0.5 opacity), `hub-door-symbol-unlocked`, `hub-door-arch hub-door-arch-unlocked`, ember leak, and "Tend your brazier" status badge. Shake state for "hearth" no longer used.

**Session: 2026-04-02 (TASK P1-4 — Update Auth Redirect & Navigation Flow)**
- `frontend/src/components/layout/Navbar.tsx` — "Dashboard" link renamed to "Hub"; added "Vow Chamber" link pointing to `/vows`; "New Vow" link unchanged.
- `frontend/src/components/tree/TreeViewPage.tsx` — Back button changed from "← Dashboard" (`/dashboard`) to "← Vow Chamber" (`/vows`).
- `frontend/src/components/auth/AuthForm.tsx` — No change needed; already redirects to `/dashboard` (hub) on SIGNED_IN event.

**Session: 2026-04-02 (TASK P1-3 — Hub Door Active State — Live Data on Vow Chamber)**
- `frontend/src/app/dashboard/page.tsx` — Added `earnedXp` state (sum of `earned_xp` from active trees). Updated `listTrees` handler to compute both `activeVowCount` and `earnedXp` from active trees in one pass. Vow Chamber door status badge now has three states: loading → "Enter"; 0 active trees → "Begin your journey"; 1+ active trees → "{X} active vow(s)" + "{Y} XP earned" (two-line flex column, XP in gold). Glow ring opacity now scales with activity: 0 trees → 0.4 (dim), 1-2 trees → 0.75 (medium), 3+ trees → 1.0 (bright). No other doors or pages touched.

**Session: 2026-04-02 (TASK P1-2 — Vow Chamber Page — Tree List Migration)**
- `frontend/src/app/vows/page.tsx` — New page. Full tree management content migrated from old dashboard. "The Vow Chamber" Cinzel heading, "← Return to Hub" link above heading navigates to `/dashboard`, `<Navbar />` visible. Auth guard (redirect to `/auth`). Fetches profile, trees, generation status, embers via `Promise.allSettled`. All existing functionality preserved: New Vow CTA (ember gradient, disabled at cap), generation remaining display, StatsBar, Brazier + AddEmberForm + ember delete confirm dialog, active/finished tree sections with `SectionHeader`, `TreeCard` with delete confirmation + progress bar, empty state with atmospheric treatment. Ember particles (6) + noise overlay + radial glow for atmosphere. `SectionHeader` and `TreeCard` defined as local functions (same as old dashboard pattern).

**Session: 2026-04-02 (TASK P1-1 — Hub Page — Layout & Atmosphere)**
- `frontend/src/app/dashboard/page.tsx` — Full rewrite. Old dashboard (tree list, StatsBar, Brazier, New Vow CTA) replaced with hub scene. Keeps auth guard + `useUser`. Fetches only `getProfile` + `listTrees` (for active vow count). Custom hub header (logo left, compact XP+Streak center, sign-out right; no Navbar). Three door cards: "The Vow Chamber" (unlocked, Link to `/vows`, ember glow arch, pulsing glow ring, ember leak at base, ᛟ rune icon, active vow count status badge), "The Dungeon" (locked, ⚔ icon, chains overlay, shake on click), "The Hearth" (locked, 🜂 icon, shake on click). 8 slow ember particles. Central warm radial glow. Noise overlay. Stone floor gradient. `handleSignOut` uses `getSupabase().auth.signOut()`.
- `frontend/src/app/globals.css` — Added HUB PAGE STYLES section: `@keyframes hub-door-shake` (locked door click feedback), `@keyframes hub-chain-sway` (dungeon hover rattle), `@keyframes hub-ember-pulse` (unlocked arch glow), `@keyframes hub-glow-ring-pulse` (outer ring). Classes: `.hub-doors-grid` (flex row, wraps to column on ≤760px), `.hub-door` base, `.hub-door-unlocked` (ember border, hover scale+elevate), `.hub-door-locked` (56% opacity, muted), `.hub-door-hearth`, `.hub-door-shake`, `.hub-door-glow-ring`, `.hub-door-arch` + `.hub-door-arch-unlocked`, `.hub-door-chains` (diagonal repeating-gradient), `.hub-door-ember-leak`, `.hub-door-symbol` + `-unlocked`/`-locked`/`-hearth`, `.hub-door-content`, `.hub-door-title`, `.hub-door-subtitle`, `.hub-door-status` + `-unlocked`/`-locked`, `.hub-lock-icon`. Mobile breakpoint at 760px stacks doors vertically.

**Session: 2026-04-02 (TASK 3B-5 — Brazier Integration — Dashboard + API Wiring)**
- `frontend/src/app/dashboard/page.tsx` — Added `Ember[]` state + `showAddForm`, `animatingEmberId`, `confirmDeleteEmberId`, `deletingEmber`, `addingEmber` states. Fetches `api.listEmbers(token)` alongside other data in `Promise.allSettled`. Added `handleAddEmber` (calls `api.createEmber`, prepends to array, sets `animatingEmberId`, clears after 1.5s) and `handleDeleteEmberConfirm` (calls `api.deleteEmber`, filters from array). Added `◆ Your Brazier ◆` section via `<SectionHeader label="Your Brazier">` between stats bar and tree list. `<Brazier>` wired with real embers, animation id, drop complete callback, add click (hidden at cap), delete request. `<AddEmberForm>` rendered below brazier (toggleable, hidden while `addingEmber`). 50-ember cap message shown when at limit. Ember delete confirm modal: fixed overlay with "Extinguish this ember?" dialog, blood-red confirm + muted cancel buttons.
- `frontend/src/components/ui/Brazier.tsx` — Added `onDeleteRequest?: (emberId: string) => void` prop. Delete icon button (×, blood-red) added inside hover tooltip alongside title span. Button stops propagation.
- `frontend/src/app/globals.css` — `.brazier-tooltip` updated: `pointer-events: none` → `pointer-events: auto`, added `display: flex; align-items: center` to support inline delete button.

**Session: 2026-04-02 (TASK 3B-4 — Add Ember Form & Drop Animation)**
- `frontend/src/components/ui/AddEmberForm.tsx` — New form: title input (required, 1-100 chars) + description textarea (optional, max 500 chars). Inline validation with error message. Dark fantasy styling: `--bg-shadow` container, `--bg-abyss` inputs with ember focus glow, Cinzel labels (`0.25em` letter-spacing uppercase), character counters. Ghost cancel + ember gradient submit (inherits `wiz-btn-primary`, compact padding override). `onSubmit({ title, description })` + `onCancel` callbacks — parent drives visibility.
- `frontend/src/components/ui/Brazier.tsx` — Added `animatingEmberId?: string | null` and `onDropComplete?: () => void` props. Ember float wrapper gets `.ember-drop` class when its id matches `animatingEmberId`; `onAnimationEnd` fires `onDropComplete` so parent can clear the id. Drop overrides `animationDelay` to `0s` to prevent stale float delay interfering with the effect.
- `frontend/src/app/globals.css` — Added EMBER DROP ANIMATION section: `@keyframes ember-drop` with asymmetric keyframe spacing to simulate gravity (slow at top, rapid descent, impact burst at 76% with `scale(2.6)` + `brightness(5)`, bounce/settle). `.brazier-ember-float.ember-drop` applies `ease-in` timing, 1s duration, `fill-mode: forwards`, `z-index: 10`. Added ADD EMBER FORM STYLES section: `.ember-form`, `.ember-form-field`, `.ember-form-label`, `.ember-form-optional`, `.ember-form-input`, `.ember-form-textarea`, `.ember-form-counter`, `.ember-form-error`, `.ember-form-actions`, `.ember-form-cancel`, `.ember-form-submit`.

**Session: 2026-04-02 (TASK 3B-3 — Brazier Component — Visual Container)**
- `frontend/src/components/ui/Brazier.tsx` — New `<Brazier embers onEmberHover onAddClick />` component. Bowl/vessel built with CSS (rounded container, layered gradients). Fire core `radial-gradient` animates with `brazier-flicker`. Ember orbs (`8px` circles) use seeded pseudo-random positions (deterministic from index) with float animation. Float wrapper separates translate animation from hover scale to avoid keyframe/transition conflict. Glow intensity (`brazier-cold` → `brazier-blazing`) driven by ember count thresholds (0 / 1-5 / 6-15 / 16-30 / 31+). Hover shows tooltip with ember title. Empty state renders "Your brazier is cold" prompt. Rim + stem + base SVG-free structure below bowl. Responsive at 400px breakpoint.
- `frontend/src/app/globals.css` — Added BRAZIER COMPONENT STYLES section: `@keyframes brazier-flicker` (fire glow pulse), `@keyframes brazier-float` (ember bob/drift), `@keyframes brazier-rise` (particle ascent + fade). Intensity classes `.brazier-cold/.brazier-dim/.brazier-warm/.brazier-hot/.brazier-blazing` control fire-core gradient and vessel box-shadow glow. Tooltip, empty-state, rim/stem/base, add-button styles.

**Session: 2026-04-02 (TASK 3B-1 — Ember Database Table & API Endpoints)**
- `supabase/migrations/20260402055909_create_embers_table.sql` — New migration: `public.embers` table with UUID PK, `user_id` FK to `auth.users`, `title` (1-100 chars), optional `description` (max 500 chars), `created_at`. RLS enabled with "Users can CRUD own embers" policy. Index on `user_id`. Applied via `npx supabase db push`.
- `backend/app/models/ember.py` — New `Ember` SQLModel model (`table=True`) mirroring the DB schema.
- `backend/app/schemas/embers.py` — New `EmberCreate` and `EmberResponse` Pydantic v2 schemas.
- `backend/app/core/supabase.py` — Added ember helpers: `list_embers`, `count_embers`, `create_ember`, `get_ember`, `delete_ember`, and `EMBER_CAP = 50` constant.
- `backend/app/api/v1/embers.py` — New router with `GET /embers` (list), `POST /embers` (create, enforces 50-cap), `DELETE /embers/{ember_id}` (delete with ownership check). All require Bearer auth. Response shape: `{ "data": ..., "error": null }`.
- `backend/app/api/v1/__init__.py` — Registered `embers_router` at `/embers`.

**Session: 2026-03-31 (fix: Navbar logo matched to landing page)**
- `globals.css` — Added `--bone: #d4c9b0` token (landing page heading parchment; distinct from `--text-primary: #E0D8C8` which is slightly lighter)
- `Navbar.tsx` — Logo split into `<span>Dusk</span>` (`--bone`) + `<span>vow</span>` (`--accent-ember`); font-size 1.3rem, weight 700, letter-spacing 0.15em, uppercase, Cinzel — exact match to `.lp-nav-logo` on landing page; removed `text-xl font-bold` Tailwind classes and `--accent-gold` color

**Session: 2026-03-31 (fix: heading gold → text-primary across runner pages)**
- `globals.css` — Added `--gold-dim: #8a7340` token to `:root` (mirrors landing page `--gold-dim`; for ornamental dividers/labels only, never headings)
- `auth/page.tsx` — h1 "Enter the Realm": `--accent-gold` → `--text-primary`, removed bright gold textShadow; gold gradient divider now uses `var(--gold-dim)`; "Return to the Gates" hover changed from gold to `--text-secondary`
- `dashboard/page.tsx` — h1 "Your Vow Board": `--accent-gold` → `--text-primary`, removed gold textShadow; SectionHeader ornamental label: `rgba(255,215,0,0.55)` → `--text-secondary`; SectionHeader divider lines: gold → gold-dim rgba; empty state `◆` label: gold → `--text-muted`; empty state h2 textShadow removed; finished tree card title: `--accent-gold` → `--text-primary` (gold badge and left border accent preserved as completion-state indicators)
- `tree/new/page.tsx` — Step indicator done-state numeral: `--accent-gold` → `rgba(200,75,17,0.5)` (muted ember); done-state label: gold → `--text-muted`; done-state connector line: gold gradient → `rgba(200,75,17,0.35)`
- `GoalInputStep.tsx` — h1 "Make Your Vow": `--accent-gold` → `--text-primary`
- Rule established: `--accent-gold` is ONLY for XP numbers (`StatsBar`), node completion states (`--state-complete`), rarity indicators, progress bar fills, and the Duskvow logo. All page headings use `--text-primary`. All ornamental labels/dividers use `--text-secondary` / `--text-muted` / `--gold-dim`.

**Session: 2026-03-31 (TASK 2B-1 — Google OAuth Implementation)**
- `AuthForm.tsx` — Added `"google"` to `providers` array; existing `defaultButtonBackground`/`defaultButtonText` variables already dark-themed; `redirectTo` uses `window.location.origin + /dashboard` which works for OAuth callback
- `globals.css` — Added `.auth-submit-btn:has(svg)` overrides so Google button renders as dark surface (`--bg-elevated` background, muted border) instead of inheriting ember gradient from `auth-submit-btn`; hover shows subtle ember border glow matching the rest of the form

**Session: 2026-03-31 (TASK 2A-4 — Follow-Up "Something Else" Freetext Option)**
- `FollowUpQuestionsStep.tsx` — Added "Something else…" button (dashed border, muted text) after predefined options for every question; clicking opens a freetext `<input>` with `--bg-shadow` background and ember border-on-focus; freetext value used as answer (not the literal string); selecting a predefined option collapses freetext; 3-char minimum enforced with inline hint; `allAnswered` logic accounts for freetext mode per question
- `globals.css` — Added `.wiz-freetext-input:focus` (ember glow matching `.wiz-textarea:focus`) and `.wiz-freetext-input::placeholder` (muted italic)

**Session: 2026-03-31 (TASK 2A-1 — Auth Page Visual Refactor)**
- `auth/page.tsx` — Full atmospheric redesign: noise overlay (fixed), ember/gold radial glows (fixed), 11 floating ember particles (reusing wiz-float-a/b/c animations); auth card uses `--bg-shadow` with ember border glow + deep box-shadow; Duskvow logo linking to `/` at top; gold gradient divider; Cinzel heading at `clamp(1.75rem, 4vw, 2.3rem)` with gold text-shadow; Cinzel uppercase subtitle; "Return to the Gates" back link at bottom
- `AuthForm.tsx` — Pushed `appearance.variables` further: `fonts` object added (Cinzel for buttons/labels, Inter for inputs/body); tighter `brandAccent`, deeper `inputBackground` (`--bg-abyss`), wider button/input spacing; added `appearance.className` with `auth-submit-btn` (ember gradient button), `auth-label` (Cinzel uppercase), `auth-input` (deep focus glow)
- `globals.css` — Added AUTH PAGE STYLES section: `.auth-submit-btn` (ember gradient, Cinzel uppercase, hover glow), `.auth-label` (Cinzel 0.25em letter-spacing), `.auth-input` (abyss bg, gold focus ring)

**Session: 2026-03-31 (TASK 2A-3 — Dashboard Visual Refactor)**
- `dashboard/page.tsx` — Full atmospheric redesign: noise overlay (fixed), ember radial glow (fixed), 6 floating ember particles; "Your Vow Board" heading at `clamp(2.4rem, 5vw, 3.4rem)` with gold text-shadow; `wiz-btn-primary` ember gradient on "New Vow" CTA; `SectionHeader` component with `◆ Label ◆` ornamental Cinzel caps + gold gradient divider lines; `TreeCard` upgraded with left border accent in status color (`3px solid`), `dash-tree-card` hover class (elevation + glow), thicker progress bar (`h-2`) using glow fill classes; empty state atmospheric treatment with radial inner glow, italic copy, Cinzel eyebrow
- `StatsBar.tsx` — Full HUD redesign: full-width layout, 5xl Cinzel numbers, vertical separators between stats, gold glow on XP (`dash-stat-xp`), ember glow on Streak (`dash-stat-streak`), gold/complete glow on Nodes (`dash-stat-nodes`), mini XP milestone progress bar with label
- `globals.css` — Added DASHBOARD PAGE STYLES section: `.dash-stat-xp/streak/nodes` (text-shadow glow), `.dash-tree-card` / `:hover` (elevation), `.dash-progress-fill-active/complete` (box-shadow glow)

**Session: 2026-03-31 (TASK 2A-2 — Tree Wizard Visual Refactor)**
- `globals.css` — Added `.wiz-btn-primary` (ember gradient CTA), `.wiz-textarea` (dark fantasy focus glow), `.wiz-option-card` / `.wiz-option-selected` (hover/selected glow), `@keyframes wiz-drift` / `wiz-float-a/b/c` (wizard atmosphere)
- `tree/new/page.tsx` — Added noise overlay (fixed), ember particles (fixed), radial glow (absolute); replaced generic dot step indicators with ornamental Roman numeral indicators (I/II/III with labels); added gold gradient divider between step indicator and content
- `GoalInputStep.tsx` — Dramatic Cinzel heading at `clamp(2.2rem, 5vw, 3.2rem)`, ember eyebrow label, `wiz-textarea` dark fantasy treatment, `wiz-btn-primary` ember gradient button, atmospheric italic note below textarea
- `FollowUpQuestionsStep.tsx` — Cinzel question text, `wiz-option-card` / `wiz-option-selected` path-choice cards with hover/selected glow, `wiz-btn-primary` ember gradient CTA
- `GeneratingStep.tsx` — Added drifting rune background (10 faint runes, `wiz-drift` animation), centered radial glow behind rune ring; existing breathing rings preserved

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
