"""Tests for trajectory planning."""
import math
import pytest

from app.models.schemas import OrbitalState, TrajectoryPlanRequest, EARTH_MU_KM3_S2
from app.trajectory.planner import TrajectoryPlanner


@pytest.fixture
def planner():
    return TrajectoryPlanner()


class TestTrajectoryPlan:
    """Test trajectory planning."""

    def _leo_state(self, alt_km: float = 400.0) -> OrbitalState:
        r = 6371.0 + alt_km
        v = math.sqrt(EARTH_MU_KM3_S2 / r)
        return OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v, 0.0))

    def test_same_orbit_zero_dv(self, planner):
        """Transfer to same orbit should have zero (or near-zero) delta-v."""
        state = self._leo_state(400.0)
        req = TrajectoryPlanRequest(robot_state=state, target_state=state)
        result = planner.plan(req)
        assert result.delta_v_ms == pytest.approx(0.0, abs=1.0)
        assert result.feasible is True

    def test_leo_to_higher_orbit(self, planner):
        """Transfer to higher orbit should require positive delta-v."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(robot_state=robot, target_state=target)
        result = planner.plan(req)
        assert result.delta_v_ms > 0
        assert result.duration_seconds > 0
        assert len(result.trajectory) == 5

    def test_waypoint_count(self, planner):
        """Should return requested number of waypoints."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(robot_state=robot, target_state=target, num_waypoints=10)
        result = planner.plan(req)
        assert len(result.trajectory) == 10

    def test_waypoint_labels(self, planner):
        """First waypoint should be 'departure', last should be 'arrival'."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(robot_state=robot, target_state=target)
        result = planner.plan(req)
        assert result.trajectory[0].label == "departure"
        assert result.trajectory[-1].label == "arrival"

    def test_fuel_estimate_positive(self, planner):
        """Fuel estimate should be positive for non-zero delta-v."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(robot_state=robot, target_state=target)
        result = planner.plan(req)
        assert result.fuel_estimate_kg >= 0

    def test_infeasible_when_budget_exceeded(self, planner):
        """Should report infeasible when delta-v exceeds budget."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(
            robot_state=robot, target_state=target, max_delta_v_ms=1.0  # very low budget
        )
        result = planner.plan(req)
        assert result.feasible is False
        assert "exceeds budget" in result.reason

    def test_transfer_orbit_elements(self, planner):
        """Transfer orbit should have semi-major axis and eccentricity."""
        robot = self._leo_state(400.0)
        target = self._leo_state(800.0)
        req = TrajectoryPlanRequest(robot_state=robot, target_state=target)
        result = planner.plan(req)
        assert result.semi_major_axis_km > 0
        assert 0.0 <= result.eccentricity < 1.0
