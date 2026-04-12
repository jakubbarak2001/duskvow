-- =============================================================
-- Leaderboard — Weekly XP Tracking
-- Migration: 20260415_leaderboard_weekly_xp
--
-- Adds weekly_xp and week_start_date columns to profiles.
-- Modifies increment_profile_xp to lazy-reset weekly_xp
-- when week_start_date is stale (new ISO week).
-- =============================================================


-- -----------------------------------------------------------
-- 1. New columns on profiles
-- -----------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_xp        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS week_start_date  DATE;


-- -----------------------------------------------------------
-- 2. Replace increment_profile_xp — now also tracks weekly_xp
--
--    Lazy-resets weekly_xp when the current ISO week differs
--    from week_start_date (or when week_start_date is NULL).
-- -----------------------------------------------------------

DROP FUNCTION IF EXISTS increment_profile_xp(UUID, INT);

CREATE OR REPLACE FUNCTION increment_profile_xp(p_user_id UUID, p_xp INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_level      INT;
  v_new_xp         INT;
  v_new_level      INT;
  v_new_title      TEXT;
  v_leveled_up     BOOL;
  v_week_start     DATE;
  v_current_week   DATE;
BEGIN
  -- Compute Monday of the current ISO week
  v_current_week := date_trunc('week', CURRENT_DATE)::DATE;

  -- Read current state
  SELECT hero_level, week_start_date
    INTO v_old_level, v_week_start
    FROM public.profiles
   WHERE id = p_user_id;

  IF v_old_level IS NULL THEN
    v_old_level := 1;
  END IF;

  -- Atomic upsert of XP
  INSERT INTO public.profiles (id, total_xp, updated_at)
    VALUES (p_user_id, p_xp, NOW())
  ON CONFLICT (id) DO UPDATE
    SET total_xp   = profiles.total_xp + p_xp,
        updated_at = NOW()
  RETURNING total_xp INTO v_new_xp;

  -- Lazy-reset weekly_xp if we're in a new week (or first time)
  IF v_week_start IS NULL OR v_week_start < v_current_week THEN
    UPDATE public.profiles
       SET weekly_xp       = p_xp,
           week_start_date = v_current_week
     WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles
       SET weekly_xp = weekly_xp + p_xp
     WHERE id = p_user_id;
  END IF;

  -- Compute derived fields
  v_new_level  := compute_level_from_xp(v_new_xp);
  v_new_title  := title_for_level(v_new_level);
  v_leveled_up := v_new_level > v_old_level;

  -- Persist level + title if they changed
  IF v_leveled_up THEN
    UPDATE public.profiles
       SET hero_level = v_new_level,
           hero_title = v_new_title,
           updated_at = NOW()
     WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'new_total_xp',   v_new_xp,
    'new_level',      v_new_level,
    'previous_level', v_old_level,
    'leveled_up',     v_leveled_up,
    'new_title',      v_new_title
  );
END;
$$;


-- -----------------------------------------------------------
-- 3. Index for leaderboard queries (ORDER BY weekly_xp DESC)
-- -----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_weekly_xp
  ON public.profiles (weekly_xp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_total_xp
  ON public.profiles (total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_current_streak
  ON public.profiles (current_streak DESC);


-- -----------------------------------------------------------
-- 4. Backfill: set week_start_date for existing active users
-- -----------------------------------------------------------

UPDATE public.profiles
   SET week_start_date = date_trunc('week', CURRENT_DATE)::DATE
 WHERE week_start_date IS NULL
   AND total_xp > 0;
