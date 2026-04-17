-- =============================================================
-- Drop daily-quest system entirely (surface feature removed).
-- Migration: 20260417_drop_daily_quests
--
-- REASON: Daily quests validated out of scope for the current iteration.
-- Frontend surfaces, backend routes, AI prompt fields, and quest-triggered
-- achievements are all removed in this commit. This migration removes the
-- underlying storage + FK reference so no orphaned rows persist and the
-- dungeon schema no longer references a dropped table.
--
-- Order matters:
--   1. Drop the dungeon_runs.linked_quest_id FK + column (the only remaining
--      reference into daily_quests).
--   2. Drop daily_quest_completions (depends on daily_quests via FK).
--   3. Drop daily_quests.
--
-- CASCADE handles any straggler policies, indexes, or triggers on each
-- table. All RLS policies written against these tables in earlier migrations
-- are dropped implicitly.
-- =============================================================


-- -----------------------------------------------------------
-- 1. Clear the dungeon_runs → daily_quests reference so the parent
--    table can drop. The FK was ON DELETE SET NULL in the dungeon
--    migration, but we still have to drop the column before dropping
--    daily_quests or the catalog will refuse.
-- -----------------------------------------------------------

ALTER TABLE public.dungeon_runs DROP COLUMN IF EXISTS linked_quest_id;


-- -----------------------------------------------------------
-- 2. Drop the completion ledger first (child of daily_quests).
-- -----------------------------------------------------------

DROP TABLE IF EXISTS public.daily_quest_completions CASCADE;


-- -----------------------------------------------------------
-- 3. Drop the quest catalog itself.
-- -----------------------------------------------------------

DROP TABLE IF EXISTS public.daily_quests CASCADE;
