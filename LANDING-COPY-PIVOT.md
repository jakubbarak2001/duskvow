# Landing Copy Pivot — Hero Rewrite Options

**Date:** 2026-04-16
**Status:** Options for review (no code edits yet)
**Scope:** Hero `<h1>`, hero subheadline, and the CTA micro-copy note under the primary button in `frontend/src/app/page.tsx`.

## Why we're rewriting

H1-aesthetic testing (BML-PLAN.md, 30 signals across r/UI_Design, Healthy Gamer Discord, r/ProductivityApps) showed the dark-fantasy framing underperforms at first contact. The praise came back around cute and warm framings: *"feels hopeful and warm. Like they do really want me to get better."* Zero quit reasons cited aesthetic; every churn signal was structural.

So the aesthetic stays — it's our wrapper — but it stops being the pitch. The pitch becomes the **mechanic** (AI turns your goal into a personal talent tree) and the **voice** softens from detached-atmospheric-grit to *dark fantasy with a caring guide* — Tristram's hub, Melina at the bonfire, Deckard Cain telling you to stay awhile and listen.

The copy below leads with the mechanic, drops the anti-mascot snark, and leaves room for a guide to walk beside the user.

---

## Headline options

Constraints honored: one short sentence, on-brand vocabulary (*path, guide, forge, ember, vow*), no attacks on cute/minimalist, no banned words (*climb, no hand-holding, pixel art, mascots*).

### H-A. "Speak Your Goal. We'll Forge the Path."

Two beats. Active and collaborative — the *"we'll"* does the emotional work of positioning Duskvow as the guide, not the drill sergeant. Three on-brand words in eight (speak, forge, path). Lets the subheadline carry the mechanic details.

### H-B. "Your Goal, Forged Into a Talent Tree."

Pure mechanic-forward. Shortest path to "this is what the product does." *Forged* keeps the dark-fantasy texture without leaning on it. Best for skeptical first-time visitors who bounced on the abstract previous h1.

### H-C. "A Talent Tree, Forged From Your Vow."

Mechanic + two on-brand words (*forge, vow*) in six. Treats the product as an artifact the visitor earns by committing. Atmospheric without being cold. Weakness: *vow* is a Duskvow-specific term a cold visitor hasn't been taught yet.

### H-D. "Every Goal Deserves a Path. Let's Forge Yours."

Invitational and warm. *"Let's"* carries the mentor voice; *"every goal deserves"* signals you're not being judged for the goal you picked. Slightly generic on line one, but line two rescues it with on-brand verbs.

### H-E. "One Vow. One Tree. The Path Forward."

Rhythmic, committal. Echoes the existing final-CTA cadence ("Free. No trials. No tricks. One goal, one tree, one path forward."), so the page feels self-consistent. Lets the subhead explain what a *tree* is.

---

## Subheadline options

One to two sentences. Job: explain the mechanic and seed the *"you're not alone"* emotional beat that replaces the previous *"just you and the climb."*

### S-1. "Your goal becomes a tree. The tree becomes a path. You walk it node by node — and you don't walk it alone."

Mechanic in three beats, emotional turn in the fourth. The *"you don't walk it alone"* directly inverts the old *"just you and the climb"* without naming it. Pairs naturally with H-A or H-E.

### S-2. "Duskvow turns your ambition into a living talent tree — habits, actions, and keystones forged from your own words, with a guide to walk beside you when the path gets dark."

Longest, richest. Names the node types (habit/action/keystone) so the mechanic is concrete on first read. Closes on the guide explicitly. Pairs with H-B or H-D.

### S-3. "Tell Duskvow what you're chasing. We'll forge it into a talent tree — interconnected skills to complete at your pace, with someone tending the ember alongside you."

Conversational. *"At your pace"* is the load-bearing warmth — it answers the anxious visitor's unspoken question about whether this app will shame them. Pairs with H-A or H-D.

---

## CTA micro-copy (the note under the primary button)

Button text stays **MAKE YOUR VOW**. We're only rewriting the small note beneath it (currently *"No credit card. No pixel penguins. Just purpose."*).

### M-1. "No credit card. Start in 60 seconds. Walk at your own pace."

Concrete trust signal (60s) + permission to go slow. No attacks. Best for the anxious visitor the old line was pushing away.

### M-2. "Free to begin. No card needed. The path waits for you."

Softer, more atmospheric. *"The path waits for you"* is the Melina-at-the-bonfire note — patient, not pushy. Slightly less sharp on the trust signals.

### M-3. "Free. No card. No rush. Your path, your pace."

Shortest. Four micro-phrases, each one a reassurance. Good if the headline and subhead are already doing the emotional lift and the note just needs to close the deal.

---

## Recommended combination

> **H-A + S-1 + M-1**
> *"Speak Your Goal. We'll Forge the Path."*
> *"Your goal becomes a tree. The tree becomes a path. You walk it node by node — and you don't walk it alone."*
> *"No credit card. Start in 60 seconds. Walk at your own pace."*

The headline compresses the mentor voice into its essence — *speak* invites a conversation, *we'll forge* positions Duskvow as the collaborator at the anvil, and *the path* promises a route, not a cliff. It intentionally hides the word "tree" so the subheadline gets to do the mechanic reveal, which lands with more weight when it arrives in its own sentence. The subhead then triples down: the mechanic in two short clauses, the pacing cue (*node by node*) for the visitor who's worried about overwhelm, and the emotional inversion of the old pitch (*you don't walk it alone*) to close the gap that the research flagged. The micro-copy keeps the trust-signal job the old line was doing (free, fast, no card) but trades the anti-mascot jab for explicit permission to go slow — which is the single phrase every anxious first-time visitor in the research was looking for and not finding.

---

## Final locked decision (2026-04-16)

Reviewer picked **H-A + lightly-edited S-1 + shortened M-1**, with two edits to the original recommendation:

1. **Subheadline**: *"node by node"* → *"at your own pace"*. Reason: *"node"* is internal vocabulary; users don't think in nodes. Save the word for inside the app where it's contextually grounded.
2. **Micro-copy**: dropped *"Walk at your own pace"* since the phrase now lives in the subheadline. Keeps the micro-copy to two clean trust signals.

Also flagged: *"forge"* was becoming load-bearing across the option set. Locking it to the headline only; the subheadline and micro-copy do not use it.

**Final copy (now live in `frontend/src/app/page.tsx`):**

> **Speak Your Goal. We'll Forge the Path.**
>
> Your goal becomes a tree. The tree becomes a path. You walk it at your own pace — and you don't walk it alone.
>
> *No credit card. Start in 60 seconds.*

Button text unchanged: **MAKE YOUR VOW — FREE**.
Visual identity (background art, colors, typography, anti-section, Rite steps, final CTA) unchanged.
