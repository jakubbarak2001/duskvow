-- =============================================================
-- Progression System — Inventory, Achievements, Streak Multiplier
-- Migration: 20260413_progression_system
--
-- Creates hero_inventory (persistent loot storage),
-- hero_achievements (one-time accomplishment badges),
-- adds streak_multiplier + achievements_count to profiles,
-- and RPC functions for claiming loot and using items.
-- =============================================================


-- -----------------------------------------------------------
-- 1. Table: hero_inventory
--
--    Persistent storage for items collected from dungeon runs.
--    Items start as unused and can be consumed via RPC.
-- -----------------------------------------------------------

CREATE TABLE public.hero_inventory (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type     TEXT        NOT NULL CHECK (item_type IN ('scroll_of_clarity','ember_shard','shadowsteel_fragment','heros_ration','rune_of_focus','ashen_token')),
    item_name     TEXT        NOT NULL,
    description   TEXT        NOT NULL,
    effect        TEXT        NOT NULL,
    source_run_id UUID        REFERENCES public.dungeon_runs(id) ON DELETE SET NULL,
    used          BOOLEAN     NOT NULL DEFAULT FALSE,
    used_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hero_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
    ON public.hero_inventory FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
    ON public.hero_inventory FOR UPDATE
    USING (auth.uid() = user_id);

CREATE INDEX idx_hero_inventory_user_used ON public.hero_inventory(user_id, used);


-- -----------------------------------------------------------
-- 2. Table: hero_achievements
--
--    One-time accomplishment badges. The UNIQUE constraint
--    on (user_id, achievement_key) prevents duplicate awards.
-- -----------------------------------------------------------

CREATE TABLE public.hero_achievements (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_key TEXT        NOT NULL,
    unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_key)
);

ALTER TABLE public.hero_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
    ON public.hero_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE INDEX idx_hero_achievements_user ON public.hero_achievements(user_id);


-- -----------------------------------------------------------
-- 3. New columns on profiles
-- -----------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_multiplier  NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS achievements_count INT          NOT NULL DEFAULT 0;


-- -----------------------------------------------------------
-- 4. RPC: claim_dungeon_loot
--
--    Moves unclaimed loot from dungeon_loot into hero_inventory.
--    Returns the number of items claimed.
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION claim_dungeon_loot(p_user_id UUID, p_run_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
  v_loot  RECORD;
BEGIN
  -- Verify the run belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.dungeon_runs
    WHERE id = p_run_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Run not found or does not belong to user';
  END IF;

  -- Move each unclaimed loot item into inventory
  FOR v_loot IN
    SELECT item_type, item_name, description, effect
    FROM public.dungeon_loot
    WHERE run_id = p_run_id
      AND user_id = p_user_id
      AND claimed = FALSE
  LOOP
    INSERT INTO public.hero_inventory (user_id, item_type, item_name, description, effect, source_run_id)
    VALUES (p_user_id, v_loot.item_type, v_loot.item_name, v_loot.description, v_loot.effect, p_run_id);

    v_count := v_count + 1;
  END LOOP;

  -- Mark all loot for this run as claimed
  UPDATE public.dungeon_loot
  SET claimed = TRUE
  WHERE run_id = p_run_id
    AND user_id = p_user_id
    AND claimed = FALSE;

  RETURN v_count;
END;
$$;


-- -----------------------------------------------------------
-- 5. RPC: use_inventory_item
--
--    Marks an inventory item as used. Returns the item row
--    as JSONB so the frontend knows what effect to apply.
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION use_inventory_item(p_user_id UUID, p_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  SELECT * INTO v_item
  FROM public.hero_inventory
  WHERE id = p_item_id
    AND user_id = p_user_id
    AND used = FALSE;

  IF v_item IS NULL THEN
    RAISE EXCEPTION 'Item not found, does not belong to user, or already used';
  END IF;

  UPDATE public.hero_inventory
  SET used = TRUE, used_at = NOW()
  WHERE id = p_item_id;

  RETURN jsonb_build_object(
    'id',          v_item.id,
    'item_type',   v_item.item_type,
    'item_name',   v_item.item_name,
    'description', v_item.description,
    'effect',      v_item.effect,
    'used',        TRUE,
    'used_at',     NOW()
  );
END;
$$;
