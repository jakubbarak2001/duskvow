-- =============================================================
-- Security Hardening — post-audit 2026-04-16
-- Migration: 20260416_security_hardening
--
-- Closes findings from SECURITY_AUDIT_2026-04-16.md:
--   §2.1 CRITICAL — profiles UPDATE allowed any column mutation
--   §2.2 CRITICAL — SECURITY DEFINER RPCs callable by PUBLIC with arbitrary
--                   p_user_id; also missing SET search_path
--   §2.3 HIGH     — dungeon_loot.claimed toggle (loot dupe vector)
--   §2.4 HIGH     — hero_inventory.used toggle / item_type laundering
--   §2.5 HIGH     — skill_nodes direct mutation (tier/xp_reward laundering)
--   §2.7 MEDIUM   — daily_quests INSERT missed tree-ownership check
--
-- Strategy: the FastAPI backend uses SUPABASE_SERVICE_ROLE_KEY for every
-- write path (backend/app/core/supabase.py:15-20, 145-199). Service role
-- bypasses RLS and has broad EXECUTE, so we can aggressively drop
-- writable policies and REVOKE EXECUTE from authenticated/anon/PUBLIC
-- without breaking backend flows. Frontend never writes data directly
-- through PostgREST; it only calls supabase.auth.* for sessions.
--
-- Outcome: authenticated users get SELECT-only on all progression tables.
-- Every write must go through FastAPI.
-- =============================================================


-- -----------------------------------------------------------
-- 0. Backfill legacy data that would violate upcoming CHECKs.
--    Normalize any skill_nodes rows whose xp_reward drifted away
--    from the canonical tier value (e.g. from a pre-clamp Gemini
--    generation). Run BEFORE the ADD CONSTRAINT below or it fails
--    loudly on any mismatched legacy row.
-- -----------------------------------------------------------

UPDATE public.skill_nodes
   SET xp_reward = CASE tier
     WHEN 'common'    THEN 10
     WHEN 'uncommon'  THEN 20
     WHEN 'rare'      THEN 35
     WHEN 'epic'      THEN 50
     WHEN 'legendary' THEN 75
     WHEN 'mythic'    THEN 100
   END
 WHERE xp_reward <> CASE tier
     WHEN 'common'    THEN 10
     WHEN 'uncommon'  THEN 20
     WHEN 'rare'      THEN 35
     WHEN 'epic'      THEN 50
     WHEN 'legendary' THEN 75
     WHEN 'mythic'    THEN 100
   END;


-- -----------------------------------------------------------
-- §2.1 — profiles: drop UPDATE for authenticated entirely.
--        Backend always writes via service_role (upsert_profile /
--        add_xp_to_profile / update_streak / award_achievement).
-- -----------------------------------------------------------

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE INSERT ON public.profiles FROM authenticated;
-- SELECT policy "Users can view own profile" retained.


-- -----------------------------------------------------------
-- §2.2 — SECURITY DEFINER RPCs: lock down search_path and revoke
--        EXECUTE from PUBLIC/authenticated/anon. Service role is
--        granted EXECUTE explicitly so backend calls keep working
--        without relying on implicit role hierarchy.
-- -----------------------------------------------------------

-- increment_profile_xp(UUID, INT) — returns JSONB
ALTER FUNCTION public.increment_profile_xp(UUID, INT) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.increment_profile_xp(UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_profile_xp(UUID, INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_profile_xp(UUID, INT) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.increment_profile_xp(UUID, INT) TO service_role;

-- increment_daily_generation(UUID, DATE) — returns INT
ALTER FUNCTION public.increment_daily_generation(UUID, DATE) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.increment_daily_generation(UUID, DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_daily_generation(UUID, DATE) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_daily_generation(UUID, DATE) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.increment_daily_generation(UUID, DATE) TO service_role;

-- update_streak_atomic(UUID) — returns JSONB (latest signature)
ALTER FUNCTION public.update_streak_atomic(UUID) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_streak_atomic(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_streak_atomic(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_streak_atomic(UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.update_streak_atomic(UUID) TO service_role;

-- claim_dungeon_loot(UUID, UUID) — returns INT
ALTER FUNCTION public.claim_dungeon_loot(UUID, UUID) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.claim_dungeon_loot(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_dungeon_loot(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_dungeon_loot(UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.claim_dungeon_loot(UUID, UUID) TO service_role;

-- use_inventory_item(UUID, UUID) — returns JSONB
ALTER FUNCTION public.use_inventory_item(UUID, UUID) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.use_inventory_item(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.use_inventory_item(UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.use_inventory_item(UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.use_inventory_item(UUID, UUID) TO service_role;

-- Pure helpers — not SECURITY DEFINER, but same search_path defense.
ALTER FUNCTION public.compute_level_from_xp(INT) SET search_path = public;
ALTER FUNCTION public.title_for_level(INT) SET search_path = public;


-- -----------------------------------------------------------
-- §2.3, §2.4, §2.5, §2.7 — writable-RLS tightening:
-- All progression tables become SELECT-only for authenticated.
-- Every write path in backend/app/core/supabase.py uses service_role
-- and bypasses RLS, so these changes are transparent to the backend.
-- -----------------------------------------------------------

-- talent_trees: was FOR ALL, becomes SELECT-only.
DROP POLICY IF EXISTS "Users can CRUD own trees" ON public.talent_trees;
CREATE POLICY "Users can view own trees"
    ON public.talent_trees FOR SELECT
    USING (auth.uid() = user_id);

-- skill_nodes: was FOR ALL, becomes SELECT-only (via tree-ownership join).
DROP POLICY IF EXISTS "Users can access own nodes" ON public.skill_nodes;
CREATE POLICY "Users can view own nodes"
    ON public.skill_nodes FOR SELECT
    USING (
        tree_id IN (
            SELECT id FROM public.talent_trees WHERE user_id = auth.uid()
        )
    );

-- dungeon_runs: drop INSERT + UPDATE, keep SELECT.
DROP POLICY IF EXISTS "Users can insert own runs" ON public.dungeon_runs;
DROP POLICY IF EXISTS "Users can update own runs" ON public.dungeon_runs;

-- dungeon_loot: drop UPDATE (the `claimed=false` reset dupe vector).
DROP POLICY IF EXISTS "Users can update own loot" ON public.dungeon_loot;

-- hero_inventory: drop UPDATE (the `used=false` reset + item_type laundering).
DROP POLICY IF EXISTS "Users can update own inventory" ON public.hero_inventory;

-- daily_activity: was FOR ALL, becomes SELECT-only.
DROP POLICY IF EXISTS "Users can access own activity" ON public.daily_activity;
CREATE POLICY "Users can view own activity"
    ON public.daily_activity FOR SELECT
    USING (auth.uid() = user_id);

-- daily_quests: INSERT policy allowed inserting quests into ANY tree_id
--               (it only checked user_id, not tree ownership). Backend
--               creates quests via service_role, so drop INSERT/DELETE.
DROP POLICY IF EXISTS "Users can insert own quests" ON public.daily_quests;
DROP POLICY IF EXISTS "Users can delete own quests" ON public.daily_quests;

-- daily_quest_completions: mirror — backend writes all completions.
DROP POLICY IF EXISTS "Users can insert own completions" ON public.daily_quest_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON public.daily_quest_completions;

-- embers: was single FOR ALL policy "Users can CRUD own embers".
DROP POLICY IF EXISTS "Users can CRUD own embers" ON public.embers;
CREATE POLICY "Users can view own embers"
    ON public.embers FOR SELECT
    USING (auth.uid() = user_id);


-- -----------------------------------------------------------
-- CHECK constraints — defense-in-depth.
-- These make illegal state unrepresentable even if a future
-- RLS/RPC regression leaks through.
-- -----------------------------------------------------------

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_total_xp_non_negative        CHECK (total_xp >= 0),
  ADD CONSTRAINT profiles_weekly_xp_non_negative       CHECK (weekly_xp >= 0),
  ADD CONSTRAINT profiles_hero_level_range             CHECK (hero_level BETWEEN 1 AND 99),
  ADD CONSTRAINT profiles_streak_mult_range            CHECK (streak_multiplier BETWEEN 1.00 AND 2.00),
  ADD CONSTRAINT profiles_current_streak_non_negative  CHECK (current_streak >= 0),
  ADD CONSTRAINT profiles_longest_streak_non_negative  CHECK (longest_streak >= 0),
  ADD CONSTRAINT profiles_achievements_count_non_negative CHECK (achievements_count >= 0);

ALTER TABLE public.skill_nodes
  ADD CONSTRAINT skill_nodes_xp_reward_tier_match
  CHECK (
    (tier = 'common'    AND xp_reward = 10)  OR
    (tier = 'uncommon'  AND xp_reward = 20)  OR
    (tier = 'rare'      AND xp_reward = 35)  OR
    (tier = 'epic'      AND xp_reward = 50)  OR
    (tier = 'legendary' AND xp_reward = 75)  OR
    (tier = 'mythic'    AND xp_reward = 100)
  );
