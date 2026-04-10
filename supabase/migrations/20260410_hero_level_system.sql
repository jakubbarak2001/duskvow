-- =============================================================
-- Hero Identity & Level System
-- Migration: 20260410_hero_level_system
--
-- Adds hero_name, hero_level, hero_title to profiles.
-- Creates pure functions for level/title computation.
-- Modifies increment_profile_xp to detect level-ups and
-- return JSONB instead of INT.
-- =============================================================


-- -----------------------------------------------------------
-- 1. New columns on profiles
-- -----------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hero_name  TEXT,
  ADD COLUMN IF NOT EXISTS hero_level INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS hero_title TEXT NOT NULL DEFAULT 'Wanderer';


-- -----------------------------------------------------------
-- 2. Pure function: compute level from total XP
--
--    Formula: level = floor(0.5 + sqrt(xp / 25.0))
--    Minimum return: 1
--
--    Thresholds:
--      Lv  2 =    100 XP    Lv 10 =  2,500 XP
--      Lv  3 =    225 XP    Lv 20 = 10,000 XP
--      Lv  5 =    625 XP    Lv 50 = 62,500 XP
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION compute_level_from_xp(p_xp INT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(1, FLOOR(0.5 + SQRT(p_xp / 25.0))::INT);
$$;


-- -----------------------------------------------------------
-- 3. Pure function: title for a given level
--
--    Returns the title whose threshold is the highest <= level.
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION title_for_level(p_level INT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_level >= 50 THEN 'Vow Eternal'
    WHEN p_level >= 40 THEN 'Mythbreaker'
    WHEN p_level >= 30 THEN 'Shadowforged'
    WHEN p_level >= 20 THEN 'Duskwalker'
    WHEN p_level >= 15 THEN 'Flamewarden'
    WHEN p_level >= 10 THEN 'Ironsworn'
    WHEN p_level >=  5 THEN 'Oath-Bound'
    ELSE 'Wanderer'
  END;
$$;


-- -----------------------------------------------------------
-- 4. Replace increment_profile_xp — now returns JSONB
--
--    The original function returned INT. Postgres does not allow
--    changing return type via CREATE OR REPLACE, so we DROP first.
--
--    Returns:
--    {
--      "new_total_xp":   INT,
--      "new_level":       INT,
--      "previous_level":  INT,
--      "leveled_up":      BOOL,
--      "new_title":       TEXT
--    }
-- -----------------------------------------------------------

DROP FUNCTION IF EXISTS increment_profile_xp(UUID, INT);

CREATE OR REPLACE FUNCTION increment_profile_xp(p_user_id UUID, p_xp INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_level   INT;
  v_new_xp      INT;
  v_new_level   INT;
  v_new_title   TEXT;
  v_leveled_up  BOOL;
BEGIN
  -- Read the current level before the XP bump
  SELECT hero_level INTO v_old_level
    FROM public.profiles
   WHERE id = p_user_id;

  -- If profile doesn't exist yet, treat old level as 1
  IF v_old_level IS NULL THEN
    v_old_level := 1;
  END IF;

  -- Atomic upsert of XP (same pattern as the original function)
  INSERT INTO public.profiles (id, total_xp, updated_at)
    VALUES (p_user_id, p_xp, NOW())
  ON CONFLICT (id) DO UPDATE
    SET total_xp   = profiles.total_xp + p_xp,
        updated_at = NOW()
  RETURNING total_xp INTO v_new_xp;

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
    'new_total_xp',  v_new_xp,
    'new_level',     v_new_level,
    'previous_level', v_old_level,
    'leveled_up',    v_leveled_up,
    'new_title',     v_new_title
  );
END;
$$;


-- -----------------------------------------------------------
-- 5. Backfill: set hero_level + hero_title for existing rows
--    based on their current total_xp
-- -----------------------------------------------------------

UPDATE public.profiles
   SET hero_level = compute_level_from_xp(total_xp),
       hero_title = title_for_level(compute_level_from_xp(total_xp))
 WHERE hero_level = 1
   AND total_xp > 0;
