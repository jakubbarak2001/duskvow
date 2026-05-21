# Duskvow

> **Self-improvement, reforged.** Speak your goal — an AI forges it into a dark-fantasy talent tree you walk at your own pace.

![Duskvow landing page](docs/screenshots/landing.png)

---

## What it is

Duskvow is a full-stack experiment in making self-improvement feel like *Dark Souls*, not a spreadsheet. Most habit apps look like Excel. Duskvow looks like a grimoire.

You type a goal in plain English ("prepare for my ML interview", "learn to draw faces", "finish my thesis"). Google Gemini parses it into a hierarchical **talent tree** of 15–25 skill nodes across six tiers, each with XP, estimated time, and a short flavored description. You then "walk" the tree — completing nodes unlocks downstream ones, earning XP, leveling your hero, and shifting your weekly leaderboard rank.

The vibe is intentional: a vow is heavier than a task, a path is more committal than a checklist, and a tree of glowing skill nodes is more motivating than a flat to-do list.

## How it works

![Talent tree view](docs/screenshots/tree-view.png)

1. **Make a vow.** A short wizard collects your goal and a few clarifying answers (current level, time available, deadline).
2. **The forge.** The backend wraps your input in a tightly-constrained Jinja prompt and calls **Gemini 2.5 Pro**. The response is a JSON tree: 15–25 nodes, six tiers (Foundations → Rites → Mastery → Ascension → …), each tagged with a shape (habit / action / choice / keystone), rarity (common → mythic), XP reward, and estimated minutes.
3. **Layout & validation.** The AI output is validated against a Pydantic schema, clamped (XP, node count, length caps) to prevent prompt-injection inflation, then laid out by **Dagre** so the tree always looks clean — the AI doesn't get to pick positions.
4. **Walk the tree.** The frontend renders the tree with React Flow on a hand-painted parchment background. Locked nodes are dimmed; available ones pulse; completed ones turn gold. Clicking a node opens a side panel — clicking *Complete* fires an optimistic Zustand update (<300ms feedback) and a backend PATCH.
5. **Progression layer.** XP feeds a global hero level, a daily streak (with multiplier), a weekly leaderboard, and an achievement / inventory system. Mobile gets a thumb-friendly bottom-sheet variant of the same flow.

## Gallery

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/dashboard.png" alt="Hub dashboard with active vow progress"><br/><em>Hub — active vow with progress, step count, walked-percent</em></td>
    <td width="50%"><img src="docs/screenshots/tree-full.png" alt="Full six-tier talent tree"><br/><em>A full tree — six tiers from First Steps to Ascension</em></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/profile.png" alt="Hero profile with stats and achievements"><br/><em>Hero profile — level ring, XP bar, streak, achievement grid</em></td>
    <td width="50%"><img src="docs/screenshots/node-icons.png" alt="Close-up of hand-painted node icons"><br/><em>Hand-painted node icons on the locked 12-color palette</em></td>
  </tr>
</table>

## Key features

- **AI-forged talent trees** — Gemini 2.5 Pro, validated and rarity-clamped, with a fast 2.0-flash fallback path for shorter prompts.
- **Six-tier dagre layout** — deterministic, no overlap, no AI position drift.
- **Optimistic node completion** — Zustand store updates immediately, reverts on API failure.
- **Hand-painted aesthetic** — Krita-painted node icons on a 12-color locked palette, Cinzel + Crimson Pro typography, no pure black/white anywhere.
- **Progression system** — hero level + title, weekly XP leaderboard, daily streak multiplier, achievements, inventory.
- **Rate-limited generation** — 2 trees / day on the free tier, enforced server-side.
- **Mobile-first** — responsive tree canvas, node detail bottom sheet, hamburger nav.
- **GDPR-compliant** — cookie consent gate, account deletion (Art. 17), data export (Art. 20).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript strict, Tailwind v4, Zustand, React Flow (`@xyflow/react`), Dagre |
| Backend | Python 3.11+, FastAPI, Pydantic v2, async everywhere |
| Database | Supabase Postgres + Row-Level Security + Auth |
| AI | Google Gemini 2.5 Pro (quality) / 2.0 Flash (fast path) |
| Hosting | Vercel (frontend) + Railway (backend) |

## Architecture

```
frontend/src/
  app/            Next.js routes (landing, /vows, /tree, /profile, /leaderboard, /dungeon)
  components/     tree/, ui/, layout/, tree-wizard/, auth/
  hooks/          React hooks (auth, tree-store binding, mobile detection)
  lib/            api.ts (all backend calls), supabase.ts (browser client)
  stores/         Zustand stores (tree, progression)
  types/          Shared TS types

backend/app/
  api/v1/         FastAPI routers (trees, nodes, profile, leaderboard, quests, dungeon, export)
  core/           Config, auth dependency, error handling
  schemas/        Pydantic v2 request/response models
  services/       Gemini client, Supabase admin client, business logic
  prompts/        Jinja2 templates for AI calls
  data/           Static JSON (dungeon pools, achievement catalog)

supabase/migrations/  Versioned SQL with RLS policies + atomic RPCs
```

## Notable engineering decisions

- **PostgREST is the threat surface, not FastAPI.** Because Supabase exposes the DB directly to authenticated browsers, the security model relies on RLS, not on FastAPI being a chokepoint. All progression tables have their user-writable UPDATE policies *dropped*, and every `SECURITY DEFINER` RPC is REVOKE'd from `PUBLIC` / `authenticated` — the backend writes via `service_role` only. See `supabase/migrations/20260416_security_hardening.sql` and `SECURITY_AUDIT_2026-04-16.md`.
- **AI output is never trusted.** Tier→XP mapping is canonical (prompt-injection can't inflate rewards), node counts are clamped to 15–25, title/description lengths are bounded, and the whole response is Pydantic-validated before it touches the database.
- **Atomic Postgres RPCs for XP / streak / daily generation.** No read-modify-write from the backend — increments are RPCs so concurrent requests can't double-count.
- **Layout is deterministic.** Dagre owns positions; the AI only owns content. Early versions let the AI place nodes and they overlapped constantly.
- **The dungeon is template-based, not AI-generated.** Combat events, monster pools, and loot tables are curated JSON. Randomness is weighted selection, not generation — zero API cost per focus session and instant starts.

## Running locally

> You'll need your own Supabase project and a Google AI Studio key for Gemini. Both have free tiers that are plenty for local development.

```bash
# 1. Frontend
cd frontend
cp .env.example .env.local        # fill in NEXT_PUBLIC_SUPABASE_URL, _ANON_KEY, NEXT_PUBLIC_API_URL
npm install
npm run dev                       # http://localhost:3000

# 2. Backend
cd backend
cp .env.example .env              # fill in SUPABASE_URL, _SERVICE_ROLE_KEY, _JWT_SECRET, GEMINI_API_KEY
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload     # http://localhost:8000

# 3. Database
npx supabase db push              # applies all migrations to your project
```

## License

Code is MIT-licensed — see [LICENSE](LICENSE). Hand-painted node assets in `frontend/public/images/nodes/` and other original artwork are © Jakub Barak, all rights reserved.

## Credits

- Built by [@jakubbarak2001](https://github.com/jakubbarak2001).
- Node icons hand-painted in Krita on a locked 12-color palette.
- Engineered with assistance from Claude Code.
</content>
</invoke>
