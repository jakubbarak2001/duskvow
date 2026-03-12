# SPEC.md — Duskvow MVP Technical Specification

## MVP Scope (Sprint 1 — "The First Vow")

Build the core loop ONLY. A user can: sign up → enter a goal → get an AI-generated talent tree → view the tree → complete nodes → see progress. Nothing else.

### What IS in the MVP
- User authentication (Supabase email/password + Google OAuth)
- Goal input form with AI follow-up questions (2-3 questions max)
- AI-generated talent tree (20-30 nodes per tree)
- Interactive talent tree visualization (zoom, pan, click nodes)
- Node completion (mark nodes done, earn XP)
- Basic progress tracking (XP counter, nodes completed/total)
- Daily streak counter
- ONE active tree per user (free tier)
- Dark fantasy UI theme
- Responsive design (mobile + desktop)

### What is NOT in the MVP
- Social features (sharing, leaderboards, friends)
- Multiple trees per user
- Tree editing/customization by user
- Avatars or character systems
- Achievement badges
- Payment/subscription system
- Push notifications
- Native mobile app
- Admin dashboard

---

## Database Schema (Supabase/PostgreSQL)

### Table: users
Extends Supabase auth.users automatically.
```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Table: talent_trees
```sql
CREATE TABLE public.talent_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_prompt TEXT NOT NULL,          -- Original user input
    ai_context JSONB,                   -- Follow-up Q&A context
    total_nodes INTEGER DEFAULT 0,
    completed_nodes INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    earned_xp INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.talent_trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own trees" ON public.talent_trees
    FOR ALL USING (auth.uid() = user_id);
```

### Table: skill_nodes
```sql
CREATE TABLE public.skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES public.talent_trees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('habit', 'action', 'choice', 'keystone')),
    tier TEXT NOT NULL CHECK (tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    state TEXT DEFAULT 'locked' CHECK (state IN ('locked', 'available', 'in_progress', 'completed')),
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL,
    prerequisites UUID[] DEFAULT '{}',  -- Array of node IDs
    is_optional BOOLEAN DEFAULT FALSE,
    xp_reward INTEGER DEFAULT 10,
    estimated_time TEXT,
    sort_order INTEGER DEFAULT 0,       -- For display ordering
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own nodes" ON public.skill_nodes
    FOR ALL USING (
        tree_id IN (SELECT id FROM public.talent_trees WHERE user_id = auth.uid())
    );
```

### Table: daily_activity
```sql
CREATE TABLE public.daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    nodes_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, activity_date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own activity" ON public.daily_activity
    FOR ALL USING (auth.uid() = user_id);
```

---

## API Endpoints

### Authentication (handled by Supabase client SDK)
- `POST /auth/signup` — Supabase handles this
- `POST /auth/signin` — Supabase handles this
- `POST /auth/signout` — Supabase handles this

### Trees
```
POST   /api/v1/trees/generate     — Start AI tree generation (accepts goal_prompt)
POST   /api/v1/trees/followup     — Submit answers to AI follow-up questions
GET    /api/v1/trees               — List user's trees
GET    /api/v1/trees/{tree_id}     — Get tree with all nodes
DELETE /api/v1/trees/{tree_id}     — Delete a tree
```

### Nodes
```
PATCH  /api/v1/nodes/{node_id}/complete    — Mark node as completed
PATCH  /api/v1/nodes/{node_id}/start       — Mark node as in_progress
PATCH  /api/v1/nodes/{node_id}/reset       — Reset node to available
```

### Profile
```
GET    /api/v1/profile             — Get current user profile + stats
```

---

## AI Tree Generation Flow

### Step 1: User Input
User enters a goal prompt. Examples:
- "I want to learn Python programming"
- "I want to start a side business"
- "I want to run a marathon"

### Step 2: AI Follow-up Questions (2-3 questions)
The AI asks clarifying questions to personalize the tree:
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What's your current experience level?",
      "options": ["Complete beginner", "Some basics", "Intermediate", "Advanced"]
    },
    {
      "id": "q2",
      "text": "What's your target timeline?",
      "options": ["1 month", "3 months", "6 months", "No deadline"]
    },
    {
      "id": "q3",
      "text": "How much time can you dedicate daily?",
      "options": ["15-30 min", "30-60 min", "1-2 hours", "2+ hours"]
    }
  ]
}
```

### Step 3: AI Generates Tree JSON
The AI returns a structured JSON talent tree:
```json
{
  "title": "Python Mastery",
  "description": "From zero to confident Python developer in 3 months",
  "nodes": [
    {
      "id": "node_1",
      "title": "Install Python & VS Code",
      "description": "Set up your development environment with Python 3.11+ and VS Code with the Python extension.",
      "type": "action",
      "tier": "common",
      "prerequisites": [],
      "optional": false,
      "xp_reward": 10,
      "estimated_time": "30 minutes",
      "position": { "x": 400, "y": 50 }
    }
  ],
  "edges": [
    { "from": "node_1", "to": "node_2" },
    { "from": "node_1", "to": "node_3" }
  ]
}
```

### AI Prompt Strategy
- Use system prompt to define the persona and output format
- Use JSON mode / structured output to guarantee valid JSON
- Include examples of good trees in the prompt (few-shot)
- Position nodes in a top-down tree layout (root at top, branches spread down)
- Tier assignment: first 3-5 nodes = common, middle nodes = uncommon/rare, last 3-5 = epic/legendary, final node = mythic
- Keystone node is always the final capstone goal
- Mix node types: ~40% action, ~30% habit, ~20% choice, ~10% keystone

---

## Frontend Pages

### / (Landing page — unauthenticated)
- Hero section with animated talent tree preview
- "Enter your goal" CTA input
- "Sign up to save your tree" prompt
- Dark fantasy aesthetic

### /auth (Login/Signup)
- Supabase Auth UI component
- Email/password + Google OAuth
- Redirect to /dashboard after auth

### /dashboard (Main app — authenticated)
- Current tree display (or "Create your first tree" CTA)
- Stats bar: Total XP, Current Streak, Nodes Completed
- Quick actions: Continue tree, Create new tree

### /tree/{id} (Tree viewer — authenticated)
- Full-screen interactive talent tree (React Flow canvas)
- Node detail panel (slides in from right on node click)
- Progress bar at top
- XP counter

### /tree/new (Tree creation wizard — authenticated)
- Step 1: Enter your goal (text input)
- Step 2: Answer AI follow-up questions (multiple choice)
- Step 3: Loading animation while AI generates
- Step 4: Tree reveal with animation
- Redirect to /tree/{id}

---

## Component Hierarchy

```
App
├── LandingPage
│   ├── HeroSection
│   ├── TreePreview (static demo tree)
│   └── CTASection
├── AuthPage
│   └── SupabaseAuthUI
├── DashboardPage
│   ├── StatsBar (XP, Streak, Progress)
│   ├── ActiveTree (mini preview)
│   └── CreateTreeCTA
├── TreeViewPage
│   ├── TreeCanvas (React Flow wrapper)
│   │   ├── SkillNodeComponent (custom React Flow node)
│   │   └── SkillEdgeComponent (custom React Flow edge)
│   ├── NodeDetailPanel
│   │   ├── NodeInfo
│   │   └── CompleteButton
│   └── TreeProgressBar
└── TreeCreationWizard
    ├── GoalInputStep
    ├── FollowUpQuestionsStep
    ├── GeneratingStep (loading animation)
    └── TreeRevealStep
```

---

## Task Breakdown for Claude Code (ordered by priority)

### Task 1: Project Scaffolding
Set up Next.js frontend and FastAPI backend with all dependencies.
- Initialize Next.js 14 with TypeScript, Tailwind, App Router
- Initialize FastAPI with uvicorn, pydantic, sqlmodel
- Configure Tailwind with dark fantasy design tokens from CLAUDE.md
- Set up path aliases (@/ for imports)
- Create placeholder pages for all routes
- Configure ESLint + Prettier for frontend
- Configure Ruff for backend

### Task 2: Supabase Integration
- Set up Supabase client in frontend (createBrowserClient)
- Set up Supabase service role client in backend
- Create all database tables + RLS policies from schema above
- Implement auth flow: signup, signin, signout, session management
- Create auth middleware for protected routes
- Create AuthPage with Supabase Auth UI

### Task 3: Core UI Shell
- Build the layout: dark bg, navigation, responsive sidebar
- Implement all design tokens as CSS variables in globals.css
- Create StatsBar component
- Create DashboardPage with placeholder content
- Add Cinzel (Google Fonts) for headings, Inter for body

### Task 4: AI Tree Generation Backend
- Create Gemini API integration service
- Build prompt templates for: follow-up questions, tree generation
- Create /api/v1/trees/generate endpoint
- Create /api/v1/trees/followup endpoint
- Validate AI output against SkillNode schema
- Add error handling + timeouts (30s)
- Write tests for tree generation service

### Task 5: Tree Creation Wizard (Frontend)
- Build GoalInputStep (text input with dark fantasy styling)
- Build FollowUpQuestionsStep (render AI questions as selectable cards)
- Build GeneratingStep (dark fantasy loading animation)
- Build TreeRevealStep (show tree after generation)
- Connect wizard to backend API
- Save generated tree to Supabase

### Task 6: Interactive Skill Tree Visualization
- Set up React Flow with custom dark theme
- Create SkillNodeComponent with shape variants (circle/square/diamond/hexagon)
- Create SkillEdgeComponent with animated flow effect
- Implement node state visuals (locked/available/in-progress/completed)
- Add node click → detail panel interaction
- Implement zoom/pan controls with dark styling

### Task 7: Node Completion & Progress
- Create CompleteButton in NodeDetailPanel
- Build PATCH /api/v1/nodes/{id}/complete endpoint
- Implement prerequisite validation (can't complete if prereqs not met)
- Auto-unlock dependent nodes when prerequisites are met
- Update XP on completion
- Update streak tracking

### Task 8: Landing Page
- Hero section with static talent tree preview
- Goal input CTA that redirects to signup
- Responsive, beautiful dark fantasy design
- Fast loading (static generation)
