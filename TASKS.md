# TASKS.md — Duskvow Task Queue

> **Purpose**: Ordered list of tasks for Claude Code to execute.
> Each task has specs tight enough to run without human supervision.
> Claude reads STATE.md first, then picks up the next `QUEUED` task.
>
> **Status values**: `QUEUED` → `IN_PROGRESS` → `DONE` / `FAILED`
> **Rule**: Execute tasks in order. Do NOT skip ahead. Run `npm run validate` after each.

---

## Upcoming Tasks

> No tasks currently queued. Add the next sprint here.

---

## Blocked / Needs Decision

### TASK 2C-1: WoW-Style Tree Grid Layout
**Status**: `BLOCKED` — needs design decision
- Current layout is Dagre auto-layout (left-to-right). WoW trees are top-down grid with fixed columns. Switch completely or keep Dagre as fallback?
- WoW has 3 separate talent panels. Multiple panels per tree, or keep single tree?
- Node shapes: keep circle/square/diamond/hexagon per type, or go uniform square icons like WoW?
- What background treatment for the tree panel?

### TASK 2C-2: Node Icon Image Generation Research
**Status**: `BLOCKED` — needs research/budget decision
- Budget per tree gen is currently ~$0.01 (Gemini only). Adding 20-30 image gens could add $0.20–$2.00+.
- Speed: image gen could push tree creation from 30s to 5-10 minutes. Acceptable?
- Style consistency approach: LoRA fine-tuning, style prompt engineering, or pre-generated icon library?
- Provider options: Flux, DALL-E 3, Replicate SD, or hybrid pre-generated library.

### TASK 2C-3: Tree Background Generation
**Status**: `BLOCKED` — depends on 2C-2 results

---

## Completed Tasks

| Task | Description | Completed |
|------|-------------|-----------|
| 2A-1 | Auth Page Visual Refactor | 2026-03-31 |
| 2A-2 | Tree Wizard Visual Refactor | 2026-03-31 |
| 2A-3 | Dashboard Visual Refactor | 2026-03-31 |
| 2A-4 | Follow-Up "Something Else" Freetext Option | 2026-03-31 |
| 2B-1 | Google OAuth Implementation | 2026-03-31 |
| 3A-1 | Remove Nodes Done Stat from Dashboard | 2026-04-02 |
| 3B-1 | Ember Database Table & API Endpoints | 2026-04-02 |
| 3B-2 | Frontend API Client & Types for Embers | 2026-04-02 |
| 3B-3 | Brazier Component — Visual Container | 2026-04-02 |
| 3B-4 | Add Ember Form & Drop Animation | 2026-04-02 |
| 3B-5 | Brazier Integration — Dashboard + API Wiring | 2026-04-02 |
| P1-1 | Hub Page — Layout & Atmosphere | 2026-04-02 |
| P1-2 | Vow Chamber Page — Tree List Migration | 2026-04-02 |
| P1-3 | Hub Door Active State — Live Data on Vow Chamber | 2026-04-02 |
| P1-4 | Update Auth Redirect & Navigation Flow | 2026-04-02 |
| P1-5 | Move Brazier to Hearth Placeholder | 2026-04-02 |
| 2B-1 | Asset Optimization (dashboard assets) | 2026-04-02 |
| 2B-2 | Dashboard Page Background | 2026-04-02 |
| 2B-3 | Card Component — Texture & Styling | 2026-04-02 |
| 2B-4 | Card Icon — Vow Chamber (Anvil Video) | 2026-04-02 |
| 2B-5 | Card Icon — The Hearth (Brazier) | 2026-04-02 |
| 2B-6 | Card Icon — The Dungeon (Sealed Door) | 2026-04-02 |
| 2B-7 | Typography & Label Polish | 2026-04-02 |
| 2B-8 | Performance Validation | 2026-04-02 |
| 4A-1 | Dashboard Card Polish — Image Sizes & Dungeon CTA | 2026-04-05 |
| 4A-2 | Dungeon Page Scaffold — Layout, Background & Navigation | 2026-04-05 |
| 4A-3 | Dungeon Timer Engine — Pomodoro Logic | 2026-04-05 |
| 4A-4 | Dungeon Timer UI — Dark Fantasy Interface | 2026-04-05 |
| 4A-5 | Dungeon Polish & Validation | 2026-04-05 |
