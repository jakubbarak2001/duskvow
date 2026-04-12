"""API v1 router — aggregates all versioned route handlers."""

from fastapi import APIRouter

from app.api.v1.trees import router as trees_router
from app.api.v1.nodes import router as nodes_router
from app.api.v1.profile import router as profile_router
from app.api.v1.embers import router as embers_router
from app.api.v1.quests import router as quests_router
from app.api.v1.dungeon import router as dungeon_router
from app.api.v1.achievements import router as achievements_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.leaderboard import router as leaderboard_router

router = APIRouter()
router.include_router(trees_router, prefix="/trees", tags=["trees"])
router.include_router(nodes_router, prefix="/nodes", tags=["nodes"])
router.include_router(profile_router, prefix="/profile", tags=["profile"])
router.include_router(embers_router, prefix="/embers", tags=["embers"])
router.include_router(quests_router, prefix="/quests", tags=["quests"])
router.include_router(dungeon_router, prefix="/dungeon", tags=["dungeon"])
router.include_router(achievements_router, prefix="/achievements", tags=["achievements"])
router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])
router.include_router(leaderboard_router, prefix="/leaderboard", tags=["leaderboard"])
