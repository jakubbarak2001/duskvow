# In-App Tone Audit — Authenticated Experience

**Date:** 2026-04-17
**Scope:** Every user-facing surface *after* sign-up, measured against the post-pivot landing voice (mentor-present, caring-guide, Tristram/Melina/Deckard-Cain register).
**Reference docs read:** `LANDING-COPY-PIVOT.md`, `LANDING-COPY-PIVOT-PART-2.md`, `BML-PLAN.md`, `STATE.md`.
**Output discipline:** Findings only. No rewrites. No code edits.

The five checks each finding is graded against:
1. **Tone** — caring-guide + dark fantasy, consistent with landing
2. **Vocab** — uses the on-brand set (path, guide, ember, vow, rite, oath, kindling, bonfire, hearth, lantern, tempered, kindled, walk, tend); avoids flag words (climb, solitude, alone, coddled, hand-holding, mascots, "no X, no Y")
3. **Healthy Gamer** — reads as *"they want me to get better"*
4. **Care vs. coddle** — respects the user without being cold
5. **Streak/guilt** — nothing that shames missed days

Additional discipline from the landing pivot: **"forge" is locked to the hero H1.** Every non-hero use is a finding.

---

## Section A — Inventory

### Authenticated routes audited (Next.js App Router)
- `app/layout.tsx` — root metadata (title + description)
- `app/dashboard/page.tsx` — hub page + inline FirekeeperLine component (lines 611–650)
- `app/vows/page.tsx` — Vow Chamber list
- `app/tree/new/page.tsx` — wizard host
- `app/tree/[id]/page.tsx` → `components/tree/TreeViewPage.tsx` — tree canvas page
- `app/auth/page.tsx` — sign-in gate
- `app/profile/page.tsx` — hero profile + stats + inventory
- `app/dungeon/page.tsx` — idle-dungeon UI (pre-run, active run, retreat confirm)
- `app/leaderboard/page.tsx` — rankings (hidden in MVP mode)
- `app/error.tsx` — per-route error boundary
- `app/global-error.tsx` — app-level crash screen

### Copy-bearing components audited
- `components/tree-wizard/GoalInputStep.tsx`
- `components/tree-wizard/FollowUpQuestionsStep.tsx`
- `components/tree-wizard/GeneratingStep.tsx`
- `components/tree/TreeHeader.tsx`
- `components/tree/NodeDetailPanel.tsx`
- `components/tree/NodeTooltip.tsx`
- `components/tree/TreeCanvas.tsx` (tier chapter labels)
- `components/tree/QuestLogPanel.tsx`
- `components/dungeon/BattleReport.tsx`
- `components/layout/Navbar.tsx`
- `components/ui/ResumeStrip.tsx`
- `components/ui/StatsBar.tsx`
- `components/ui/StreakFlame.tsx`
- `components/ui/HeroNamingModal.tsx`
- `components/ui/LevelUpModal.tsx`
- `components/ui/AchievementToast.tsx`
- `components/ui/ErrorBoundary.tsx`
- `components/ui/Skeleton.tsx` (no copy — confirmed)

### Data files audited
- `backend/app/data/achievements.json` — all achievement names + descriptions
- `frontend/src/lib/api.ts` — error-message strings

### Not audited (confirmed non-copy)
Pure-visual layers: `components/ui/Skeleton.tsx`, `DungeonParticles` background, `ScrollToTopLogo`, route-level `loading.tsx` stubs, provider files.

**Confidence:** High. Every authed page, every shared UI component that renders user-visible strings, every data file that feeds on-screen copy has been read end-to-end. If a finding exists that isn't below, it's in a file I'd classify as non-copy-bearing.

---

## Section B — Findings by Severity

Format: **[file]:[line] — "current copy" — failed checks — 1-sentence direction.**

### CRITICAL

**B1. `frontend/src/app/layout.tsx` (Metadata)**
- **Title:** `"Duskvow — Forge Your Path"`
- **Description:** `"Dark fantasy self-improvement for adults who take their goals seriously. AI-generated talent trees, character arcs, and immersive progression — no cute mascots, no hand-holding."`
- **Fails:** 1, 2, 3, 4.
- **Direction:** This is the highest-visibility string in the product (tab title, Google preview, share cards) and it still carries two of the exact phrases PART-2 rewrote out of the Anti-Section — *"no cute mascots, no hand-holding"* and *"for adults who take their goals seriously."* Replace the description with a mentor-voiced sentence centered on the vow and the companionship note; replace the title with a non-"Forge" formulation (the word is locked to the hero H1, and the browser tab is not the hero).

**B2. `frontend/src/components/tree-wizard/GoalInputStep.tsx:89–91`**
- `"Your vow becomes the seed from which your talent tree grows. The Oracle reads intent — not just words."`
- **Fails:** 1, 2, 3.
- **Direction:** The landing's voice is a present "we" mentor. This line invents an external, detached mystical narrator ("The Oracle") that the user has to decode and that contradicts *"we'll forge the path."* Replace with first-person-plural in the same register as the landing ("we read every word before we build") and drop the capitalized proper noun.

**B3. `frontend/src/components/tree-wizard/GoalInputStep.tsx:102`**
- Loading button: `"Consulting the Oracle…"` / CTA: `"Forge My Path →"`
- **Fails:** 1, 2 (both strings).
- **Direction:** Same Oracle issue as B2; CTA also spends "forge" a second time (it's locked to the landing hero). Replace the loading string with a mentor-voiced progress beat (something in the "reading / listening / shaping" family) and the CTA with a verb that doesn't duplicate the hero.

**B4. `frontend/src/components/tree-wizard/GeneratingStep.tsx` (entire screen)**
- Headline: `"Weaving Your Fate"`. Body: `"The Oracle is crafting your personal talent tree…"`. Footer: `"This may take up to a minute."`
- **Fails:** 1, 2, 3, 4.
- **Direction:** This is the loading screen the user stares at for ~60 seconds immediately after speaking their goal — the most emotionally charged moment in the whole product. "Fate" is fatalistic (removes user agency, the opposite of the landing's *"you walk it"*). "The Oracle" is the same detached narrator flagged in B2/B3. Rewrite the whole screen in mentor-present voice: something the user could imagine a guide saying to them as they wait, referencing the words they just spoke.

**B5. `frontend/src/app/dungeon/page.tsx` (pre-run headline + subline)**
- `"The Dungeon Awaits"` / `"Choose your descent. Steel your mind."`
- **Fails:** 1, 3, 4.
- **Direction:** *"Steel your mind"* is Dark-Souls-stoic, the exact register the landing pivot walked away from. The dungeon doesn't have to stop being hard — but the framing should be a mentor standing next to the user, not a drill sergeant. Replace the subline with language that frames the dungeon as deliberate effort (not grit-performance).

### HIGH

**B6. `frontend/src/app/dungeon/page.tsx` (retreat confirmation modal)**
- `"Retreat now? Your hero will return wounded. Partial XP, no loot."` / Buttons: `"Confirm Retreat"` / `"Hold Position"`
- **Fails:** 1, 4.
- **Direction:** Military-grit voice ("Hold Position"), plus a vaguely punitive framing ("your hero will return wounded"). Retreat is a reasonable choice — the copy should respect it the way a mentor would (still atmospheric, but not shaming). Swap the verbs so the user doesn't feel they're disappointing someone by stopping.

**B7. `frontend/src/app/leaderboard/page.tsx` (subtitle)**
- `"Where heroes are forged in the crucible of discipline"`
- **Fails:** 1, 2, 3.
- **Direction:** *"Forged"* (locked to hero) + *"crucible of discipline"* (gym-bro motivational, not mentor). Replace with a mentor-voiced framing of what the leaderboard actually shows — people walking their paths alongside you — without performance-grit language.

**B8. `frontend/src/components/tree-wizard/FollowUpQuestionsStep.tsx` (loading button)**
- `"Weaving your fate…"` / CTA: `"Generate My Tree →"`
- **Fails:** 1 (loading), 3 (loading).
- **Direction:** Same "fate" issue as B4 at a smaller scale. Replace with a present-tense mentor verb in the "shaping / drawing / charting" family. CTA is acceptable.

**B9. `frontend/src/app/auth/page.tsx` (subtitle)**
- `"Sign in to forge your path"`
- **Fails:** 2.
- **Direction:** "Forge" overuse on a high-traffic surface. Swap the verb; the sign-in subtitle is functional and doesn't need to spend the hero's metaphor.

**B10. `frontend/src/app/dashboard/page.tsx` (Vow Chamber door copy, non-MVP layout)**
- `"Forge and walk your talent trees"`
- **Fails:** 2.
- **Direction:** Third "forge" collision (hero + this line + ResumeStrip CTA + auth). Keep the verb "walk" (on-brand) and replace "forge" with a verb from the on-brand set.

**B11. `frontend/src/app/dashboard/page.tsx` (Dungeon door copy, non-MVP layout)**
- `"Face the darkness. Master your focus."`
- **Fails:** 1, 4.
- **Direction:** Same stoic-grit register as B5/B6. Two clipped imperatives to a user who just loaded their dashboard — no mentor voice. Reframe as an invitation the way the Vow Chamber door invites, not a challenge.

**B12. `frontend/src/components/ui/ResumeStrip.tsx:93` (empty-state CTA)**
- `"Forge a Vow"`
- **Fails:** 2.
- **Direction:** Another "forge" spend on a first-impression surface (new accounts see this before anything else on the dashboard). Swap to a verb that doesn't duplicate the hero — "make," "speak," "begin," etc., live in the same mentor register.

**B13. `frontend/src/components/tree/TreeHeader.tsx:80`**
- Progress pill label: `"Forged"` (rendered as `"{pct}% Forged"`)
- **Fails:** 2.
- **Direction:** Stats label overuse of the hero word. Replace with something in the walked/kindled/lit family so the progress bar tells the user *what progressing feels like*, not what was made.

**B14. User-facing use of the word "node" (multiple files)**
- `components/tree/NodeDetailPanel.tsx:198` — `"Optional — you can skip this node."`
- `components/tree/NodeDetailPanel.tsx:242` — `"Complete prerequisites to unlock this node."`
- `components/tree/NodeDetailPanel.tsx` — buttons `"Start Node"` / `"Reset Node"`
- `components/tree/NodeTooltip.tsx` — `"Requires N prerequisite(s)"` (internal mechanics vocab)
- `components/ui/StatsBar.tsx` — `"Nodes Done"`
- `app/vows/page.tsx` — progress summary `"{n}/{n} nodes · {x}/{x} XP"`
- **Fails:** 1, 2.
- **Direction:** The PART-2 reviewer explicitly flagged *"node"* as internal vocabulary. Pick one user-facing noun that matches the tree metaphor (step, rite, mark, etc.) and replace every instance. This is a small, surgical sweep with outsized tone effect.

**B15. `frontend/src/app/dungeon/page.tsx` (browser notification + post-run messaging)**
- `"The Dungeon Yields"` / `"Your hero has returned. Collect your spoils."`
- **Fails:** 1, 4 (soft).
- **Direction:** "Yields" reads transactional-combat; *"spoils"* is plunder-voice. Keep the atmospheric gravitas but soften toward a mentor congratulating the user for walking a hard thing, not a warlord counting loot.

### MEDIUM

**B16. `frontend/src/app/profile/page.tsx:329`**
- Empty inventory: `"Your pack is empty. Delve deeper."`
- **Fails:** 1, 4.
- **Direction:** Imperative command voice ("Delve deeper"). A mentor wouldn't bark at the user for an empty inventory — would note that loot arrives with the walk.

**B17. `frontend/src/app/leaderboard/page.tsx` (empty state)**
- `"The flames await"` / `"No heroes have entered the hall yet. Be the first."`
- **Fails:** 4.
- **Direction:** "Be the first" is imperative/FOMO. Keep the atmospheric first line, soften the second to an invitation.

**B18. `frontend/src/app/vows/page.tsx` (delete confirmation + loading)**
- `"Are you sure?"` / `"Deleting…"`
- **Fails:** 1.
- **Direction:** Generic system voice inside a product that otherwise atmospheres even its microcopy. Confirm dialogs should carry a hint of the dark-fantasy register (the vow is being *ended*, not just a row deleted) without melodrama.

**B19. `frontend/src/app/vows/page.tsx` (daily-quest reset indicator)**
- `"Resets in Xh Ym"`
- **Fails:** 1 (soft), 5 (borderline — see note below).
- **Direction:** Pure utility voice in the one place the user is most vulnerable to a streak-pressure reading. Reframe neutrally (a mentor-voiced "until dusk" style beat) so the countdown doesn't feel like a shot clock.
- **Streak/guilt note:** The actual `StreakFlame` tooltips are clean (*"complete today's activity to relight"* is permissive, not shaming). This one line is the only real streak-pressure risk in the authed UI.

**B20. `frontend/src/components/ui/StatsBar.tsx` (labels)**
- `"Nodes Done"` / `"XP to next level"` / generic stat rows
- **Fails:** 1, 2.
- **Direction:** See B14 for "Nodes." More broadly, the StatsBar labels are the only surface on the tree canvas that's *completely* flat — it reads like a spreadsheet next to everything around it. Relabel in a mentor-adjacent register without losing number legibility.

**B21. `frontend/src/components/tree/QuestLogPanel.tsx`**
- `"Daily Quests"` label + count only. No voice.
- **Fails:** 1 (by absence).
- **Direction:** The panel is prime real estate on the tree view but carries no atmosphere. Add one short mentor line (or atmospheric header) so it reads as continuous with the rest of the surface, not bolted on.

**B22. `frontend/src/components/dungeon/BattleReport.tsx` (loss framing + stat grid)**
- Loss: `"Your hero returns wounded. The darkness claims what was left behind."`
- Stat grid: `"Floors Cleared / Monsters Slain / Time Spent / XP Earned"` / `"Spoils"` / `"No loot recovered."`
- **Fails:** 1, 4 (loss copy); 1 (labels).
- **Direction:** Loss copy is on the edge — atmospheric but borderline guilt-shaped. A mentor frames a partial run as the run itself being worth something, not as darkness "claiming" effort. Stat labels are acceptable dungeon-genre vocab but *"Spoils"* + *"No loot recovered"* pair to read harsh on failed runs; soften.

**B23. `frontend/src/components/tree-wizard/GoalInputStep.tsx:65–66`**
- `"What do you want to achieve? Be specific — the more detail you give, the more powerful your talent tree will be."`
- **Fails:** 1, 4.
- **Direction:** First functional line of the wizard and it's pure UX instruction — no voice. The hero just promised a warm, mentor-led experience; the tree-making screen should sound like it. Preserve the request for specificity, reframe in mentor voice.

**B24. `frontend/src/components/tree-wizard/FollowUpQuestionsStep.tsx` (supporting copy)**
- `"Each answer shapes the branches of your tree. Choose wisely."`
- **Fails:** 4 (soft).
- **Direction:** *"Choose wisely"* is a micro-stressor on a form the user is already carefully filling out. Reframe as reassurance (the mentor trusts the user's answer) rather than a warning.

**B25. `frontend/src/app/tree/new/page.tsx` + `frontend/src/components/tree/TreeViewPage.tsx`**
- Generic `"Loading…"` fallbacks.
- **Fails:** 1.
- **Direction:** Two of the highest-traffic loading paths in the authed app still fall back to the default system word. The dashboard's loading beat (*"The embers gather…"*) is the pattern — mirror it here.

**B26. `backend/app/data/achievements.json` (two names)**
- `"Consistent"` / `"Well Rounded"`
- **Fails:** 1.
- **Direction:** Every other achievement name in the file is atmospheric ("First Vow," "Oath Keeper," "The Summit," "Vow Eternal"). These two read corporate by contrast. Rename to match the surrounding set.

**B27. `frontend/src/app/dungeon/page.tsx` (pre-run controls)**
- `"Delve Duration"` / `"Longer delves yield more XP and loot"`
- **Fails:** 1.
- **Direction:** Functional strings doing UI-label work. Acceptable to stay close to literal, but rewrite so the dungeon page reads as *one continuous voice* from headline through controls through post-run report.

### LOW

**B28. `frontend/src/lib/api.ts` (error strings)**
- `"Generation is taking longer than expected. Please try again."` / `"Unable to reach the server. Please check your connection and try again."` / `"Server returned an invalid response."` / `"An unexpected error occurred."`
- **Fails:** 1 (soft).
- **Direction:** Functional system errors at the API layer. Acceptable as-is; optional polish only if the project standardizes a mentor-voiced error register.

**B29. `frontend/src/components/ui/ErrorBoundary.tsx`**
- `"Something broke"` / `"An unexpected error occurred. Refresh to try again."`
- **Fails:** 1 (soft).
- **Direction:** Inline crash fallback for components. `app/error.tsx` and `app/global-error.tsx` are already fully on-brand; this shared boundary is the exception. Optional align.

**B30. `frontend/src/app/dashboard/page.tsx` (sign-out loading)**
- `"Leaving…"`
- **Fails:** 1 (very soft).
- **Direction:** Acceptable. Optional polish only.

**B31. `frontend/src/components/ui/HeroNamingModal.tsx` (validation strings)**
- `"A name is required."` / `"Letters, spaces, hyphens, and apostrophes only."` / `"Failed to save. Try again."`
- **Fails:** none strongly; generic.
- **Direction:** The modal itself is one of the best on-brand surfaces in the app. Form-validation strings are acceptably generic; optional polish only.

---

## Section C — Patterns

### C1. The "Oracle" narrator (CRITICAL)
`GoalInputStep.tsx` and `GeneratingStep.tsx` invent a third-person mystical character the landing never established. The landing's voice is a first-person-plural *we* ("we'll forge the path," "we read every word before we build"). The tree wizard — the single most emotional authed flow — routes the user through a detached "Oracle" instead. This is the largest single voice contradiction in the app.

### C2. "Forge" as a linguistic tic (CRITICAL)
PART-2 explicitly locks *"forge"* to the landing hero H1 to prevent it becoming a tic. Authed surfaces currently spend it **seven** additional times: `layout.tsx` title, `auth/page.tsx` subtitle, `dashboard/page.tsx` Vow Chamber door, `ResumeStrip.tsx` CTA, `TreeHeader.tsx` progress pill, `GoalInputStep.tsx` CTA, `leaderboard/page.tsx` subtitle. The word does no more work after the hero — every reuse flattens it.

### C3. Dungeon stoic-grit register (HIGH)
*"Steel your mind," "Hold Position," "Confirm Retreat," "crucible of discipline," "return wounded," "darkness claims what was left behind."* The dungeon feature was built in a register the landing pivoted away from (Dark-Souls-stoic, military-grit). It's self-consistent but out-of-voice with the rest of the product. A user who loves the warm landing and the on-brand FirekeeperLine will feel the dungeon as a different app.

### C4. "Node" leaking into user-facing copy (HIGH)
Six user-facing surfaces still call the tree units "nodes" — the exact word the landing reviewer flagged as internal vocab. Small fix, outsized tone effect: every in-app surface gets quieter the moment the implementation word is replaced with a metaphor word.

### C5. "Fate" framing (HIGH)
Two loading screens (`GeneratingStep` + `FollowUpQuestionsStep`) use *"weaving your fate."* The landing explicitly positions the user as the agent (*you walk it*). Fate is the opposite — removes agency, frames outcome as preordained. Small words, but they invert the central promise.

### C6. Root metadata contradicts the landing (CRITICAL)
`layout.tsx` is technically pre-authed but it's the single highest-visibility surface in the product (tab title, Google preview, OG card) and still carries *"no cute mascots, no hand-holding"* — the exact phrasing PART-2 rewrote out of the Anti-Section. Anyone who shares a Duskvow link on Twitter is sharing the pre-pivot voice.

### C7. On-brand vocab underused (MEDIUM)
**tend, hearth, lantern, kindling, bonfire, walk, oath** barely appear inside the app. The landing pivot introduced a full vocabulary; the in-app surfaces use maybe 30% of it. Empty states, labels, loading strings, and door copy are the natural homes for the unused words.

### C8. Imperative command voice (MEDIUM)
*"Delve deeper," "Be the first," "Choose wisely," "Steel your mind," "Hold Position," "Face the darkness. Master your focus."* Six distinct surfaces use clipped imperatives. The landing's mentor voice never commands — it invites, frames, reassures. Every imperative is a small break in character.

### C9. Functional microcopy islands (MEDIUM)
`QuestLogPanel`, `StatsBar`, the `BattleReport` stat grid, and the daily-quest reset counter are flat system-voice islands surrounded by atmospheric surfaces. They read as if they were built before the voice was decided. Small additions — one mentor line per island — would stitch them into the rest of the product.

### C10. North Star pattern — amplify it (NOT A FINDING; GUIDE)
`FirekeeperLine` (inline in `dashboard/page.tsx:611–650`), `HeroNamingModal.tsx`, `LevelUpModal.tsx`, `ResumeStrip.tsx` loading state, `TreeCanvas.tsx` tier labels, `error.tsx`, `global-error.tsx` — these surfaces are already at the quality level the landing demands. The "weather" model in FirekeeperLine (*"the flame waits / the path waits, the flame remembers you / the embers hold, rest if you need to"*) is the single best mentor-voice pattern in the codebase; it's the thing to *expand to more surfaces*, not just preserve.

---

## Section D — Five Highest-Impact Fixes

Ordered by tone-return-per-line-changed. If only one week is available, do these and stop.

### D1. Rewrite the tree wizard's voice end-to-end (the "Oracle" kill)
**Files:** `GoalInputStep.tsx` (lines 65–66, 89–91, 102), `FollowUpQuestionsStep.tsx` (sub-copy + loading button), `GeneratingStep.tsx` (entire screen).
**Why:** This is the most emotionally-loaded authed flow and it's voiced in the wrong register. Every new user passes through it within their first 60 seconds post-signup. Fixing the wizard is the single largest tone improvement available.
**Effort:** Small — six strings, one coherent rewrite pass in mentor voice.

### D2. Replace the root metadata
**File:** `app/layout.tsx`.
**Why:** Every tab, every share card, every Google result carries the pre-pivot voice including the exact attack phrases PART-2 removed. This is a one-file, two-string fix with outsized blast radius.
**Effort:** Trivial — two strings.

### D3. The "forge" sweep (lock it to hero)
**Files:** `layout.tsx`, `auth/page.tsx`, `dashboard/page.tsx` (Vow Chamber door), `ResumeStrip.tsx`, `TreeHeader.tsx`, `GoalInputStep.tsx` CTA, `leaderboard/page.tsx` subtitle.
**Why:** Seven surfaces currently duplicate the hero metaphor. Every single one is a line where the word *walks in from the hero and flattens* on arrival. The fix is trivial per-string; the cumulative tone return is large.
**Effort:** Small — seven strings, each a one-word swap.

### D4. De-grit the dungeon surface
**Files:** `dungeon/page.tsx` (pre-run headline + subline, retreat modal + its buttons, browser notification, post-run "Yields/Spoils" framing), `BattleReport.tsx` (loss copy + stat labels), `leaderboard/page.tsx` (subtitle — "crucible of discipline" rides on the same voice problem).
**Why:** The dungeon is the second-most-used feature after the tree, and it's voiced in a register the landing walked away from. Users who resonate with the warm landing will read the dungeon as a different product.
**Effort:** Medium — ~12 strings, needs a coherent voice pass (not one-word swaps).

### D5. Retire "node" from user-facing copy
**Files:** `NodeDetailPanel.tsx` (buttons + prereq lines + optional-skip copy), `NodeTooltip.tsx`, `StatsBar.tsx` ("Nodes Done"), `vows/page.tsx` (progress summary).
**Why:** The landing reviewer flagged *"node"* as internal vocab; it still leaks into six surfaces. One chosen metaphor word replaces every instance. Low-effort, high-tone-polish.
**Effort:** Small — pick one replacement word, sweep.

---

## Section E — Questions for You

These are the decisions I'd need your input on before making the actual edits. Ordered by how much hangs on each answer.

1. **"Oracle" — kill completely, or rename?** The cleanest fix is to delete the third-person mystical narrator entirely and use the landing's first-person-plural *we* everywhere (so the tree wizard reads as *"we read every word before we build"*). The alternative is renaming it to something closer to the Firekeeper/mentor register (so the narrator stays but becomes warm). Which do you want? *This decides the whole voice of the wizard.*

2. **"Forge" — hero-only, or hero-plus-one-other-surface?** The PART-2 discipline says hero-only. But a case exists for letting the auth page echo it once (*"sign in to forge your path"* as gate motif). Do you want the strict lock, or one sanctioned reuse? *This decides whether D3 is a sweep-all or a sweep-most.*

3. **Dungeon stoic-grit — keep as genre contrast, or pivot fully?** There's a defensible argument that the dungeon is allowed to be *harder-voiced* than the tree (because it's the focus-timer feature, and the stoic register is load-bearing for "this is the hard thing"). But it reads as out-of-voice today. Do you want to keep a softened-stoic register for the dungeon only, or pivot it fully into mentor voice the way the tree is?

4. **"Fate" language — out completely?** *"Weaving your fate"* appears twice. I'd remove both (agency is the landing's central promise). Confirm?

5. **"Node" — what replacement word?** Candidates in decreasing boldness: **rite** (ties to landing's "The Rite"), **step** (neutral, readable), **mark** (atmospheric but unfamiliar), **trial** (overloaded — dungeon already uses it). I'd lean **rite** for user-facing copy and keep **node** only in developer-facing comments/types. Confirm the word.

6. **How far down the stack?** Should the mentor voice reach stat labels ("Nodes Done," "XP to next level"), tooltip mechanic copy ("Requires N prerequisite(s)"), and form-validation strings ("A name is required.") — or is there a level at which functional-voice is acceptable and expected? I'd propose: *mentor voice down to labels and tooltips, functional voice below that (validation + API errors).* Confirm or redraw the line.

7. **FirekeeperLine expansion.** The `dashboard/page.tsx` inline FirekeeperLine is the best voice pattern in the codebase. Worth extracting into a shared component and reusing on the tree page, the vows page, and the empty-state moments across the app? *This is a small architectural call, not a copy decision — flag it because it would change the shape of the fix.*

---

*End of audit.*
