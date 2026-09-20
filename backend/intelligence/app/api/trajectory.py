"""Trajectory planning endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from ..models.schemas import TrajectoryPlanRequest, TrajectoryPlanResponse
from ..trajectory.planner import TrajectoryPlanner

router = APIRouter(prefix="/trajectory", tags=["trajectory"])

_planner = TrajectoryPlanner()


@router.post("/plan", response_model=TrajectoryPlanResponse)
async def plan_trajectory(request: TrajectoryPlanRequest) -> TrajectoryPlanResponse:
    """Plan a trajectory from robot state to target state.

    Uses Keplerian mechanics to compute minimum-energy transfer.
    Returns trajectory waypoints, duration, delta-v, and fuel estimate.
    """
    return _planner.plan(request)
