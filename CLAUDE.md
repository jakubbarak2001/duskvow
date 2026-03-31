# CLAUDE.md — Duskvow Project Configuration
> ⚠️ READ STATE.md BEFORE WRITING ANY CODE. Update Layer 3 before ending session.
## Project Overview

**Duskvow** is a dark fantasy AI-powered self-improvement app that generates RPG-style talent trees from user goals.

- **Frontend**: React (Next.js 14+ App Router) with TypeScript
- **Backend**: Python FastAPI with Pydantic v2 + SQLModel
- **Database**: Supabase (PostgreSQL + Auth + Row Level Security)
- **AI**: Google Gemini API (gemini-2.0-flash for speed, gemini-2.5-pro for quality)
- **Skill Tree Rendering**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS with custom dark fantasy design tokens
- **Hosting**: Vercel (frontend) + Railway (backend)

## Architecture

```
duskvow/
├── frontend/              # Next.js React app
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   │   ├── tree/      # Skill tree components (nodes, edges, controls)
│   │   │   ├── ui/        # Shared UI components
│   │   │   └── layout/    # Layout components (nav, footer, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions, API client, constants
│   │   ├── stores/        # Zustand state stores
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   ├── tailwind.config.ts
│   └── package.json
├── backend/               # FastAPI Python app
│   ├── app/
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── api/           # API route handlers
│   │   │   └── v1/        # Versioned API routes
│   │   ├── core/          # Config, security, dependencies
│   │   ├── models/        # SQLModel database models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic (AI generation, tree logic)
│   │   └── prompts/       # AI prompt templates (Jinja2 or plain text)
│   ├── tests/             # pytest test files
│   ├── requirements.txt
│   └── pyproject.toml
├── supabase/              # Supabase config and migrations
│   └── migrations/
├── CLAUDE.md              # This file
├── SPEC.md                # Detailed technical specification
└── README.md
```

## Coding Standards

### Python (Backend)
- Python 3.11+
- Use type hints on ALL function signatures
- Use Pydantic v2 for all request/response schemas
- Use SQLModel for database models (combines SQLAlchemy + Pydantic)
- Use `async def` for all route handlers and database operations
- Use dependency injection via FastAPI's `Depends()`
- Error handling: raise `HTTPException` with meaningful detail messages
- Naming: snake_case for functions/variables, PascalCase for classes
- Docstrings: Google style on all public functions
- Tests: pytest with async support via `pytest-asyncio`

### TypeScript (Frontend)
- Strict TypeScript — no `any` types unless absolutely necessary
- React functional components only — no class components
- Use named exports, not default exports
- Custom hooks must start with `use` prefix
- Zustand for global state — no prop drilling past 2 levels
- All API calls go through a centralized API client in `lib/api.ts`
- Error boundaries around major UI sections
- Naming: camelCase for functions/variables, PascalCase for components

### Tailwind & Styling
- Use CSS custom properties (variables) for all theme colors — defined in `globals.css`
- NEVER use arbitrary hex values inline — always reference design tokens
- Dark mode is the ONLY mode — no light mode toggle needed
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- Font stack: Cinzel (headings), Inter (body text)

## Design Tokens (Dark Fantasy Theme)

```css
/* Surface layers — midnight-tinted, NOT pure black */
--bg-abyss: #0A0A12;
--bg-shadow: #12121A;
--bg-surface: #1A1A24;
--bg-elevated: #242430;
--bg-highlight: #2E2E3A;

/* Text — warm parchment tones, NOT pure white */
--text-primary: #E0D8C8;
--text-secondary: #A09888;
--text-muted: #6B6358;

/* Accent colors */
--accent-ember: #C84B11;
--accent-gold: #FFD700;
--accent-blood: #8B0000;

/* Rarity progression (for node tiers) */
--rarity-common: #808080;
--rarity-uncommon: #4CAF50;
--rarity-rare: #4BB2F9;
--rarity-epic: #9C27B0;
--rarity-legendary: #FF8C00;
--rarity-mythic: #FFD700;

/* State colors */
--state-locked: rgba(128, 128, 128, 0.4);
--state-available: #4BB2F9;
--state-progress: #FF8C00;
--state-complete: #FFD700;
```

## Skill Tree Node System

### Node Types (shape-coded)
- **Circle**: Habit/passive nodes (daily/recurring tasks)
- **Square**: Action nodes (one-time tasks)
- **Diamond**: Choice nodes (user picks one branch)
- **Hexagon**: Keystone/capstone goals (major milestones)

### Node States
1. **Locked**: Greyed out, 40% opacity, muted border
2. **Available**: Subtle pulse animation (CSS keyframe, 2-3s cycle), colored border
3. **In Progress**: Partially filling ring animation
4. **Completed**: Full color, golden border, brief particle burst

### Node Data Model
```typescript
interface SkillNode {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'action' | 'choice' | 'keystone';
  tier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  state: 'locked' | 'available' | 'in_progress' | 'completed';
  position: { x: number; y: number };
  prerequisites: string[];  // IDs of required parent nodes
  optional: boolean;        // Can be skipped without blocking progress
  xp_reward: number;
  estimated_time?: string;  // e.g., "2 hours", "1 week"
}
```

## AI Integration Rules

- AI generates talent trees as structured JSON matching the `SkillNode` schema
- Use structured output / JSON mode — NEVER parse free-text AI responses
- Every AI call must have a timeout (30 seconds max)
- Cache common tree templates (fitness, coding, business, language learning)
- Rate limit: free users get 2 AI generations per day
- AI follow-up questions use a multi-step conversation flow, NOT a single prompt
- All AI prompts live in `backend/app/prompts/` as templates
- NEVER hardcode prompts in route handlers

## API Design

- REST API with versioned routes: `/api/v1/...`
- Authentication via Supabase JWT tokens in `Authorization: Bearer <token>` header
- All endpoints return consistent shape: `{ "data": ..., "error": null }` or `{ "data": null, "error": { "message": "...", "code": "..." } }`
- Pagination: cursor-based, not offset
- Rate limiting: per-user, tracked server-side

## Git Conventions

- Commit messages: `type(scope): description` (e.g., `feat(tree): add node completion animation`)
- Types: feat, fix, refactor, style, test, docs, chore
- Branch naming: `feature/description`, `fix/description`
- NEVER commit .env files, API keys, or secrets

## Common Pitfalls to Avoid

- Do NOT use `localStorage` — use Zustand stores that persist to Supabase
- Do NOT use pure black (#000000) backgrounds — use --bg-abyss (#0A0A12)
- Do NOT use pure white (#FFFFFF) text — use --text-primary (#E0D8C8)
- Do NOT build a light mode — this is dark-only by design
- Do NOT add features not in the current sprint — ask before expanding scope
- Do NOT use `console.log` in production code — use a proper logger
- Do NOT inline styles — use Tailwind classes or CSS custom properties
- Do NOT use relative imports that go up more than 2 levels — use path aliases (@/)

## Supabase CLI (available in terminal)
- NEVER ask the user to open the Supabase dashboard
- Create migrations: `npx supabase migration new <name>`
- Push to remote: `npx supabase db push`
- Raw SQL: `npx supabase db execute --sql "<query>"`
- Check status: `npx supabase migration list`
- All migrations live in `supabase/migrations/`