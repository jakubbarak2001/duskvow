-- =============================================================
-- Daily Quest System
-- Migration: 20260411_daily_quests
--
-- Creates daily_quests (recurring tasks per tree) and
-- daily_quest_completions (one completion per quest per day).
-- =============================================================


-- -----------------------------------------------------------
-- 1. Table: daily_quests
-- -----------------------------------------------------------

CREATE TABLE public.daily_quests (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id     UUID        NOT NULL REFERENCES public.talent_trees(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    description TEXT        NOT NULL,
    xp_reward   INT         NOT NULL DEFAULT 15,
    sort_order  INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
    ON public.daily_quests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests"
    ON public.daily_quests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
    ON public.daily_quests FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_daily_quests_tree_id ON public.daily_quests(tree_id);
CREATE INDEX idx_daily_quests_user_id ON public.daily_quests(user_id);


-- -----------------------------------------------------------
-- 2. Table: daily_quest_completions
-- -----------------------------------------------------------

CREATE TABLE public.daily_quest_completions (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id        UUID    NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
    user_id         UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_date  DATE    NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(quest_id, user_id, completed_date)
);

ALTER TABLE public.daily_quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
    ON public.daily_quest_completions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
    ON public.daily_quest_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
    ON public.daily_quest_completions FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_daily_quest_completions_user_date
    ON public.daily_quest_completions(user_id, completed_date);
