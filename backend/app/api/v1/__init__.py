"""API v1 router — aggregates all versioned route handlers."""

from fastapi import APIRouter

from app.api.v1.trees import router as trees_router
from app.api.v1.nodes import router as nodes_router
from app.api.v1.profile import router as profile_router

router = APIRouter()
router.include_router(trees_router, prefix="/trees", tags=["trees"])
router.include_router(nodes_router, prefix="/nodes", tags=["nodes"])
router.include_router(profile_router, prefix="/profile", tags=["profile"])
