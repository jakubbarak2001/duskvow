# In-App Copy Pivot — Proposals

**Date:** 2026-04-17
**Status:** **LOCKED — ready for execution.** Seven judgment calls were flagged on the first review and resolved 2026-04-17; the final choices are marked *(LOCKED)* inline throughout and consolidated in the closing *Recommended Combination* section. Execution order: **D2 → D1 → D3 → D5 → D4**, one commit per D.
**Scope:** Five fixes from `IN-APP-TONE-AUDIT.md` — D1 (tree wizard), D2 (root metadata), D3 (forge sweep), D4 (dungeon de-grit), D5 (node → step sweep).

## Guiding Principles (carried from landing pivot + the locks)

1. **No invented narrators.** The "Oracle" is dead. First-person-plural "we" everywhere, matching the landing's *"we'll forge the path"* / *"we read every word before we build."*
2. **"Forge" is locked to the hero H1.** Zero reuses anywhere else. Candidate replacement verbs from the on-brand set: *speak, walk, tend, draw, shape, kindle, read, listen, mark, set, begin.*
3. **No fate language.** Both *"weaving your fate"* instances are out. Agency is the central landing promise.
4. **"Node" → "step"** in every user-facing string. Keep "node" in code, types, and comments.
5. **Dungeon stays harder-voiced than the tree** — but no shame-framing, no drill-sergeant imperatives, no *"crucible of discipline,"* no *"steel your mind,"* no *"darkness claims what was left behind."*
6. **Mentor voice reaches labels and tooltips. Functional voice below that** — form validation and API errors stay flat and helpful.
7. **Every rewrite ≤ the string it replaces.** Voice comes from word choice, not volume.
8. **Healthy Gamer test:** every proposed line must read as *"they want me to get better,"* not as *"they want me to perform."*

---

## Section 1 — D1 Tree Wizard (kill the Oracle, kill fate)

The wizard is the single highest-stakes authed flow — new users pass through it within their first 60 seconds. Six strings to rewrite. They chain into a narrative: *say what you're chasing → each answer shapes a branch → we draw the path.*

### 1a. `GoalInputStep.tsx:65–66` — body copy under H1

**Current:** *"What do you want to achieve? Be specific — the more detail you give, the more powerful your talent tree will be."*

- **Option A:** *"Tell us what you're reaching for. The more you tell us, the truer the path we draw."*
- **Option B:** *"Speak what you're chasing. The more you give us, the closer the tree fits."*
- **Option C:** *"What are you reaching for? Give us the shape of it — the details steady our hand."*

Each echoes the landing's *"we read every word before we build"* — shifts the voice from UX instruction to mentor prompt. **A** is closest structurally to the original; **C** is the warmest.

### 1b. `GoalInputStep.tsx:89–91` — atmospheric note below textarea

**Current:** *"Your vow becomes the seed from which your talent tree grows. The Oracle reads intent — not just words."*

- **Option A:** *"Your vow is the seed. We read intent — not just the words on the page."*
- **Option B:** *"From the vow, the tree. We listen for what you mean, not what you type."*
- **Option C:** *"Your vow is the seed the tree grows from. We read for intent, not keywords."*

All three kill "Oracle." **A** is the minimum viable edit (same rhythm as the original); **B** is the most mentor-voiced.

### 1c. `GoalInputStep.tsx:102` — loading button + CTA

**Current loading:** *"Consulting the Oracle…"*  |  **CTA:** *"Forge My Path →"*

**Loading options:**
- **L-1:** *"Reading your vow…"*
- **L-2:** *"Listening…"*
- **L-3:** *"Drawing the first line…"*

**CTA options:**
- **C-1:** *"Speak the Vow →"*
- **C-2:** *"Begin →"*
- **C-3:** *"Set the Path →"*

Loading wants to narrate *what we're doing while you wait* in mentor-voice. **L-1** is the tightest match to the landing's *"we read every word"* promise. CTA wants a verb that isn't "forge" — **C-1** connects to the hero's *"Speak Your Goal"* and pays it off at the moment the user commits.

### 1d. `FollowUpQuestionsStep.tsx:107` — sub-copy under H2

**Current:** *"Each answer shapes the branches of your tree. Choose wisely."*

- **Option A:** *"Each answer shapes a branch. Answer as you are — not as you think we want."*
- **Option B:** *"Each answer bends a branch. There's no wrong turn — the path follows you."*
- **Option C:** *"Each answer draws a branch. Pick the one that sounds like your life, not the one that sounds impressive."*

Kills *"Choose wisely"* (micro-stressor). **A** is the tightest mentor-trust line; **C** is the warmest but longer than the original.

### 1e. `FollowUpQuestionsStep.tsx:207` — loading button

**Current loading:** *"Weaving your fate…"*  |  **CTA:** *"Generate My Tree →"* *(CTA acceptable — leave)*

**Loading options:**
- **L-1:** *"Shaping the branches…"*
- **L-2:** *"Drawing your tree…"*
- **L-3:** *"Tracing the path…"*

All three drop "fate" and pair to Step II of the landing's Rite (*"shaped from the words you spoke"*). **L-1** is the directest echo of that line.

### 1f. `GeneratingStep.tsx` — full screen (headline + body + footer)

This is the longest-dwell moment in the authed app (~60 seconds). Worth taking time on.

**Current headline:** *"Weaving Your Fate"*

- **H-1:** *"Drawing Your Path"*
- **H-2:** *"Shaping Your Tree"*
- **H-3:** *"Reading Your Vow"*
- **H-4:** *"The First Lines"*

**H-1** is the most on-brand (*draw* + *path* — two landing-vocab words); **H-3** reframes the wait as *listening*, which is the single warmest choice.

**Current body:** *"The Oracle is crafting your personal talent tree…"*

- **B-1:** *"We're taking what you said and shaping the first branches."*
- **B-2:** *"We heard you. The path is taking form."*
- **B-3:** *"Your words are becoming a tree. Give us a moment."*

**B-2** is the tightest mentor beat (*"we heard you"* is the single warmest line in the whole wizard).

**Current footer:** *"This may take up to a minute"*

- **F-1:** *"A minute, give or take."* *(LOCKED)*
- **F-2:** *"This takes a moment — good trees are slow to draw."*
- **F-3:** *"This may take a minute. Good paths take time."*

**Locked: F-1.** A real mentor tells the user how long it takes — they don't editorialize during the wait. F-3 reads as writer-showing-off; F-1 is quiet confidence.

---

## Section 2 — D2 Root Metadata

**Current title:** *"Duskvow — Forge Your Path"*

- **T-1:** *"Duskvow — Speak Your Vow"*
- **T-2:** *"Duskvow — Walk the Path"*
- **T-3:** *"Duskvow — A Path for What You're Chasing"*
- **T-4:** *"Duskvow — Dark Fantasy Self-Improvement"*

**Locked: T-1 — *"Duskvow — Speak Your Vow"*.** Mirrors the hero H1's first half (*"Speak Your Goal"*) without stealing "forge." Voice > SEO at this stage: *"dark fantasy self-improvement"* is a non-competitive search term anyway, and the title's real job is to carry brand voice on shared links (Reddit, Discord, word of mouth).

**Current description:** *"Dark fantasy self-improvement for adults who take their goals seriously. AI-generated talent trees, character arcs, and immersive progression — no cute mascots, no hand-holding."*

- **D-1:** *"Speak any goal. A dark-fantasy talent tree grows from your words — and a mentor's voice walks it with you."*
- **D-2:** *"Dark-fantasy self-improvement. Speak the vow, we draw the path, you walk it at your pace."*
- **D-3:** *"Speak what you're chasing. Your goal becomes a dark-fantasy talent tree — branches, rites, a path, and a hand at your back as you walk it."*
- **D-4:** *"A dark-fantasy self-improvement app for the goal you can't put down. We draw the path. You walk it. We walk it with you."*

**Locked: D-2 — *"Dark-fantasy self-improvement. Speak the vow, we draw the path, you walk it at your pace."*** Three beats (speak / draw / walk), mentor voice, category word intact for any social-card context.

---

## Section 3 — D3 "Forge" Sweep (lock to hero H1 only)

Every current non-hero use of *"forge"* and the proposed replacement. One line per surface; no alternatives — the locked choice below.

| File | Line | Current | Proposed |
|---|---|---|---|
| `app/layout.tsx` | 30 | `"Duskvow — Forge Your Path"` | **Covered in D2 (T-1 recommended: *"Duskvow — Speak Your Vow"*).** |
| `app/auth/page.tsx` | 161 | `"Sign in to forge your path"` | *"Return to your path"* *(this is a sign-IN — user already has one)* |
| `app/dashboard/page.tsx` | 533 | `"Forge and walk your talent trees"` | *"Speak, tend, and walk your talent trees"* |
| `components/ui/ResumeStrip.tsx` | 95 | CTA `"Forge a Vow"` | *"Speak a Vow"* |
| `components/tree/TreeHeader.tsx` | 80 | Pill label `"Forged"` | *"Walked"* *(matches "you walk it")* |
| `components/tree-wizard/GoalInputStep.tsx` | 102 | CTA `"Forge My Path →"` | **Covered in D1/1c (C-1 recommended: *"Speak the Vow →"*).** |
| `app/leaderboard/page.tsx` | 143 | `"Where heroes are forged in the crucible of discipline"` | **Covered in D4 (L-1 recommended — see below).** |

Seven surfaces, five net edits after D1/D2/D4 overlap.

---

## Section 4 — D4 Dungeon De-grit (softened stoic, not full mentor)

The dungeon keeps its genre weight — words like *Venture Forth*, *Delving…*, *The Shallow Crypts*, *Claim Victory*, *Delve Again*, *Return to Hub* all stay. We only touch the lines that cross into drill-sergeant or shame.

### 4a. `dungeon/page.tsx:566–578` — pre-run headline + subline

**Current headline:** *"The Dungeon Awaits"* — **keep.** Already atmospheric, nothing to fix.

**Current subline:** *"Choose your descent. Steel your mind."*

- **Option A:** *"Choose your depth. The walk will ask something of you."*
- **Option B:** *"Pick your descent. Bring a quiet mind."*

**A** softens *"steel your mind"* into invitation (*"ask something of you"* is mentor, not drill). **B** is the tightest rewrite — same two-beat rhythm, different verb register.

### 4b. `dungeon/page.tsx:1445–1448` — retreat confirm body

**Current:** *"Retreat now? Your hero will return wounded. Partial XP, no loot."*

- **Option A:** *"Turn back? The path you've walked still counts. Partial XP, no loot."* *(LOCKED)*
- **Option B:** *"Step out now? You keep what you've earned — XP in full, but the loot stays below."*

**Locked: Option A.** Kills *"your hero will return wounded"* (punitive framing) but explicitly keeps *"Partial XP, no loot"* — a real mentor tells you the cost so you can decide. Hiding consequences would contradict the voice, not support it.

### 4c. `dungeon/page.tsx:1469` — button "Confirm Retreat"

- **Option A:** *"Turn Back"*
- **Option B:** *"Leave the Dungeon"*

**A** preserves the two-word cadence and softens the military register.

### 4d. `dungeon/page.tsx:1487` — button "Hold Position"

- **Option A:** *"Keep Going"*
- **Option B:** *"Stay"*

Both kill the military-ops voice. **A** is the directest continue-the-run signal.

### 4e. `dungeon/page.tsx:185–187` — browser notification

**Current:** title *"The Dungeon Yields"* / body *"Your hero has returned. Collect your spoils."*

- **Option A:** title *"The Dungeon Yields"* *(keep)* / body *"Your hero is back. Come collect what you earned."*
- **Option B:** title *"You've Returned"* / body *"The path below is walked. Come gather what you earned."*

**A** is the minimum viable edit (the title is load-bearing — it's also a badge in the in-app UI). **B** is the fuller voice pivot.

### 4f. `BattleReport.tsx:110` — headline "Forced Retreat"

*"The Dungeon Yields"* stays (already OK). *"Forced Retreat"* is the military-grit one.

- **Option A:** *"A Step Back"*
- **Option B:** *"Return from Below"* *(LOCKED)*

**Locked: Option B.** *"A Step Back"* reads too soft for a dungeon headline — the lock is softened-stoic, not full mentor. *"Return from Below"* preserves genre gravitas while killing the military-ops framing.

### 4g. `BattleReport.tsx:122–123` — loss subhead

**Current:** *"Your hero returns wounded. The darkness claims what was left behind."*

- **Option A:** *"Your hero returns. What you walked, you keep — the rest stays in the dark."*
- **Option B:** *"Your hero steps back into the light. Some floors still wait below."*

Both kill *"darkness claims what was left behind"* (guilt-shaped). **A** preserves the two-beat rhythm; **B** is more invitational (the floors are *waiting*, not lost).

### 4h. `BattleReport.tsx:233` — section heading "Spoils"

- **Option A:** *"Carried Out"*
- **Option B:** *"What You Carried Up"*

**A** is tighter and keeps the label register; **B** is slightly more atmospheric.

### 4i. `BattleReport.tsx:246` — empty-loot line "No loot recovered."

- **Option A:** *"Empty-handed this run. The walk still counts."*
- **Option B:** *"Nothing carried up. The path itself was the pay."*

Both remove the flat "recovered" framing and add a line that stops the empty-loot case from reading as a failure indictment.

### 4j. `leaderboard/page.tsx:143` — subtitle (same voice family as dungeon)

**Current:** *"Where heroes are forged in the crucible of discipline"*

- **Option A:** *"Where the ones still walking gather."*
- **Option B:** *"Where paths are being walked, together."*
- **Option C:** *"Where heroes are tempered by the walk."* *(LOCKED)*

**Locked: Option C.** Keeps *"heroes"* (consistent with profile stats, leaderboard rows, and notifications that already use the word), kills *"forged"* and *"crucible of discipline,"* and pulls *"tempered"* from the landing footer (*"Tempered by ambition. Tended by hand."*) so the leaderboard subtitle reads as a cross-surface echo of the landing's closer. The walk itself is what tempers heroes — not an abstract *"discipline."*

### 4k. Lines left unchanged (documented for completeness)

- *"Venture Forth"* (CTA), *"Descending…"* (loading), *"Delving…"* (active-run status), *"Claim Victory"* (timer-done CTA), *"Delve Again"* (post-run CTA), *"Return to Hub"* — all genre-appropriate, all kept.
- Stat grid labels — *"Floors Cleared / Monsters Slain / Time Spent / XP Earned"* — acceptable dungeon-genre vocab, kept.
- Tier names — *"The Shallow Crypts / The Ember Mines / The Hollow Deep / The Abyssal Rift"* — on-brand, kept.

---

## Section 5 — D5 "Node" → "Step" Sweep

Every user-facing instance of *"node"* (singular or plural) to replace with *"step."* Keeps the word in code, types, comments, CSS class names, and dev-only strings.

| File | Line | Current | Proposed |
|---|---|---|---|
| `components/tree/NodeDetailPanel.tsx` | 198 | `"Optional — you can skip this node."` | *"Optional — you can skip this step."* |
| `components/tree/NodeDetailPanel.tsx` | 242 | `"Complete prerequisites to unlock this node."` | *"Complete the earlier steps to unlock this one."* *(also softens "prerequisites")* |
| `components/tree/NodeDetailPanel.tsx` | 257 | button `"Start Node"` | *"Begin Step"* |
| `components/tree/NodeDetailPanel.tsx` | 288 | button `"Reset Node"` | *"Reset Step"* |
| `components/tree/NodeTooltip.tsx` | 44–45 | `"Requires N prerequisite(s)"` | *"Requires N earlier step(s)"* *(approved in scope — "prerequisite" is the same internal-vocab problem as "node")* |
| `components/ui/StatsBar.tsx` | 203 | label `"Nodes Done"` | *"Steps Walked"* |
| `app/vows/page.tsx` | 638 | `"{n}/{n} nodes · {x}/{x} XP"` | *"{n}/{n} steps · {x}/{x} XP"* |
| `components/tree/TreeHeader.tsx` | 64 | pill label `"Nodes"` | *"Steps"* |

Eight user-facing surfaces. Every swap is a noun-for-noun substitution except the one at NodeDetailPanel.tsx:242, which also reframes *"prerequisites"* into *"earlier steps"* because they're the same internal-vocab problem.

*Aria label at `TreeHeader.tsx:38` — `aria-label="Back to Vow Chamber"` — keeps "Vow Chamber" (on-brand), no change.*

---

## Recommended Combination

The single locked set, for the execution passes.

### D1 — Tree Wizard
- **1a body (GoalInputStep):** **Option A** — *"Tell us what you're reaching for. The more you tell us, the truer the path we draw."*
- **1b atmospheric (GoalInputStep):** **Option A** — *"Your vow is the seed. We read intent — not just the words on the page."*
- **1c loading (GoalInputStep):** **L-1** — *"Reading your vow…"*
- **1c CTA (GoalInputStep):** **C-1** — *"Speak the Vow →"*
- **1d sub-copy (FollowUpQuestionsStep):** **Option A** — *"Each answer shapes a branch. Answer as you are — not as you think we want."*
- **1e loading (FollowUpQuestionsStep):** **L-1** — *"Shaping the branches…"*
- **1f GeneratingStep:** headline **H-1** *"Drawing Your Path"* / body **B-2** *"We heard you. The path is taking form."* / footer **F-1** *"A minute, give or take."*

**Why:** These six strings read as one continuous mentor thread. *Tell us what you're reaching for → we read intent → we're reading now → speak the vow → each answer shapes a branch → we're shaping now → we heard you, the path is taking form.* No Oracle. No fate. The wizard becomes the landing's promise made good.

### D2 — Root Metadata
- **Title:** **T-1** — *"Duskvow — Speak Your Vow"*
- **Description:** **D-2** — *"Dark-fantasy self-improvement. Speak the vow, we draw the path, you walk it at your pace."*

**Why:** Title rhymes with the hero's first half (*"Speak Your Goal"*) without stealing "forge." Description is the tightest full-landing-summary available — three beats, mentor voice, category word intact for SEO.

### D3 — "Forge" Sweep
As tabled above in Section 3. Net five edits after D1/D2/D4 overlap.

### D4 — Dungeon De-grit
- **4a subline:** Option A — *"Choose your depth. The walk will ask something of you."*
- **4b retreat body:** Option A — *"Turn back? The path you've walked still counts. Partial XP, no loot."*
- **4c "Confirm Retreat":** Option A — *"Turn Back"*
- **4d "Hold Position":** Option A — *"Keep Going"*
- **4e notification:** Option A — title *"The Dungeon Yields"* / body *"Your hero is back. Come collect what you earned."*
- **4f "Forced Retreat":** Option B — *"Return from Below"*
- **4g loss subhead:** Option A — *"Your hero returns. What you walked, you keep — the rest stays in the dark."*
- **4h "Spoils":** Option A — *"Carried Out"*
- **4i "No loot recovered.":** Option A — *"Empty-handed this run. The walk still counts."*
- **4j leaderboard subtitle:** Option C — *"Where heroes are tempered by the walk."*

**Why:** The locks preserve the existing cadence and keep genre weight where it's earned (tiers, CTAs, timer labels all survive) while killing the three worst offenders: *"steel your mind," "crucible of discipline," "darkness claims what was left behind."* The dungeon headline (4f) gets the more gravitas-preserving *"Return from Below"* because the feature lock is softened-stoic, not full mentor. The leaderboard subtitle threads *"tempered"* through from the landing footer so the surface reads as continuous with the landing's closer.

### D5 — Node → Step Sweep
As tabled above in Section 5. Eight user-facing surfaces.

---

## Summary

The pivot lands on a consistent mentor voice across every entry point (metadata, auth, hub doors, tree wizard, tree view, dungeon). The wizard — currently the largest single voice contradiction — becomes the landing's promise *made good in real time*: the user speaks their vow, we read it, we shape the branches, we draw the path, they walk it. The dungeon keeps its genre teeth but stops shaming the user for stopping early. The leaderboard stops preaching "discipline." Every non-hero use of *"forge"* goes cold. Every user-facing *"node"* becomes *"step."*

**Net edit count:** ~34 strings across 13 files. Execution budget (per the audit's prior estimate) one focused week; realistic if the five passes are landed in the user's stated order (D2 → D1 → D3 → D5 → D4).

---

*End of proposals. Awaiting user review before any code edits.*
