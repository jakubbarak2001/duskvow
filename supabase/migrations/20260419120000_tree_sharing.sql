-- =============================================================
-- Tree Sharing — public read-only talent trees
-- Migration: 20260419_tree_sharing
--
-- Adds opt-in public sharing to talent_trees. When a user publishes
-- a tree, the backend stamps a short slug and sets is_public = true;
-- anyone with the slug URL can then SELECT that tree and its nodes
-- with no Supabase auth session.
--
-- Design:
--   - Writes still go through the FastAPI service-role path
--     (backend enforces "max 10 public trees per user", rate limits,
--      and ownership). No authenticated-write policy is added here.
--   - Reads: anon + authenticated may SELECT a tree if is_public=true
--     AND deleted_at IS NULL, and may SELECT its skill_nodes when the
--     parent tree satisfies the same predicate. That's the minimum
--     surface needed for the public /t/{slug} route.
--
-- Safety notes:
--   - The slug is generated server-side (nanoid, 10 chars). We rely on
--     the UNIQUE constraint here as the last line of defense against
--     collisions — a slug already in use would 409 at the DB layer.
--   - The public policies are narrow (SELECT only, gated on is_public).
--     They do NOT leak draft or deleted trees. They do NOT expose the
--     owner's user_id directly to the public route — the backend
--     endpoint strips user_id before returning the row.
-- =============================================================

-- -----------------------------------------------------------
-- 1. Columns on talent_trees
-- -----------------------------------------------------------

ALTER TABLE public.talent_trees
  ADD COLUMN IF NOT EXISTS share_slug text,
  ADD COLUMN IF NOT EXISTS is_public  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_at  timestamptz;

-- Unique index on share_slug — NULL-tolerant (nulls ignored by default).
CREATE UNIQUE INDEX IF NOT EXISTS talent_trees_share_slug_unique
  ON public.talent_trees (share_slug)
  WHERE share_slug IS NOT NULL;

-- Partial index for the anon lookup path: /t/{slug} resolves to a row
-- where is_public=true AND deleted_at IS NULL.
CREATE INDEX IF NOT EXISTS talent_trees_public_lookup
  ON public.talent_trees (share_slug)
  WHERE is_public = true AND deleted_at IS NULL;

-- -----------------------------------------------------------
-- 2. RLS policies for anonymous + authenticated read of public trees
-- -----------------------------------------------------------

-- talent_trees: allow SELECT for anon + authenticated when public.
-- Existing owner-only SELECT policies stay in place — this is additive.
DROP POLICY IF EXISTS "talent_trees_public_select" ON public.talent_trees;
CREATE POLICY "talent_trees_public_select"
  ON public.talent_trees
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND deleted_at IS NULL);

-- skill_nodes: allow SELECT for anon + authenticated when the parent
-- tree is public. Uses an EXISTS subquery so changes to talent_trees
-- flow through without any manual denormalization.
DROP POLICY IF EXISTS "skill_nodes_public_select" ON public.skill_nodes;
CREATE POLICY "skill_nodes_public_select"
  ON public.skill_nodes
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.talent_trees t
      WHERE t.id = skill_nodes.tree_id
        AND t.is_public = true
        AND t.deleted_at IS NULL
    )
  );
