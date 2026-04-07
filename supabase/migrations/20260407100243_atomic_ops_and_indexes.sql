-- =============================================================
-- Atomic RPC functions + missing indexes
-- =============================================================

-- -----------------------------------------------------------
-- 1. Atomic XP increment
--    Called by add_xp_to_profile() to avoid read-modify-write race.
--    Upserts the profile row (creates it if missing) and returns
--    the new total_xp value.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_profile_xp(p_user_id UUID, p_xp INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total INT;
BEGIN
  INSERT INTO public.profiles (id, total_xp, updated_at)
    VALUES (p_user_id, p_xp, NOW())
  ON CONFLICT (id) DO UPDATE
    SET total_xp   = profiles.total_xp + p_xp,
        updated_at = NOW()
  RETURNING total_xp INTO v_new_total;

  RETURN v_new_total;
END;
$$;

-- -----------------------------------------------------------
-- 2. Atomic daily generation increment
--    Called by increment_daily_generation() to avoid TOCTOU race
--    where two concurrent requests both see count=0 and both
--    insert count=1, losing one generation credit.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_daily_generation(p_user_id UUID, p_date DATE)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INT;
BEGIN
  INSERT INTO public.daily_tree_generations (user_id, generation_date, count)
    VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, generation_date) DO UPDATE
    SET count = daily_tree_generations.count + 1
  RETURNING count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- -----------------------------------------------------------
-- 3. RLS policies for daily_tree_generations
--    (table had ENABLE ROW LEVEL SECURITY but no policies)
-- -----------------------------------------------------------
ALTER TABLE public.daily_tree_generations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_tree_generations'
      AND policyname = 'Users can manage own generation rows'
  ) THEN
    CREATE POLICY "Users can manage own generation rows"
      ON public.daily_tree_generations
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- -----------------------------------------------------------
-- 4. Missing indexes
-- -----------------------------------------------------------

-- talent_trees
CREATE INDEX IF NOT EXISTS idx_talent_trees_user_id
  ON public.talent_trees (user_id);

CREATE INDEX IF NOT EXISTS idx_talent_trees_status
  ON public.talent_trees (status);

-- skill_nodes
CREATE INDEX IF NOT EXISTS idx_skill_nodes_tree_id
  ON public.skill_nodes (tree_id);

-- daily_activity
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date
  ON public.daily_activity (user_id, activity_date);

-- daily_tree_generations
CREATE INDEX IF NOT EXISTS idx_daily_tree_generations_user_date
  ON public.daily_tree_generations (user_id, generation_date);
