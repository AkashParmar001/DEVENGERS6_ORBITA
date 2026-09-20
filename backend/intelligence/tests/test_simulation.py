"""Tests for simulation engine."""
import math
import pytest

from app.models.schemas import OrbitalState, EARTH_MU_KM3_S2
from app.simulation.engine import SimulationEngine, SimulationState


def _leo_state(alt_km: float = 400.0) -> OrbitalState:
    r = 6371.0 + alt_km
    v = math.sqrt(EARTH_MU_KM3_S2 / r)
    return OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v, 0.0))


class TestSimulationEngine:
    def test_run_to_completion(self):
        engine = SimulationEngine()
        robot = _leo_state(400.0)
        target = _leo_state(450.0)
        result = engine.run_to_completion(
            mission_id="test-001",
            robot_state=robot,
            target_state=target,
            duration_seconds=3600.0,
            time_step_seconds=600.0,
        )
        assert result["summary"]["status"] == "completed"
        assert result["summary"]["total_steps"] > 0
        assert len(result["telemetry"]) > 0
        assert len(result["events"]) > 0

    def test_telemetry_fields(self):
        engine = SimulationEngine()
        result = engine.run_to_completion(
            mission_id="test-002",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=1800.0,
            time_step_seconds=600.0,
        )
        for t in result["telemetry"]:
            assert "robot_position" in t
            assert "target_position" in t
            assert "distance_km" in t
            assert "time_seconds" in t
            assert len(t["robot_position"]) == 3
            assert len(t["target_position"]) == 3

    def test_events_generated(self):
        engine = SimulationEngine()
        result = engine.run_to_completion(
            mission_id="test-003",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(400.0),
            duration_seconds=3600.0,
            time_step_seconds=600.0,
        )
        event_types = [e["event_type"] for e in result["events"]]
        assert "SIMULATION_COMPLETED" in event_types

    def test_pause_resume(self):
        sim = SimulationState(
            mission_id="test-004",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=3600.0,
            time_step_seconds=600.0,
        )
        sim.advance()
        assert sim.status == "running"
        sim.pause()
        assert sim.status == "paused"
        result = sim.advance()
        assert result["status"] == "paused"
        sim.resume()
        assert sim.status == "running"

    def test_abort(self):
        sim = SimulationState(
            mission_id="test-005",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=3600.0,
            time_step_seconds=600.0,
        )
        sim.advance()
        sim.abort()
        assert sim.status == "aborted"
        event_types = [e["event_type"] for e in sim.events]
        assert "SIMULATION_ABORTED" in event_types

    def test_time_scale(self):
        engine = SimulationEngine()
        result_fast = engine.run_to_completion(
            mission_id="test-fast",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=3600.0,
            time_step_seconds=600.0,
            time_scale=10.0,
        )
        result_slow = engine.run_to_completion(
            mission_id="test-slow",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=3600.0,
            time_step_seconds=600.0,
            time_scale=1.0,
        )
        # Fast should have fewer steps (larger steps due to time_scale)
        assert result_slow["summary"]["total_steps"] > result_fast["summary"]["total_steps"]
        # Total time should be at least the duration (may overshoot by one step)
        assert result_fast["summary"]["total_time_seconds"] >= 3600.0
        assert result_slow["summary"]["total_time_seconds"] >= 3600.0

    def test_summary_fields(self):
        engine = SimulationEngine()
        result = engine.run_to_completion(
            mission_id="test-006",
            robot_state=_leo_state(400.0),
            target_state=_leo_state(450.0),
            duration_seconds=600.0,
            time_step_seconds=600.0,
        )
        summary = result["summary"]
        assert summary["mission_id"] == "test-006"
        assert summary["status"] == "completed"
        assert summary["total_steps"] == 1
        assert summary["telemetry_count"] == 1
        assert summary["final_robot_altitude_km"] > 0
        assert summary["final_target_altitude_km"] > 0


class TestSimulationAPI:
    @pytest.mark.asyncio
    async def test_simulation_endpoint(self):
        import math
        from httpx import AsyncClient, ASGITransport
        from app.main import app
        from app.models.schemas import EARTH_MU_KM3_S2

        r = 6771.0
        v = math.sqrt(EARTH_MU_KM3_S2 / r)
        payload = {
            "mission_id": "api-test-001",
            "robot_state": {"position_km": [r, 0, 0], "velocity_kms": [0, v, 0]},
            "target_state": {"position_km": [r + 50, 0, 0], "velocity_kms": [0, v * 0.99, 0]},
            "duration_seconds": 1800.0,
            "time_step_seconds": 600.0,
        }
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post("/simulation/run", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["summary"]["status"] == "completed"
        assert len(data["telemetry"]) > 0
