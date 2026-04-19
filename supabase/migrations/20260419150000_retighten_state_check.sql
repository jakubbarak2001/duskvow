-- =============================================================
-- Re-tighten skill_nodes state CHECK after forsaken removal
-- Migration: 20260419150000_retighten_state_check
--
-- Context:
--   Supabase applied today's migrations in filename-string order, not
--   numeric-version order. Because `_` (0x5F) > `1` (0x31) in ASCII, the
--   8-digit `20260419_forsaken_branches.sql` ran AFTER the 14-digit
--   `20260419140000_drop_forsaken_state.sql`, which re-widened the
--   state CHECK to include `'forsaken'`. This migration puts the
--   constraint back to the canonical four-state set. All columns in
--   the repo now use 14-digit timestamp prefixes going forward so this
--   re-ordering can't recur.
-- =============================================================

ALTER TABLE public.skill_nodes
  DROP CONSTRAINT IF EXISTS skill_nodes_state_check;

ALTER TABLE public.skill_nodes
  ADD CONSTRAINT skill_nodes_state_check
  CHECK (state IN ('locked', 'available', 'in_progress', 'completed'));
