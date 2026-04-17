"""Duskvow FastAPI application entry point."""

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import router as api_v1_router
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Duskvow API",
    description="AI-powered RPG skill tree generator for real-world self-improvement.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware — allow frontend origins + all Vercel preview deploys
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://duskvow-[a-z0-9-]+\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions.

    Without this, Starlette's outer ServerErrorMiddleware returns a 500
    BEFORE CORSMiddleware can attach CORS headers — browsers then surface
    the failure as a misleading "CORS blocked" error and the real cause is
    invisible. This handler runs INSIDE the middleware stack, so the
    response gets CORS headers and the actual exception type reaches the
    client console. The full traceback is logged server-side via exc_info.
    """
    logger.error(
        "unhandled_exception",
        exc_info=True,
        extra={"path": request.url.path, "method": request.method},
    )
    # The exception class name stays in the server log (exc_info above);
    # the client-facing response is generic so internal types don't leak.
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "duskvow-api"}
