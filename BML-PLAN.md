# BML-PLAN.md — Build-Measure-Learn Pivot

> **Created 2026-04-15.** Living document — re-read every Sunday and edit
> when reality diverges from the plan. The plan is not a contract; the
> learning is the point.

---

## 0. Reality Check — Read Before The Plan

Brutal observations grounding this document. None are personal. They are
observations of the artifacts already in this repo.

**You have built ahead of evidence.** Per `STATE.md` line 76+, you have
already shipped: Auth, Tree wizard, AI generation, React Flow tree
canvas, Node detail panel, Hero levels with titles Wanderer→Vow Eternal,
Hero profile page, Daily Quests, Dungeon AFK combat (4 tiers, monster
pools, loot tables, retreat mechanics), Achievement system (13 badges
across 4 categories), Inventory, Embers/Brazier, Streak multipliers,
Leaderboard. `STRATEGY.md` then plans Sprints E, F, G on top.
**Zero of these features have ever been used by a real user who isn't
you.** That is the central problem this document is trying to fix.

**Your stated hypothesis is at least four hypotheses in a trench coat.**
"People want dark fantasy self-improvement" smuggles in:
- (a) People want gamified self-improvement at all
- (b) They want it structured by maps/trees vs lists/streaks
- (c) They want it themed dark fantasy (vs neutral, vs cyberpunk, vs minimalist)
- (d) They want AI to author the structure for them vs composing it themselves

Each can fail independently. Section 1 splits these out so each can be
tested in isolation, and ordered by how cheaply each can be tested.

**The talent tree is not the right test for the dark fantasy aesthetic
hypothesis.** The talent tree tests the structure-from-AI mechanic
(b + d). Aesthetic resonance is a separable test, and you need both to
land. Don't assume validating one validates the other.

**`STRATEGY.md` already flagged your retention risk in your own words.**
Octalysis CD3 (Creativity) is scored 1/10 — *"user is consumer of AI
output, not creator."* That score is yours, not mine. If the AI authors
the entire tree and the user just walks it, the loop is structurally
one-shot. Section 5 makes "users complete one tree and never come back"
a hard kill criterion, not a vibe.

**Five subreddits = five audiences.** r/ADHD wants low-friction dopamine.
r/getdisciplined wants stoic grit. r/gamification wants RPG mechanics in
everything. r/productivity wants spreadsheets and frameworks.
r/selfimprovement is a noise floor. They are not the same person and
they will not validate the same thing. Section 2 maps each sub to a
*specific* hypothesis instead of broadcasting the same content
everywhere.

**You are also doing math prep, job hunting, and coding.** Any plan that
demands 3 hours/day of community engagement will fail. Section 2 budgets
~45 min/day on weekdays only. The plan that gets executed beats the
plan that's optimal on paper.

**The right next step is not building.** It is freezing scope, getting
concrete signal from real humans, and using that signal to decide
whether to keep building, pivot, or kill. The Dungeon-hide commit
(`8f22330`) was already a step in this direction. Keep going. Hide
more. Sprint E, F, G in `STRATEGY.md` go on hold until Section 5 says
proceed.

---

## 1. Hypothesis Registry

Each hypothesis is split so it can be tested in isolation. Ordered by
how cheaply they can be tested — H1 is the cheapest, H5 the most
expensive (requires shipping product).

### H1 — Aesthetic Resonance

**Statement:** Adults aged 22-40 who self-identify as gamers AND as
struggling with discipline find a "Dark Souls / dark fantasy" aesthetic
for self-improvement *more* motivating than a neutral/minimalist or a
cute/pastel aesthetic.

**Validated:** In a side-by-side preference test of three landing-page
hero shots (yours + a neutral control + a cute control), shown in 2+
low-pressure community contexts, the dark fantasy hero gets >50% of
"this is the one I'd actually use" picks **AND** at least 3 unprompted
qualitative comments use the words you intend (atmospheric / serious /
takes me seriously / not childish).

**Invalidated:** <30% pick the dark fantasy version, OR the qualitative
comments cluster on "trying too hard" / "edgelord" / "not for me."
Mixed (30-50%) means run a second sample before deciding.

**Test:** Post a single image triplet in a "what aesthetic motivates
you?" framing in r/UI_Design or r/gamedev or a Discord #design channel.
Do not mention you built it. Frame: *"Found these three productivity
app concepts — which one would actually pull you in?"* The point is to
*not* be the creator in this test.

**Sample size:** 30+ vote-style responses across 2 contexts before
drawing conclusions. Verbatim quotes carry more weight than vote counts
at this scale.

---

### H2 — Mechanic Resonance (Talent Tree vs Lists)

**Statement:** Among gamification-curious adults, an RPG talent tree
(visual, branching, locked nodes) is *more* motivating than a checklist
or streak counter as a structure for personal goals.

**Validated:** ≥7/10 concept testers pick the tree over a checklist
when shown both for the same goal ("learn guitar in 3 months"), AND
when asked *why*, they give reasons grounded in motivation/clarity
("I can see what's coming next") rather than novelty ("looks cool").

**Invalidated:** <4/10 pick the tree, OR they pick the tree but their
"why" reasons are pure aesthetic and they admit they'd actually use a
checklist.

**Test:** Concept test (Section 3) — show two static mockups for the
same goal. Tree on the left, checklist on the right. *"If you were
trying to do this thing, which structure would help you more, and
why?"* The "why" matters more than the pick.

**Sample size:** 8-12 deep responses. Quality > quantity at this
stage.

---

### H3 — AI Authorship Resonance

**Statement:** Target users want an AI to *generate* the structure of
their goal-pursuit (trees, milestones, sub-goals) rather than compose
it themselves.

**Validated:** ≥6/10 concept-test participants react to "AI generates
a personalized talent tree from your goal" with curiosity/enthusiasm
rather than skepticism. AND in a follow-up ("would you trust the tree
the AI made?"), ≥5/10 say yes or "I'd at least try it."

**Invalidated:** ≥6/10 say "I'd want to make it myself" or "I don't
trust AI to plan my life." **This is the most likely failure mode and
it kills the current product flow.**

**Test:** Same concept test as H2, but with an added question after
the tree-vs-list pick: *"I want to be honest — that tree was generated
by AI from a one-sentence goal you typed. Does that change how you
feel about it?"* Open-ended, capture verbatim. (See `STRATEGY.md`
line 30 — CD3 Creativity is 1/10 because the user is a consumer of AI
output, not a creator. H3 is the test for whether that's a fatal
flaw.)

**Sample size:** Same 8-12 concept-test participants.

---

### H4 — Pain Acuity

**Statement:** "Self-improvement apps feel boring/childish/lifeless"
is a top-3 frustration for the dark-fantasy-curious adult, not a niche
complaint.

**Validated:** In open-ended Reddit/Discord questions ("what's your
biggest frustration with self-improvement apps you've tried?"), at
least 1 in 5 responses spontaneously mentions aesthetic, tone,
infantilization, or "not built for adults." No prompting from you.

**Invalidated:** <1 in 15 responses mention aesthetic. Most pain
points cluster on (a) consistency, (b) measurable progress,
(c) actually changing behavior. This means the dark fantasy angle is
a feature *you* care about that users don't.

**Test:** Pure listening + one open-ended question per week per sub
in Week 3. Read every reply. Tag each.

**Sample size:** 50+ replies across 4 weeks.

---

### H5 — Willingness To Try

**Statement:** Among target users who say a dark fantasy gamified
self-improvement app sounds interesting, ≥40% will actually click a
link / sign up / return a survey when given a no-friction private
invite.

**Validated:** Of users who DM you "this sounds interesting," ≥4/10
take an action within 48 hours of an invite.

**Invalidated:** <2/10 follow through. Verbal interest is performative
("I love the idea!") but activation energy is too high — common in the
self-improvement space.

**Test:** Only after H1-H4 give a "proceed" signal. This is the first
hypothesis that requires showing the actual product.

**Sample size:** 10 invites minimum.

---

## 2. Pre-Launch Research Plan (Weeks 1-4)

**Time budget:** 45 minutes/day, weekdays only. Two days fully off.
**Total weekly: ~3.75 hours.** Realistic given math prep + job hunting
+ coding. A plan demanding more will not be executed.

### Anti-shadowban rules (non-negotiable)

You said you got shadowbanned before for being too promotional. These
exist so it doesn't happen again:

- **No links to anything you own.** Not even your GitHub. Not in
  comments, not in DMs.
- **No "I'm building..."** in the first 4 weeks. You are building
  presence, not pitching.
- **No cross-posting.** Same content in two subs reads as spam to
  Reddit's filter.
- **≥80% of activity is commenting on others, ≤20% is original posts.**
  Flip this ratio and you trip filters.
- **Read each subreddit's rules and pinned posts before posting.** Some
  ban product mentions in DMs as well.
- **If a post gets removed, message the mod and ask why. Do not
  repost.**

### Subreddit / Discord → Hypothesis Mapping

| Sub / Server | Maps to | Why |
|---|---|---|
| r/getdisciplined | H4, H2 | Highest density of "I keep failing at habits" posts. Stoic crowd may resist gamification — useful negative signal. |
| r/gamification | H2, H3 | Audience already opted into your category. Test mechanic + AI authorship here first. |
| r/ADHD | H4, H1 | Pain-acute audience with strong opinions about infantilizing UI. Documented frustration with cute apps. |
| r/productivity | H4 (negative control) | Skeptic crowd. If they hate gamification that's expected; if they love yours, it's strong signal. |
| r/selfimprovement | H4 (broad pain capture) | High-volume noise floor. Use for listening, not posting. |
| Potential Central (Discord) | H1, H3 | Younger gamer overlap. Test aesthetic + AI trust here. |
| Healthy Gamer | H4, H1 | **Closest audience-fit.** Gamer + self-improvement intersection. Highest priority server. |
| Project EarlyExit | H5 | Smaller, higher-trust. Save for tester recruitment in Week 4. |

### Week 1 — Pure Listening (no posts, no comments)

**Goal:** Build a tag library of how target users actually talk about
self-improvement frustration. Map their vocabulary before you try to
use it.

**Daily (45 min):**
- 15 min in r/getdisciplined: read top 20 posts of the week, copy any
  verbatim quotes about aesthetic, tone, "feels childish," or "I gave
  up because" into your signal log (Section 4)
- 15 min in r/ADHD: same, filter for "app I tried"
- 15 min in Healthy Gamer Discord: read #vent, #advice, copy quotes

**End-of-week deliverable:** 20+ verbatim quotes logged. You should be
able to answer: *what words do these communities use for the pain I'm
trying to solve?* If those words don't include any of yours
(atmospheric / dark / serious / takes me seriously), that's H1's first
warning sign.

**Do not post this week. Reading is the work.**

### Week 2 — Helpful Comments Only

**Goal:** Build a small reputation as someone who gives useful answers.
The shadowban risk dies when your comment history shows real
engagement.

**Daily (45 min):**
- Find 2 questions you can genuinely help with (in any of the 5 subs)
- Write a substantive reply (3+ sentences, specific advice, no
  humble-brag, no signature, no "I'm working on something like this")
- Read 5 more for tag harvesting

**Rules for the comments:**
- No "I'm building..."
- No links of any kind
- No product names
- If asked "what app do you use?" answer honestly with what you
  actually use right now (probably none — say so)

**End-of-week deliverable:** 10 helpful comments, each one defensible
if a moderator audited your account. Comment karma should be net
positive in each sub.

### Week 3 — One Open Question Per Sub (H4 test)

**Goal:** Run H4 (pain acuity). Extract unprompted aesthetic mentions.

Each post is open-ended, value-first, no product hint. Examples to
adapt — do not copy verbatim:

In r/getdisciplined:
> "Honest question for people who've tried and failed at habit apps —
> what was the moment you knew it wasn't going to work? Trying to
> understand why so many of us bounce."

In r/ADHD:
> "ADHD friends — when an app feels 'designed for kids,' does that
> actually make you stop using it, or are you indifferent? Trying to
> figure out if I'm the only one who finds the cute mascot apps
> grating."

In r/gamification:
> "Genuine question — has anyone here actually made a productivity
> gamification system *stick* for themselves long-term? What was the
> mechanic that kept you coming back?"

**One post per sub, no more. Engage substantively with every reply.
Log every reply against H4.**

**End-of-week deliverable:** 4 posts live. ≥30 replies total. Tagged
in your signal log.

### Week 4 — Concept Test Recruitment (H1, H2, H3)

**Goal:** Recruit 8-12 concept testers. This is where the talent tree
MVP test (Section 3) gets put in front of humans.

**Daily (45 min):**
- DM 2-3 people who left high-signal replies in Week 3. Template:
  > "Hey — your reply on the [topic] thread really resonated. I'm
  > doing some informal research with people who've struggled with
  > this exact thing. Would you be up for a 10-minute async exchange
  > where I show you a couple of mockups and ask 4 questions? No
  > product pitch, no signup, no email list. Just trying to understand
  > which of two approaches actually clicks."
- If they say yes, run the concept test from Section 3
- Log each session immediately afterward, before context decays

**Rules:**
- Never DM anyone whose reply you have not engaged with publicly first
- Cap DMs at 3/day to avoid the spam-wave pattern that triggers
  shadowbans
- If you get 5 declines in a row, stop and review whether your DM is
  reading as spammy

**End-of-week deliverable:** 8 concept tests completed and logged.
Sufficient signal to make a Section 5 pivot/proceed/kill decision on
H1, H2, H3.

---

## 3. MVP Test Design — Talent Tree

The right MVP is **not the live app**. The live app introduces sign-up
friction, AI latency, and 47 other features as confounds. You can
validate or kill the talent tree mechanic with two static images and
four questions.

### The Smallest Possible Version

**Two screenshot mockups** — you already have the live UI, take
screenshots, no new build:

1. **Mockup A — Talent Tree:** Screenshot of an existing generated tree
   for one specific goal: *"Run my first marathon in 6 months."* Full
   tree, all 6 tiers, ~15 nodes. Use a real generation, not a hand-made
   one.

2. **Mockup B — Checklist control:** A clean text checklist of the
   *exact same content*, listed flat. Make it look like a clean Notion
   list — not ugly, not pretty. The point is the comparison is
   mechanic-vs-mechanic, not aesthetic-vs-aesthetic. **If you make the
   checklist look ugly, you're cheating.**

(Optional Mockup C: a horizontal milestones-on-a-timeline view, for
testing the tree against a *non-list* alternative as well.)

That's it. No working app, no signup, no Gemini call. Two PNGs.

### Before They See It (baseline expectations)

Ask in this order, capture verbatim:

1. **"What's a real, specific goal you've been trying to make progress
   on lately?"** *(forces them out of generic answers)*
2. **"What have you tried for it so far? What worked, what didn't?"*
   *(captures their prior tooling and frustration)*
3. **"When you imagine the *ideal* tool to help you with this, what
   does it look like?"** *(captures their prior model — you'll measure
   the tree against this, not against nothing)*

**Do NOT mention dark fantasy, talent trees, RPGs, or your product at
this stage.** You are establishing a baseline.

### What To Observe (not what they say — what they DO)

You're not running this in person, so "observe" means watching for
these in async exchange:

- **Time to first reaction.** If they take 30+ seconds before
  responding to the tree image, they're processing. If they reply in 3
  seconds with "yeah looks cool," they're being polite. Slow is more
  honest than fast.
- **Which mockup they ask follow-up questions about.** People
  investigate things they want.
- **"How does it work?" vs "what is it?"** *How* is buying signal.
  *What* is confusion.
- **Whether they ask for higher-res / zoom in.** Engaged users
  investigate.
- **Whether they save it / screenshot it.** Almost no one does this.
  If anyone does, it is a strong signal — log it as such.

### After They See It

Capture verbatim, no leading questions:

1. **"If you had to pick one to actually use for [their goal from
   baseline], which would it be and why?"**
   *(forced choice — H2 vote. The "why" matters more than the pick.)*

2. **"Was there anything about [chosen one] that made it feel like it
   was for you, or not for you?"**
   *(captures aesthetic + ownership signals — H1 + H3)*

3. **"I want to be honest — that tree was generated by AI from a
   one-sentence goal. Does that change how you feel about it?"**
   *(H3 — the trust question. This is the moment of truth.)*

4. **"On a scale of 1-10, how likely are you to actually try a tool
   like this if I sent you a link tomorrow? And — be honest — what
   would have to be true for you to use it for more than a week?"**
   *(H5 + retention frame in one question. This is the single most
   important question. The 1-week framing protects against the "this
   looks cool" trap.)*

### Recruiting Without Being Spammy

Reinforced from Section 2 Week 4:
- Recruit only from people you've publicly helped first
- Frame as **research**, not "test my product" — at this stage it's
  literally true
- 10 minutes max — respect the cap brutally
- Send mockups in the first message, not "let's schedule a call."
  Async-first.
- Send a thank-you afterward and tell them what you learned, even if
  it was that they hated it

### Decision Metrics — Proceed vs Pivot

After 8 completed concept tests:

**Proceed to Phase 2 (build a low-friction landing → tree gen flow) if
ALL of:**
- ≥6/8 picked the tree over the checklist (H2)
- ≥5/8 reacted to "AI generated this" with neutral or positive
  language (H3)
- ≥3/8 gave Q4 score of 7+ AND named a concrete condition you can
  actually deliver on (H5 with substance)
- ≥2/8 spontaneously said something positive about the look without
  being asked (H1 weak signal — strong signal needs the standalone
  H1 test)

**Pivot the mechanic if:**
- <4/8 picked the tree (H2 fails), OR
- ≥5/8 reacted to "AI generated this" with skepticism/distrust
  (H3 fails — most likely outcome)

**Pivot the audience if:**
- ≥6/8 picked the tree but Q4 median is <5
  ("looks cool but I wouldn't actually use it"). You're winning a
  contest you didn't enter — these aren't your buyers.

**Kill the tree-as-core-mechanic if:**
- All of: <4/8 prefer the tree, ≥5/8 distrust AI authorship, AND
  <2/8 give Q4 score ≥7. The product is currently structured around
  the tree. If the tree fails, what you have is a beautifully-built
  dark fantasy *frame* with no fitting *engine*. That is a real,
  recoverable place to be — but only if you face it.

---

## 4. Signal Capture Template

Save this as a template in Obsidian. Every research touch creates one
of these. No exceptions.

```markdown
---
date: YYYY-MM-DD
source: [r/subreddit | discord-server#channel | DM | concept-test]
hypothesis: [H1 | H2 | H3 | H4 | H5]
direction: [supports | challenges | mixed]
strength: [strong | weak]
action: [none | follow-up DM | log only | escalate to kill criteria review]
---

## Quote / paraphrase
> "[exact words if possible — paraphrase only when you couldn't capture verbatim]"

## Pain point
[1 sentence — what is this person actually frustrated by?]

## Why this matters for the hypothesis
[2-3 sentences — why does this specific quote move the needle on H?, in which direction?]

## What I'd want to ask them next
[1 sentence — the follow-up question, even if you don't get to ask it]
```

### Rules for the log

- **One file per signal.** Not one giant list. Atomic notes are
  searchable, sortable, and re-usable.
- **No editorializing in the quote field.** If it didn't come out of
  their mouth, it doesn't go in quotes.
- **File name `signal-YYYY-MM-DD-NN.md`** for sortability.
- **Weekly review (Sunday, ~20 min):** scan the week's signals. Count
  direction × hypothesis. Update Section 5 status if a kill criterion
  is met or close.
- **Strength inflation is the failure mode.** If you mark everything
  "strong," the metric stops working. Default to "weak"; reserve
  "strong" for *unprompted* mentions and *behavioral* evidence
  (they screenshot it, they re-engage on their own, they ask for
  more, they share the link with a friend).

---

## 5. Kill Criteria

These are the lines in the sand. If you hit one, you don't deliberate
— you act. Pre-committing to numbers is the only way to overcome the
sunk-cost reflex on a codebase this large.

All counts assume you've completed Section 2 + Section 3
(4 weeks of community work + 8+ concept tests).

### Pivot the Aesthetic — dark fantasy isn't resonating

**Trigger if any 2 of:**
- H1 standalone aesthetic test: <30% pick the dark fantasy hero out of
  30+ votes
- Across 50+ Week 3 H4-question replies: <3 unprompted mentions of
  aesthetic, tone, "feels childish," or anything in your vocabulary
  cluster
- In concept tests: <2/8 spontaneously say something positive about
  the look without being asked

**Action:** Stop building visual identity. The current landing page is
doing the heavy lifting; do not invest more cycles there. Spend a week
prototyping a **neutral / minimalist** version of the same talent tree
concept and run it through the same H1-H3 tests. If the neutral
version converts higher, dark fantasy was a personal preference, not a
market.

**Important:** This does not mean burning the existing visual work.
It means *stop adding to it* until you know it earns its keep.

### Pivot the Mechanic — talent trees aren't engaging

**Trigger if any of:**
- <4/8 concept tests prefer the tree to the checklist (H2 fails), OR
- ≥6/8 prefer the tree but median Q4 score is <5, OR
- After Phase 2 launches: weekly retention <20% after week 1
  (8/10 testers drop off after their first session)

**Action:** The product currently has *one* core mechanic and a lot of
supporting systems built around it (XP, levels, achievements,
dungeons, hearth, embers). If the tree fails, those systems are
stranded. Two paths:

1. **Re-host the supporting systems on a different core mechanic.** A
   daily-quest-driven app with the same dark fantasy frame is
   technically much closer than it feels — you already have the
   `daily_quests` table, the streak system, and the hero/level loop.
2. **Stop and reconsider.** "Beautiful frame around the wrong engine"
   is a real failure mode. Better to face it now than after Sprint G.

### Pivot the Audience — self-improvement crowd isn't right

**Trigger if all of:**
- After 4 weeks of community engagement, you have <5 concept testers
  willing to engage despite running the plan as written
- The responses you do get cluster around indifference rather than
  strong-positive or strong-negative
- The H4 pain question gets <10 substantive replies across 4 weeks of
  posting

**Action:** Indifference is the worst signal — it means there's no
*there* there. Try one of:
- **Gamer-first communities** (r/IndieDev, r/patientgamers, gaming
  Discords) instead of self-improvement-first. Your aesthetic is
  gamer; lead with that audience.
- **ADHD-only.** r/ADHD has documented frustration with infantilizing
  apps and high tolerance for novelty mechanics. Niching down is
  usually right when broad fails.
- **The "I quit Habitica because it was too cute" person specifically.**
  This is your proxy for product-market fit. If you can't find that
  person in 4 subs over 4 weeks, the segment may be too small.

### Proceed With Confidence to Phase 2

**ALL of the following must hold:**
- H1: ≥50% of standalone aesthetic-test voters pick dark fantasy AND
  ≥3 unprompted "this is for adults / takes me seriously" mentions
- H2: ≥6/8 concept testers pick the tree over the checklist with
  substantive reasons (not pure aesthetic)
- H3: ≥5/8 react to "AI generated this" without skepticism
- H4: ≥10 unprompted aesthetic/tone mentions across Week 3 H4 posts
- H5: ≥4/10 invited Phase 2 testers actually click and sign up within
  48 hours
- **You have not had to revise these criteria downward to make them
  pass.** (Watch for this — it is the most insidious failure mode in
  Lean Startup. If you find yourself softening a number to keep going,
  that *is* the kill signal.)

**Action:** Build the smallest possible Phase 2 — a public landing →
goal input → tree → first node complete. Cut Hearth, Embers, Dungeon,
Inventory, Achievements, Leaderboard, Hero levels, Hero titles, Hero
profile from the funnel. They are not *removed from the codebase* —
they are removed from the *new user's first 10 minutes*. The dashboard
you just edited (Dungeon hidden, Hearth hidden) is the right model.
**Hide more.**

The next thing to ship is not a feature. It is a *funnel* — the
shortest possible path from "stranger sees Duskvow" to "stranger has
used the talent tree."

---

## Appendix — What This Plan Is NOT Doing (And Why)

**Not running A/B tests.** You have zero traffic. A/B tests need
thousands of users to detect anything. Do qualitative work with 8
people. Quantitative is a Phase 2+ tool.

**Not running paid ads.** Ads test landing pages, not concepts. You
don't yet know what concept you're testing.

**Not building a waitlist landing page yet.** Tempting because it's
measurable, but it tests *promise resonance*, not *product
resonance*. Wait until Section 5's "proceed" criteria are met.

**Not assuming this plan is right.** Re-read this document at the end
of Week 2. If anything in it now feels wrong because of what you
learned, **edit the document.** The plan is a living artifact.

---

## The Last Hard Truth

The best research plan in the world doesn't matter if you keep building
features in parallel "just to keep momentum." The discipline this plan
demands is **not building anything new for 4 weeks except the two PNGs
in Section 3.** Bug fixes are fine. Visual polish on the existing
landing page is fine. New features — including all of Sprint E, F, G
in `STRATEGY.md` — go on hold until Section 5 says proceed.

If you can't hold that line, no plan works. The codebase does not need
to be richer. The codebase needs to meet a real human and survive the
encounter.

---

> Last updated: 2026-04-15 — initial version. Review and edit
> 2026-04-22 (end of Week 1).
