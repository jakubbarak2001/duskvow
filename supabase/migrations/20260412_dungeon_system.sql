-- =============================================================
-- Dungeon AFK Combat System
-- Migration: 20260412_dungeon_system
--
-- Creates dungeon_runs (focus sessions as dungeon delves),
-- dungeon_events (floor-by-floor combat/discovery narrative),
-- dungeon_loot (consumable item drops from completed runs).
-- Also adds estimated_minutes to daily_quests for quest→dungeon linking.
-- =============================================================


-- -----------------------------------------------------------
-- 1. Table: dungeon_runs
-- -----------------------------------------------------------

CREATE TABLE public.dungeon_runs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier             TEXT        NOT NULL CHECK (tier IN ('shallow_crypts', 'ember_mines', 'hollow_deep', 'abyssal_rift')),
    status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'retreated')),
    total_floors     INT         NOT NULL,
    cleared_floors   INT         NOT NULL DEFAULT 0,
    duration_minutes INT         NOT NULL,
    xp_earned        INT         NOT NULL DEFAULT 0,
    linked_node_id   UUID        REFERENCES public.skill_nodes(id) ON DELETE SET NULL,
    linked_quest_id  UUID        REFERENCES public.daily_quests(id) ON DELETE SET NULL,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dungeon_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own runs"
    ON public.dungeon_runs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own runs"
    ON public.dungeon_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own runs"
    ON public.dungeon_runs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX idx_dungeon_runs_user_status ON public.dungeon_runs(user_id, status);

-- Only one active run per user at a time
CREATE UNIQUE INDEX idx_one_active_run ON public.dungeon_runs(user_id) WHERE status = 'active';


-- -----------------------------------------------------------
-- 2. Table: dungeon_events
-- -----------------------------------------------------------

CREATE TABLE public.dungeon_events (
    id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id             UUID    NOT NULL REFERENCES public.dungeon_runs(id) ON DELETE CASCADE,
    floor_number       INT     NOT NULL,
    event_type         TEXT    NOT NULL CHECK (event_type IN ('combat', 'discovery', 'trap', 'rest', 'boss')),
    title              TEXT    NOT NULL,
    description        TEXT    NOT NULL,
    monster_name       TEXT,
    monsters_defeated  INT     NOT NULL DEFAULT 0,
    trigger_at_seconds INT     NOT NULL,
    sort_order         INT     NOT NULL DEFAULT 0
);

ALTER TABLE public.dungeon_events ENABLE ROW LEVEL SECURITY;

-- Events are read-only for users — backend writes them at run start
CREATE POLICY "Users can view events for own runs"
    ON public.dungeon_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.dungeon_runs
            WHERE public.dungeon_runs.id = run_id
            AND public.dungeon_runs.user_id = auth.uid()
        )
    );

CREATE INDEX idx_dungeon_events_run_order ON public.dungeon_events(run_id, sort_order);


-- -----------------------------------------------------------
-- 3. Table: dungeon_loot
-- -----------------------------------------------------------

CREATE TABLE public.dungeon_loot (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id      UUID        NOT NULL REFERENCES public.dungeon_runs(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type   TEXT        NOT NULL CHECK (item_type IN ('scroll_of_clarity', 'ember_shard', 'shadowsteel_fragment', 'heros_ration', 'rune_of_focus', 'ashen_token')),
    item_name   TEXT        NOT NULL,
    description TEXT        NOT NULL,
    effect      TEXT        NOT NULL,
    claimed     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dungeon_loot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loot"
    ON public.dungeon_loot FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own loot"
    ON public.dungeon_loot FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX idx_dungeon_loot_user_claimed ON public.dungeon_loot(user_id, claimed);


-- -----------------------------------------------------------
-- 4. Add estimated_minutes to daily_quests (quest→dungeon link)
-- -----------------------------------------------------------

ALTER TABLE public.daily_quests ADD COLUMN estimated_minutes INT;
