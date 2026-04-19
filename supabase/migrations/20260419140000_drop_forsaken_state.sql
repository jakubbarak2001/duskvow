-- =============================================================
-- Drop the choice-branch "forsaken" state
-- Migration: 20260419140000_drop_forsaken_state
--
-- The mutex-branch / choose-one-path feature is being cut from the MVP
-- entirely. Choice nodes remain as a visual node_type (diamond shape),
-- but their children no longer forsake each other on commit. Every path
-- is walkable.
--
-- Steps:
--   1. Re-run the forsaken → locked/available repair in case anyone
--      has committed to a branch since the last repair migration.
--      Any remaining ``forsaken`` row would reject the CHECK drop.
--   2. Drop the widened CHECK constraint and restore the original one
--      (four states). The database returns to the pre-mutex shape.
-- =============================================================

-- 1. Reset any lingering forsaken rows. Same logic as the prior repair.
UPDATE public.skill_nodes AS n
SET state = CASE
  WHEN n.prerequisites = '{}'::uuid[] THEN 'available'
  WHEN (
    SELECT bool_and(p.state = 'completed')
    FROM public.skill_nodes p
    WHERE p.id = ANY(n.prerequisites)
  ) THEN 'available'
  ELSE 'locked'
END
WHERE n.state = 'forsaken';

-- 2. Replace the CHECK constraint with the original four-state set.
ALTER TABLE public.skill_nodes
  DROP CONSTRAINT IF EXISTS skill_nodes_state_check;

ALTER TABLE public.skill_nodes
  ADD CONSTRAINT skill_nodes_state_check
  CHECK (state IN ('locked', 'available', 'in_progress', 'completed'));
