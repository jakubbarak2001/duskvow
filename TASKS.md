# TASKS.md — Duskvow Task Queue

> **Purpose**: Ordered list of tasks for Claude Code to execute.
> Each task has specs tight enough to run without human supervision.
> Claude reads STATE.md first, then picks up the next `QUEUED` task.
>
> **Status values**: `QUEUED` → `IN_PROGRESS` → `DONE` / `FAILED`
> **Rule**: Execute tasks in order. Do NOT skip ahead. Run `npm run validate` after each.

---

## Sprint 2A — Visual Consistency

> Goal: Make auth, wizard, and dashboard pages match the landing page's
> visual quality. Reference: `frontend/src/app/page.tsx` and the Visual
> Reference Notes in STATE.md.

---

### TASK 2A-1: Auth Page Visual Refactor

**Status**: `DONE`
**Branch**: `feature/auth-visual-refactor`
**Files to modify**: `frontend/src/app/auth/page.tsx`, `frontend/src/components/auth/AuthForm.tsx`, `frontend/src/app/globals.css` (if new animations needed)

**What to do**:
Redesign the auth page (`/auth`) to feel like an extension of the landing page, not a generic form on a dark background.

**Specific changes**:
1. Add a background treatment — either a subtle version of the landing page's dark environment or a radial ember glow. NOT a plain flat `--bg-abyss` rectangle.
2. Add the noise overlay (`.lp-noise` pattern from landing page) to the auth page.
3. Add floating ember particles (reuse the `.lp-ember` system from landing page, or create a shared version).
4. Restyle the auth card container:
   - Use `--bg-shadow` with a subtle border glow (`box-shadow` with ember/gold tones)
   - Add ornamental elements — a gold gradient line above the heading (like landing page section dividers)
   - Increase padding and spacing to match landing page's generous breathing room
5. Restyle the heading "Enter the Realm":
   - Use Cinzel font (already does), but increase size and add letter-spacing
   - Add a subtle text-shadow or glow effect matching landing page headings
6. The Supabase Auth UI component has limited styling — push the `appearance.variables` as far as possible to match the dark fantasy tokens. Specifically:
   - Input fields should feel like dark fantasy UI, not generic Material
   - The submit button should use the ember gradient style from landing page CTAs
   - Focus states should use `--accent-ember` or `--accent-gold` glow
7. Add a "Back to home" link or the Duskvow logo linking to `/` at the top.

**What NOT to do**:
- Don't change auth logic or Supabase configuration
- Don't add Google OAuth (that's Task 2B-1)
- Don't use inline hex colors — all design tokens
- Don't break mobile responsiveness

**Acceptance criteria**:
- [ ] Page has background atmosphere (noise, glow, or particles)
- [ ] Auth card has ornamental styling matching landing page quality
- [ ] Heading uses Cinzel with generous letter-spacing
- [ ] Input fields and button styled with dark fantasy tokens
- [ ] Navigation back to home exists
- [ ] `npm run validate` passes
- [ ] No visual regressions on landing page or other routes

---

### TASK 2A-2: Tree Wizard Visual Refactor

**Status**: `DONE`
**Branch**: `feature/wizard-visual-refactor`
**Files to modify**: `frontend/src/app/tree/new/page.tsx`, `frontend/src/components/tree-wizard/GoalInputStep.tsx`, `frontend/src/components/tree-wizard/FollowUpQuestionsStep.tsx`, `frontend/src/components/tree-wizard/GeneratingStep.tsx`, `frontend/src/app/globals.css` (if new animations needed)

**What to do**:
Redesign the tree creation wizard (`/tree/new`) to feel atmospheric and ceremonial — this is the moment the user "makes their vow." It should feel weighty, not like filling out a form.

**Specific changes**:

*Page-level:*
1. Add background atmosphere — noise overlay, subtle ember particles, or radial glow.
2. Add a gold gradient divider line above the wizard content area (like landing page section breaks).
3. The step indicator (1-2-3 dots) should use ornamental styling — consider Roman numerals like the landing page's "The Rite" section, or rune-like markers.

*GoalInputStep:*
4. The heading "Make Your Vow" should be larger, more dramatic — match the landing page heading scale.
5. The textarea should have a dark fantasy treatment — subtle inner glow on focus, `--bg-shadow` background, ember border on focus.
6. The submit button ("Forge My Path →") should use the landing page's `.lp-btn-primary` ember gradient style with hover glow.
7. Add atmospheric copy below the textarea — something like the landing page's italic notes.

*FollowUpQuestionsStep:*
8. Question cards should feel like choosing a path, not clicking a radio button. Add hover glow effects, tier-colored borders, more dramatic selected state.
9. The "Generate My Tree →" button should match the ember gradient CTA style.

*GeneratingStep:*
10. The breathing rune animation is already good — but add background atmosphere (noise, particles) to make the wait feel immersive, not empty.
11. Consider adding faint background text or rune patterns that slowly drift.

**What NOT to do**:
- Don't change wizard logic, API calls, or state management
- Don't modify the step flow (goal → followup → generating)
- Don't change the follow-up question data structure
- Don't add the "Something else?" freetext option (that's Task 2A-4)

**Acceptance criteria**:
- [ ] Background has atmosphere (noise/particles/glow)
- [ ] Step indicators are ornamental, not generic dots
- [ ] All buttons use ember gradient CTA style
- [ ] Textarea has dark fantasy focus treatment
- [ ] Follow-up question cards have hover/selected glow effects
- [ ] GeneratingStep feels immersive during the wait
- [ ] `npm run validate` passes
- [ ] No visual regressions on other routes

---

### TASK 2A-3: Dashboard Visual Refactor

**Status**: `DONE`
**Branch**: `feature/dashboard-visual-refactor`
**Files to modify**: `frontend/src/app/dashboard/page.tsx`, `frontend/src/components/ui/StatsBar.tsx`, `frontend/src/app/globals.css` (if new animations needed)

**What to do**:
Redesign the dashboard (`/dashboard`) from a functional list into an atmospheric command center. This is where the user spends most of their time — it should feel like a war room, not a todo app.

**Specific changes**:

*Page-level:*
1. Add background atmosphere — noise overlay, very subtle ember particles (fewer than landing page — this is a utility page).
2. The heading "Your Vow Board" should be larger, more dramatic — Cinzel, gold color, generous spacing.

*StatsBar:*
3. Redesign the stats bar to feel like a HUD/status display:
   - Larger numbers with tier-appropriate glow effects
   - XP should feel like a resource counter (gold glow)
   - Streak should feel like a flame counter (ember glow)
   - Add subtle separator lines between stats
   - Consider adding a mini XP progress bar to next level/milestone
4. Stats bar should span full width, not feel like a cramped inline element.

*Tree Cards:*
5. Active tree cards should feel like quest entries:
   - Add a subtle left border accent in the tree's status color
   - Progress bar should be more prominent — thicker, with glow
   - Add a hover state with subtle elevation/glow
   - Title should use Cinzel font
6. The empty state ("Welcome to Duskvow") should have atmospheric treatment — not a plain box.
7. "New Vow" button should use ember gradient CTA style.

*Section Headers:*
8. "Active Vows" and "Finished Vows" section labels should use the ornamental style from landing page — small Cinzel caps, gold-dim color, wide letter-spacing, optionally with `◆` decorators.

**What NOT to do**:
- Don't change dashboard logic, data fetching, or delete functionality
- Don't change the tree card data structure
- Don't add new features (no new stats, no new sections)

**Acceptance criteria**:
- [ ] Background has subtle atmosphere
- [ ] StatsBar redesigned with glow effects and full width
- [ ] Tree cards have quest-entry styling with hover states
- [ ] Section headers use ornamental Cinzel style
- [ ] Empty state has atmospheric treatment
- [ ] CTA buttons use ember gradient style
- [ ] `npm run validate` passes
- [ ] No visual regressions on other routes

---

### TASK 2A-4: Follow-Up "Something Else" Freetext Option

**Status**: `DONE`
**Branch**: `feature/followup-freetext`
**Files to modify**: `frontend/src/components/tree-wizard/FollowUpQuestionsStep.tsx`, `frontend/src/types/index.ts` (if type changes needed)

**What to do**:
Add a "Something else…" option to every follow-up question that expands into a freetext input when selected.

**Specific changes**:
1. After the existing option buttons for each question, add a final "Something else…" button with a slightly different visual treatment (dashed border or muted style).
2. When clicked, it expands to show a text input below the options.
3. The text input value becomes the answer for that question (stored in the `answers` record as the typed string, not "Something else").
4. If the user clicks a predefined option after typing in freetext, the freetext collapses and the predefined option is selected instead.
5. The freetext input should use the same dark fantasy styling as the goal textarea (ember border on focus, `--bg-shadow` background).
6. Minimum 3 characters in freetext before it counts as a valid answer.

**What NOT to do**:
- Don't change the backend API — it already accepts arbitrary string answers
- Don't change the question data structure from the API
- Don't modify other wizard steps

**Acceptance criteria**:
- [ ] Every follow-up question has a "Something else…" option
- [ ] Clicking it reveals a styled freetext input
- [ ] Freetext value is used as the answer (not the literal string "Something else")
- [ ] Selecting a predefined option after freetext collapses the input
- [ ] 3-character minimum on freetext
- [ ] Styled consistently with dark fantasy design tokens
- [ ] `npm run validate` passes
- [ ] Follow-up flow still works end-to-end (submitting answers triggers generation)

---

## Sprint 2B — Auth Expansion

---

### TASK 2B-1: Google OAuth Implementation

**Status**: `DONE`
**Branch**: `feature/google-oauth`
**Files to modify**: `frontend/src/components/auth/AuthForm.tsx`, possibly `frontend/src/app/auth/page.tsx`

**Prerequisites**: Google OAuth must be enabled in Supabase dashboard (Auth → Providers → Google) with valid Client ID and Client Secret. Jacob must do this manually before this task runs — Claude cannot access the Supabase dashboard or Google Cloud Console.

**What to do**:
Enable Google OAuth as a login option alongside the existing email/password.

**Specific changes**:
1. In `AuthForm.tsx`, add `"google"` to the `providers` array in the `<Auth>` component.
2. Style the Google button to match the dark fantasy aesthetic — it should NOT look like a default white Google button. Use the Supabase Auth UI appearance overrides to make it blend with the page.
3. Ensure the `redirectTo` URL works correctly with Google OAuth flow.
4. Test that the auth state change listener correctly handles Google sign-in (it should — Supabase handles this uniformly, but verify).

**What NOT to do**:
- Don't set up Google OAuth credentials (Jacob does this in Supabase dashboard)
- Don't add other OAuth providers
- Don't change existing email/password auth behavior

**IMPORTANT — Before running this task**:
Claude should verify Google OAuth is configured by checking if the Supabase Auth UI renders a Google button. If it shows an error or no Google option appears, log it as a known issue and mark the task as `FAILED` with reason "Google OAuth not configured in Supabase dashboard."

**Acceptance criteria**:
- [ ] Google sign-in button appears on auth page
- [ ] Button styled to match dark fantasy aesthetic
- [ ] Sign-in redirects to `/dashboard` on success
- [ ] Email/password auth still works
- [ ] `npm run validate` passes

---

## Sprint 2C — Tree Visual Overhaul (Requires Research)

> These tasks are NOT ready for overnight execution yet.
> They need research and decisions from Jacob first.
> Leaving them here as placeholders with open questions.

---

### TASK 2C-1: WoW-Style Tree Grid Layout (CSS Only)

**Status**: `BLOCKED` — needs design decision from Jacob
**Open questions**:
- Current layout is Dagre auto-layout (left-to-right). WoW trees are a top-down grid with fixed columns. Do we switch completely or keep Dagre as fallback?
- WoW has 3 separate talent panels (specs). Do we want multiple panels per tree, or keep single tree?
- Node size in WoW is uniform square icons. Current Duskvow uses different shapes per type (circle/square/diamond/hexagon). Keep shapes or go uniform?
- WoW trees have a dark panel background per spec. What background treatment for Duskvow trees?

### TASK 2C-2: Node Icon Image Generation Research

**Status**: `BLOCKED` — needs research from Jacob
**Open questions**:
- Budget per tree generation (current cost is just Gemini API, ~$0.01). Adding 20-30 image generations could add $0.20-$2.00+ per tree depending on provider.
- Speed tolerance — adding image gen could push tree creation from 30s to 5-10 minutes. Acceptable?
- Style consistency — how to ensure all node icons look like they belong in the same game? LoRA fine-tuning? Style prompt engineering? Pre-generated icon library?
- Provider options to research: Flux (fast/cheap), DALL-E 3 (quality), Replicate Stable Diffusion (customizable), or a hybrid approach (pre-generate a library of 200+ generic fantasy icons and assign them by node type/tier).

### TASK 2C-3: Tree Background Generation

**Status**: `BLOCKED` — depends on 2C-2 research results

---

# SPRINT 3 TASKS — Add to TASKS.md

> Copy everything below into TASKS.md, above the "## Completed Tasks" section.

---

## Sprint 3A — Dashboard Cleanup

---

### TASK 3A-1: Remove Nodes Done Stat from Dashboard

**Status**: `DONE`
**Branch**: `feature/remove-nodes-stat`
**Files to modify**: `frontend/src/components/ui/StatsBar.tsx`, `frontend/src/app/dashboard/page.tsx`

**What to do**:
Remove the third stat ("Nodes Done") from the StatsBar. Keep only Total XP and Day Streak.

**Specific changes**:
1. In `StatsBar.tsx`: remove the `nodesCompleted` and `totalNodes` props and the third stat column entirely.
2. Update the `StatsBarProps` interface to only have `totalXp` and `currentStreak`.
3. In `dashboard/page.tsx`: remove the `nodesCompleted` and `totalNodes` props being passed to `<StatsBar>`.
4. In `frontend/src/components/tree/TreeViewPage.tsx`: check if `StatsBar` is used there too — update props if so. If the tree view page needs node progress, keep it local to that page (do NOT remove from tree view — only from the dashboard).
5. The two remaining stats should center properly and take up equal width.

**What NOT to do**:
- Don't remove StatsBar from the tree view page — it's still useful there with all stats
- Don't change any other dashboard elements
- If StatsBar is used in tree view with all 4 props, create a separate interface or make the node props optional

**Acceptance criteria**:
- [ ] Dashboard StatsBar shows only Total XP and Day Streak
- [ ] Tree view StatsBar still shows all stats (XP, streak, nodes)
- [ ] No TypeScript errors from removed props
- [ ] `npm run validate` passes

---

## Sprint 3B — Ember Brazier

> The Ember Brazier is a personal victory collection. Users add "embers" — short
> descriptions of past wins — that live inside a visual brazier on the dashboard.
> The more embers you add, the brighter the fire burns. Hovering an ember reveals
> its name. This is a psychological anchor for motivation (David Goggins' "cookie jar"
> concept, reskinned for dark fantasy).

---

### TASK 3B-1: Ember Database Table & API Endpoints

**Status**: `DONE`
**Branch**: `feature/ember-backend`
**Files to modify**: `supabase/migrations/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/api/v1/`

**What to do**:
Create the database table and REST API for embers.

**Database migration** (create via `npx supabase migration new create_embers_table`):
```sql
CREATE TABLE public.embers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
    description TEXT CHECK (char_length(description) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.embers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own embers" ON public.embers
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_embers_user_id ON public.embers(user_id);
```

Push with `npx supabase db push`.

**API endpoints**:
```
GET    /api/v1/embers           — List user's embers (ordered by created_at DESC)
POST   /api/v1/embers           — Create ember { title: string, description?: string }
DELETE /api/v1/embers/{ember_id} — Delete an ember
```

**Backend implementation**:
- Add Pydantic schemas: `EmberCreate`, `EmberResponse`
- Add SQLModel model: `Ember`
- Add route handler in `api/v1/embers.py`
- Register router in `main.py`
- All endpoints require auth (Bearer token)
- Max 50 embers per user (return 400 if at cap)
- Response format: `{ "data": [...], "error": null }`

**What NOT to do**:
- Don't build any frontend yet
- Don't add update/edit endpoint (embers are immutable once created — you don't edit victories)

**Acceptance criteria**:
- [ ] Migration creates table with RLS
- [ ] `npx supabase db push` succeeds
- [ ] GET/POST/DELETE endpoints work with auth
- [ ] 50 ember cap enforced
- [ ] Response shape matches existing API patterns

---

### TASK 3B-2: Frontend API Client & Types for Embers

**Status**: `DONE`
**Branch**: `feature/ember-types`
**Files to modify**: `frontend/src/types/index.ts`, `frontend/src/lib/api.ts`

**What to do**:
Add TypeScript types and API client methods for embers.

**Type definitions** (add to `types/index.ts`):
```typescript
export interface Ember {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
}
```

**API methods** (add to `lib/api.ts`):
```typescript
listEmbers: (token: string) => request<Ember[]>("/api/v1/embers", { headers: authHeader(token) }),

createEmber: (title: string, description: string | null, token: string) =>
  request<Ember>("/api/v1/embers", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ title, description }),
  }),

deleteEmber: (emberId: string, token: string) =>
  request<{ deleted: boolean }>(`/api/v1/embers/${emberId}`, {
    method: "DELETE",
    headers: authHeader(token),
  }),
```

**What NOT to do**:
- Don't build any UI components yet
- Don't add a Zustand store yet

**Acceptance criteria**:
- [ ] `Ember` type exported from `types/index.ts`
- [ ] Three API methods added to `api.ts`
- [ ] `npm run validate` passes

---

### TASK 3B-3: Brazier Component — Visual Container

**Status**: `DONE`
**Branch**: `feature/ember-brazier-visual`
**Files to modify**: `frontend/src/components/ui/Brazier.tsx` (new), `frontend/src/app/globals.css`

**What to do**:
Build the visual Brazier component — the container that holds embers. This task is CSS/animation only — no data fetching, no API calls.

**Component**: `<Brazier embers={mockEmbers} onEmberHover={} onAddClick={} />`

**Visual design**:
1. The brazier is a bowl/vessel shape at the bottom, built with CSS (rounded container, dark borders, inner gradient suggesting depth).
2. Inside the vessel, a fire/glow effect that scales with ember count:
   - 0 embers: dark, cold, faint smoke-like gradient. Prompt text: "Your brazier is cold. Add your first ember."
   - 1-5 embers: dim warm glow, subtle animation
   - 6-15 embers: medium fire glow, visible ember particles floating up
   - 16-30 embers: bright fire, prominent glow, more particles
   - 31-50 embers: blazing — maximum glow radius, intense animation
3. Individual embers are small glowing orbs (6-10px) positioned pseudo-randomly inside the vessel using seeded positions based on ember index (not truly random — consistent between renders).
4. Hover on individual ember: it scales up slightly (1.3x), glows brighter, and shows tooltip with the ember's title.
5. The vessel should be roughly 300px wide × 200px tall on desktop, responsive.
6. All colors from design tokens — ember reds, gold accents for glow, `--bg-shadow` for vessel.

**CSS animations** (add to globals.css):
- `@keyframes brazier-flicker` — subtle fire glow pulsing
- `@keyframes brazier-float` — embers inside gently bob/drift
- Glow intensity classes: `.brazier-cold`, `.brazier-dim`, `.brazier-warm`, `.brazier-hot`, `.brazier-blazing`

**Props interface**:
```typescript
interface BrazierProps {
  embers: { id: string; title: string }[];
  onEmberHover?: (emberId: string | null) => void;
  onAddClick?: () => void;
}
```

**Use mock data for development** — pass 10-15 fake embers to test visual states.

**What NOT to do**:
- Don't fetch real data — just accept props
- Don't build the "add ember" form — just expose `onAddClick` callback
- Don't build the delete functionality
- Don't integrate into dashboard yet

**Acceptance criteria**:
- [ ] Brazier renders with mock data
- [ ] Glow intensity visually changes based on ember count
- [ ] Individual ember hover shows tooltip with title
- [ ] Empty state shows "cold brazier" prompt
- [ ] Animations are smooth, not janky
- [ ] All colors use design tokens
- [ ] `npm run validate` passes

---

### TASK 3B-4: Add Ember Form & Drop Animation

**Status**: `DONE`
**Branch**: `feature/ember-add-form`
**Files to modify**: `frontend/src/components/ui/AddEmberForm.tsx` (new), `frontend/src/components/ui/Brazier.tsx`, `frontend/src/app/globals.css`

**What to do**:
Build the form for adding new embers and the "drop into brazier" animation.

**AddEmberForm component**:
1. Simple form: title input (required, max 100 chars) + description textarea (optional, max 500 chars) + submit button.
2. Dark fantasy styling: `--bg-shadow` background, ember focus borders, Cinzel label text, ember gradient submit button.
3. Form appears when user clicks "+ Add Ember" button (or the brazier's onAddClick).
4. Can be a modal overlay or an inline expansion below the brazier — inline is simpler.
5. On submit, calls `onSubmit({ title, description })` callback. Parent handles API call.

**Drop animation**:
6. When a new ember is added, animate it dropping into the brazier:
   - A glowing orb appears above the brazier
   - Falls down with slight ease-in (gravity feel)
   - Lands in the vessel with a small burst/flash
   - Then settles into its position among other embers
7. Add `@keyframes ember-drop` to globals.css.
8. Brazier component accepts an `animatingEmberId` prop — when set, that ember gets the drop animation class.

**What NOT to do**:
- Don't wire up to real API yet
- Don't add delete functionality
- Don't integrate into dashboard

**Acceptance criteria**:
- [ ] Form validates title (1-100 chars required)
- [ ] Form styled with dark fantasy tokens
- [ ] New ember drops into brazier with animation
- [ ] Animation looks like gravity — not linear
- [ ] `npm run validate` passes

---

### TASK 3B-5: Brazier Integration — Dashboard + API Wiring

**Status**: `DONE`
**Branch**: `feature/ember-dashboard-integration`
**Files to modify**: `frontend/src/app/dashboard/page.tsx`, `frontend/src/components/ui/Brazier.tsx`, `frontend/src/components/ui/AddEmberForm.tsx`

**What to do**:
Wire the Brazier into the dashboard with real data.

**Specific changes**:
1. In `dashboard/page.tsx`:
   - Fetch embers on mount: `api.listEmbers(token)`
   - Add state: `embers`, `showAddForm`, `animatingEmberId`
   - Place `<Brazier>` component below the StatsBar, above the tree list
   - Add section header: `◆ Your Brazier ◆` in ornamental style matching "Active Vows"
   - Place `<AddEmberForm>` below the brazier, toggleable via "Add Ember" button
2. Wire up add flow:
   - Form submit → `api.createEmber(title, description, token)`
   - On success → prepend to embers array, set `animatingEmberId` for drop animation
   - Clear animation ID after 1.5s timeout
3. Wire up delete:
   - Long-press or dedicated delete icon on ember hover tooltip
   - Confirm dialog: "Extinguish this ember?"
   - On confirm → `api.deleteEmber(id, token)`, remove from array
4. Handle 50-ember cap: hide "Add Ember" button when at cap, show message.

**What NOT to do**:
- Don't create a separate page for the brazier — it lives on the dashboard
- Don't add a Zustand store — local state in dashboard is fine for now
- Don't change the tree list or any other dashboard element

**Acceptance criteria**:
- [ ] Brazier shows on dashboard with real user embers
- [ ] Add ember flow works: form → API → drop animation → ember appears
- [ ] Delete ember works with confirmation
- [ ] 50 ember cap enforced in UI
- [ ] Empty brazier shows cold state with "add your first ember" prompt
- [ ] Brazier glow intensity matches ember count
- [ ] `npm run validate` passes
- [ ] No visual regressions on rest of dashboard

# PHASE 1 — THE HUB — Add to TASKS.md

> Copy everything below into TASKS.md, above the "## Completed Tasks" section.
> These tasks transform the dashboard from a flat page into an RPG hub world.

---

## Phase 1 — The Hub

> Goal: Replace the current dashboard with a visual hub — an atmospheric
> antechamber with three doors leading to different game areas. Only the
> Vow Chamber (talent trees) is accessible. The Dungeon and The Hearth
> show as locked with "coming soon" atmosphere. This is the foundational
> shift from "productivity app" to "dark fantasy game."
>
> The player should feel like they're standing in a room, not looking at a webpage.

---

### TASK P1-1: Hub Page — Layout & Atmosphere

**Status**: `DONE`
**Branch**: `feature/hub-layout`
**Files to modify**: `frontend/src/app/dashboard/page.tsx` (major rewrite), `frontend/src/app/globals.css`

**What to do**:
Rewrite the dashboard page into a hub. This is a major visual redesign but the route stays `/dashboard`.

**Hub layout concept**:
The hub is a full-viewport atmospheric scene. The player sees:
- Top: a persistent header bar with DUSKVOW logo, player stats (XP + Streak), and sign out
- Center: three "doors" or portals arranged horizontally (or in a triangle/arc on larger screens)
- Background: dark atmospheric treatment — noise overlay, subtle particles, radial ambient glow

**The three doors** (each is a large clickable card/portal):

1. **The Vow Chamber** — UNLOCKED
   - Visual: an ornate doorway with ember glow leaking through
   - Icon/symbol: a branching tree rune or ᛟ
   - Label: "The Vow Chamber" in Cinzel
   - Subtitle: "Forge and walk your talent trees"
   - Status indicator: "{X} active vows" in small muted text
   - Click → navigates to `/vows` (new route, see TASK P1-2)
   - Hover: door glows brighter, subtle scale-up

2. **The Dungeon** — LOCKED
   - Visual: a heavy iron door with chains across it, cold/blue-grey tones
   - Icon/symbol: crossed swords or ⚔
   - Label: "The Dungeon" in Cinzel
   - Subtitle: "Face the darkness. Earn your spoils."
   - Lock indicator: a small lock icon + "Coming Soon" in muted text
   - Click → nothing (or subtle "locked" shake animation)
   - Hover: chains rattle subtly (CSS animation), but door stays locked
   - Overall tone: cold, foreboding, enticing

3. **The Hearth** — LOCKED
   - Visual: a warm archway with faint firelight, but dimmed/cold since it's locked
   - Icon/symbol: a flame or brazier silhouette
   - Label: "The Hearth" in Cinzel
   - Subtitle: "Your sanctum. Your trophies. Your fire."
   - Lock indicator: lock icon + "Coming Soon"
   - Click → nothing (or subtle shake)
   - Hover: faint warmth flickers but doesn't ignite
   - This is where the brazier/embers will eventually live

**Door card design**:
- Each door is roughly 280-320px wide, 350-400px tall
- Dark surface background (`--bg-surface` or `--bg-shadow`)
- Ornamental border — thin, with subtle glow for unlocked, muted for locked
- The icon/symbol area at top (large, decorative)
- Title + subtitle centered below
- Locked doors have 50-60% opacity overall, with the lock indicator
- Generous spacing between doors

**Player info bar** (top of page):
- Left: DUSKVOW logo (matching navbar style)
- Center or right: XP and Streak stats — compact inline, not the full StatsBar
- Right: Sign out link
- This replaces the current Navbar on the hub page — the hub has its own header

**Background atmosphere**:
- Noise overlay
- Very subtle ember particles (5-8, slow)
- Central radial glow (warm, dim — like torchlight in the room)
- Optional: subtle stone/dungeon floor texture via CSS gradient (no image files)

**What to REMOVE from the current dashboard**:
- The tree list (moves to `/vows` in P1-2)
- The full StatsBar component (replaced by compact inline stats)
- The "New Vow" button (moves to `/vows`)
- The brazier section (moves to The Hearth eventually)
- All the current layout — this is a full rewrite of the page JSX

**What to KEEP**:
- The data fetching for profile (for XP + Streak display)
- The auth guard (redirect to /auth if not logged in)
- The `useUser` hook usage

**What NOT to do**:
- Don't create the `/vows` page yet (that's P1-2)
- Don't build the dungeon or hearth interiors
- Don't remove any existing components from `components/` — they'll be reused
- Don't change the Navbar component itself — the hub just doesn't use it

**Acceptance criteria**:
- [ ] Hub page renders with three door cards
- [ ] Vow Chamber door is visually "open"/glowing, Dungeon and Hearth are locked
- [ ] Clicking Vow Chamber navigates to `/vows` (will 404 until P1-2, that's fine)
- [ ] Clicking locked doors does nothing or shows subtle locked feedback
- [ ] Player XP and Streak visible at top
- [ ] Full atmospheric background (noise, particles, glow)
- [ ] Responsive: doors stack vertically on mobile
- [ ] `npm run validate` passes

---

### TASK P1-2: Vow Chamber Page — Tree List Migration

**Status**: `DONE`
**Branch**: `feature/vow-chamber`
**Files to modify**: `frontend/src/app/vows/page.tsx` (new), `frontend/src/app/dashboard/page.tsx` (if needed)

**What to do**:
Create a new page at `/vows` that contains everything the old dashboard had for tree management. This is the interior of the Vow Chamber door.

**Page content** (migrated from old dashboard):
1. Page header: "The Vow Chamber" in Cinzel + a "← Return to Hub" link back to `/dashboard`
2. "New Vow" button (ember gradient CTA)
3. Generation status display (X of Y generations remaining)
4. Active Vows section with tree cards
5. Finished Vows section with tree cards
6. Empty state if no trees
7. Full StatsBar component (XP, Streak — shows tree-specific stats here)

**The layout and styling should match the current dashboard's visual quality** — ornamental section headers, atmospheric background, tree cards with hover states. You're essentially moving the existing dashboard content into this new route.

**Navigation**:
- `/dashboard` (hub) → click Vow Chamber → `/vows`
- `/vows` → "Return to Hub" link → `/dashboard`
- The Navbar should show on this page (unlike the hub which has its own header)

**What NOT to do**:
- Don't redesign the tree cards or StatsBar — reuse them as-is
- Don't change tree creation flow (`/tree/new` stays the same)
- Don't change tree view (`/tree/[id]` stays the same)
- Don't modify any component files — just import and use them

**Acceptance criteria**:
- [ ] `/vows` page renders with all tree management functionality
- [ ] "Return to Hub" link navigates to `/dashboard`
- [ ] Tree list, create, delete all work from this page
- [ ] Navbar visible on this page
- [ ] Auth guard active (redirect if not logged in)
- [ ] `npm run validate` passes
- [ ] No functionality lost from old dashboard

---

### TASK P1-3: Hub Door Active State — Live Data on Vow Chamber

**Status**: `IN_PROGRESS`
**Branch**: `feature/hub-door-data`
**Files to modify**: `frontend/src/app/dashboard/page.tsx`

**What to do**:
Wire the Vow Chamber door on the hub to show live data from the user's trees.

**Specific changes**:
1. Fetch tree list on hub mount (already fetching profile — add trees fetch)
2. On the Vow Chamber door card, show:
   - "{X} active vows" where X is the count of active trees
   - A tiny progress indicator — e.g. "105 XP earned" or a mini progress ring
   - If user has no trees: show "Begin your journey" instead
3. The door's glow intensity could scale subtly with activity (optional, nice touch):
   - No trees: dim glow
   - 1-2 trees: medium glow
   - 3+ trees: bright glow

**What NOT to do**:
- Don't change locked door behavior
- Don't add data fetching for dungeon or hearth (they don't exist yet)
- Don't modify the `/vows` page

**Acceptance criteria**:
- [ ] Vow Chamber door shows active tree count
- [ ] Data fetched on mount with loading state
- [ ] Works correctly with 0, 1, and multiple trees
- [ ] `npm run validate` passes

---

### TASK P1-4: Update Auth Redirect & Navigation Flow

**Status**: `QUEUED`
**Branch**: `feature/hub-navigation`
**Files to modify**: `frontend/src/components/layout/Navbar.tsx`, `frontend/src/components/auth/AuthForm.tsx`, `frontend/src/app/tree/[id]/page.tsx` (or TreeViewPage), `frontend/src/lib/api.ts` (if needed)

**What to do**:
Update navigation across the app to work with the new hub structure.

**Specific changes**:
1. **Navbar**: 
   - "Dashboard" link → rename to "Hub" and point to `/dashboard`
   - Add "Vow Chamber" link pointing to `/vows`
   - Keep "New Vow" link pointing to `/tree/new`
2. **AuthForm**: after sign-in redirect goes to `/dashboard` (hub) — verify this still works
3. **TreeViewPage**: "← Dashboard" back button → change to "← Hub" pointing to `/dashboard` OR "← Vow Chamber" pointing to `/vows` (the Vow Chamber makes more sense as you're navigating back from a tree to the tree list)
4. **Landing page**: "Make Your Vow" CTA still goes to `/auth` — no change needed
5. **Auth page**: "Return to the Gates" still goes to `/` — no change needed

**What NOT to do**:
- Don't change any page layouts
- Don't modify component styling
- Don't change the auth flow logic

**Acceptance criteria**:
- [ ] All navigation links point to correct routes
- [ ] No dead links or broken back-buttons
- [ ] Sign-in redirects to hub
- [ ] Tree view back button goes to Vow Chamber
- [ ] Navbar shows Hub + Vow Chamber links
- [ ] `npm run validate` passes

---

### TASK P1-5: Move Brazier to Hearth Placeholder

**Status**: `QUEUED`
**Branch**: `feature/hearth-placeholder`
**Files to modify**: `frontend/src/app/hearth/page.tsx` (new), `frontend/src/app/dashboard/page.tsx`

**What to do**:
Create a locked Hearth page at `/hearth` that shows the brazier and a "coming soon" message. This preserves the existing brazier work while putting it in the right place architecturally.

**Page content**:
1. Full-screen atmospheric page (noise, particles, warm glow — warmer than hub)
2. "The Hearth" heading in Cinzel
3. "← Return to Hub" link
4. The existing `<Brazier>` component, centered, with real data if user has embers
5. The `<AddEmberForm>` below it
6. A "coming soon" banner for future features: "Your sanctum grows. Trophy room, character customization, and more — forging soon."
7. **Update the Hearth door on the hub to link to `/hearth` instead of being locked** — since we already have the brazier built, players can access it. Change the door from locked to unlocked state.

**What NOT to do**:
- Don't redesign the brazier (fix the visual issues in a separate task if needed)
- Don't add new features to the hearth
- Don't change any other hub doors

**Acceptance criteria**:
- [ ] `/hearth` page renders with brazier
- [ ] Brazier shows real user embers (API connected)
- [ ] Add ember form works
- [ ] "Coming soon" message for future features
- [ ] Hub's Hearth door is now unlocked and links to `/hearth`
- [ ] Auth guard active
- [ ] `npm run validate` passes

## Completed Tasks

> Move tasks here when done, with completion date and any notes.

(none yet)

