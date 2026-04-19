"""Public (unauthenticated) API routes — read-only access to shared trees.

Every endpoint here is reachable without a Supabase session. The surface
is deliberately tiny: a single GET that resolves a share slug to a tree +
its nodes. Writes live on authenticated routes only.
"""

from fastapi import APIRouter, HTTPException, status

from app.core import supabase as supa

router = APIRouter()


@router.get("/trees/{slug}", response_model=dict)
async def get_public_tree(slug: str) -> dict:
    """Resolve a share slug to a public, read-only tree view.

    Returns the tree row (minus ``user_id``) + its skill nodes + the
    owner's ``hero_name`` (best-effort, may be null). The backend
    enforces ``is_public=true`` and ``deleted_at IS NULL``; anything
    else 404s.

    Args:
        slug: The share slug from the /t/{slug} URL.

    Returns:
        Envelope with the tree dict.
    """
    tree = await supa.get_public_tree_by_slug(slug)
    if not tree:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared vow not found.",
        )
    return {"data": tree, "error": None}
