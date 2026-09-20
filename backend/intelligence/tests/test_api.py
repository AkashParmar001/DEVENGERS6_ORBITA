"""Tests for FastAPI endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["orbital_engine"] == "ok"
    assert data["trajectory_engine"] == "ok"
    assert data["risk_engine"] == "ok"


@pytest.mark.asyncio
async def test_trajectory_plan():
    import math
    from app.models.schemas import EARTH_MU_KM3_S2

    r = 6771.0
    v = math.sqrt(EARTH_MU_KM3_S2 / r)
    payload = {
        "robot_state": {
            "position_km": [r, 0.0, 0.0],
            "velocity_kms": [0.0, v, 0.0],
        },
        "target_state": {
            "position_km": [r + 300.0, 0.0, 0.0],
            "velocity_kms": [0.0, v * 0.98, 0.0],
        },
        "max_delta_v_ms": 500.0,
        "num_waypoints": 5,
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/trajectory/plan", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "trajectory" in data
    assert data["duration_seconds"] > 0
    assert len(data["trajectory"]) == 5


@pytest.mark.asyncio
async def test_risk_collision():
    payload = {
        "object_a": {
            "position_km": [7000.0, 0.0, 0.0],
            "velocity_kms": [0.0, 7.5, 0.0],
        },
        "object_b": {
            "position_km": [7010.0, 0.0, 0.0],
            "velocity_kms": [0.0, 7.5, 0.0],
        },
        "time_horizon_seconds": 600.0,
        "time_step_seconds": 60.0,
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/risk/collision", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_level"] in ["negligible", "low", "medium", "high", "critical"]
    assert 0.0 <= data["probability"] <= 1.0
    assert data["minimum_distance_km"] >= 0.0
