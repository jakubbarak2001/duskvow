-- ============================================================
-- Duskvow — Tree Management
-- Migration: 002_tree_management
-- Adds soft delete, daily generation tracking, and lifecycle support.
-- ============================================================


-- ============================================================
-- Soft delete for talent_trees
-- deleted_at IS NULL means the tree is visible; non-null means deleted.
-- ============================================================

ALTER TABLE public.talent_trees
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;


-- ============================================================
-- TABLE: daily_tree_generations
-- Tracks how many trees each user has generated per UTC day.
-- Resets naturally since each day gets a new row.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_tree_generations (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_date  DATE    NOT NULL DEFAULT CURRENT_DATE,
    count            INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, generation_date)
);

ALTER TABLE public.daily_tree_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generation counts"
    ON public.daily_tree_generations FOR SELECT
    USING (auth.uid() = user_id);
