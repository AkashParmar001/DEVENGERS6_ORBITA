"""Collision risk endpoint."""
from __future__ import annotations

from fastapi import APIRouter

from ..models.schemas import CollisionRiskRequest, CollisionRiskResponse
from ..risk.engine import RiskEngine

router = APIRouter(prefix="/risk", tags=["risk"])

_risk_engine = RiskEngine()


@router.post("/collision", response_model=CollisionRiskResponse)
async def assess_collision_risk(request: CollisionRiskRequest) -> CollisionRiskResponse:
    """Assess collision risk between two orbital objects.

    Propagates both objects forward in time and computes
    minimum approach distance and collision probability.
    """
    return _risk_engine.assess_collision_risk(request)
