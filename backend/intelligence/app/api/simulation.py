"""Simulation endpoint."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..models.schemas import OrbitalState
from ..simulation.engine import SimulationEngine

router = APIRouter(prefix="/simulation", tags=["simulation"])


class SimulationRunRequest(BaseModel):
    mission_id: str
    robot_state: OrbitalState
    target_state: OrbitalState
    duration_seconds: float = Field(default=3600.0, ge=1.0)
    time_scale: float = Field(default=1.0, ge=0.1, le=1000.0)
    time_step_seconds: float = Field(default=60.0, ge=1.0, le=3600.0)


class SimulationRunResponse(BaseModel):
    summary: dict
    telemetry: list[dict]
    events: list[dict]


_engine = SimulationEngine()


@router.post("/run", response_model=SimulationRunResponse)
async def run_simulation(request: SimulationRunRequest) -> SimulationRunResponse:
    """Run a deterministic orbital simulation to completion."""
    result = _engine.run_to_completion(
        mission_id=request.mission_id,
        robot_state=request.robot_state,
        target_state=request.target_state,
        duration_seconds=request.duration_seconds,
        time_scale=request.time_scale,
        time_step_seconds=request.time_step_seconds,
    )
    return SimulationRunResponse(**result)
