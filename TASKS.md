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

**Status**: `IN_PROGRESS`
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

**Status**: `QUEUED`
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

**Status**: `QUEUED`
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

**Status**: `QUEUED`
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

## Completed Tasks

> Move tasks here when done, with completion date and any notes.

(none yet)
