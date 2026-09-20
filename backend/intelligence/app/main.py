"""ORBITA Intelligence Service — FastAPI application.

Orbital mechanics, trajectory planning, and risk assessment.
No LLM usage for physics calculations.
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.health import router as health_router
from .api.trajectory import router as trajectory_router
from .api.collision import router as collision_router
from .api.simulation import router as simulation_router

app = FastAPI(
    title="ORBITA Intelligence Service",
    description=(
        "Orbital mechanics, trajectory planning, and collision risk assessment. "
        "All calculations use documented Keplerian physics."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "http://localhost:3000,http://localhost:4000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router)
app.include_router(trajectory_router)
app.include_router(collision_router)
app.include_router(simulation_router)
