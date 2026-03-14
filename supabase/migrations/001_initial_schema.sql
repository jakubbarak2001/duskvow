-- ============================================================
-- Duskvow — Initial Schema
-- Migration: 001_initial_schema
-- Run this in the Supabase SQL editor (Settings → SQL Editor)
-- ============================================================


-- ============================================================
-- TABLE: profiles
-- One row per auth.user. Auto-created by trigger below.
-- ============================================================

CREATE TABLE public.profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    total_xp        INTEGER     NOT NULL DEFAULT 0,
    current_streak  INTEGER     NOT NULL DEFAULT 0,
    longest_streak  INTEGER     NOT NULL DEFAULT 0,
    last_activity_date DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);


-- ============================================================
-- TABLE: talent_trees
-- ============================================================

CREATE TABLE public.talent_trees (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    description     TEXT,
    goal_prompt     TEXT        NOT NULL,
    ai_context      JSONB,
    total_nodes     INTEGER     NOT NULL DEFAULT 0,
    completed_nodes INTEGER     NOT NULL DEFAULT 0,
    total_xp        INTEGER     NOT NULL DEFAULT 0,
    earned_xp       INTEGER     NOT NULL DEFAULT 0,
    status          TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.talent_trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own trees"
    ON public.talent_trees FOR ALL
    USING (auth.uid() = user_id);


-- ============================================================
-- TABLE: skill_nodes
-- ============================================================

CREATE TABLE public.skill_nodes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id         UUID        NOT NULL REFERENCES public.talent_trees(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    node_type       TEXT        NOT NULL
                                CHECK (node_type IN ('habit', 'action', 'choice', 'keystone')),
    tier            TEXT        NOT NULL
                                CHECK (tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    state           TEXT        NOT NULL DEFAULT 'locked'
                                CHECK (state IN ('locked', 'available', 'in_progress', 'completed')),
    position_x      FLOAT       NOT NULL,
    position_y      FLOAT       NOT NULL,
    prerequisites   UUID[]      NOT NULL DEFAULT '{}',
    is_optional     BOOLEAN     NOT NULL DEFAULT FALSE,
    xp_reward       INTEGER     NOT NULL DEFAULT 10,
    estimated_time  TEXT,
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.skill_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own nodes"
    ON public.skill_nodes FOR ALL
    USING (
        tree_id IN (
            SELECT id FROM public.talent_trees WHERE user_id = auth.uid()
        )
    );


-- ============================================================
-- TABLE: daily_activity
-- ============================================================

CREATE TABLE public.daily_activity (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
    nodes_completed INTEGER     NOT NULL DEFAULT 0,
    xp_earned       INTEGER     NOT NULL DEFAULT 0,
    UNIQUE (user_id, activity_date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own activity"
    ON public.daily_activity FOR ALL
    USING (auth.uid() = user_id);


-- ============================================================
-- TRIGGER: auto-create profile on new user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        -- Use the display_name from OAuth metadata if present, else null
        NEW.raw_user_meta_data ->> 'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
