-- =============================================================
-- Repair: un-forsake nodes abandoned by the initial (buggy) BFS
-- Migration: 20260419130000_repair_bad_forsakes
--
-- The first forsaken-branches rollout had a BFS bug: it propagated
-- forsake-ness through COMPLETED nodes, which meant any tree with
-- completions downstream of a choice fork had entire sub-branches
-- incorrectly marked ``forsaken`` — including nodes whose walk was
-- unrelated to the choice. Users couldn't continue walking those
-- nodes.
--
-- This migration resets every currently-``forsaken`` node to the
-- state it should have based on its prereqs:
--
--   - No prereqs                     → available
--   - All prereqs completed          → available
--   - Otherwise                      → locked
--
-- Trade-off: any LEGITIMATE forsake from the buggy version is also
-- undone. That's correct — the original forsake set was unreliable.
-- Users who want to re-commit to a branch can start it again; the
-- fixed logic will forsake the right siblings.
-- =============================================================

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
