"""Tests for collision risk assessment."""
import math
import pytest

from app.models.schemas import OrbitalState, CollisionRiskRequest, RiskLevel
from app.risk.engine import RiskEngine


@pytest.fixture
def risk_engine():
    return RiskEngine()


class TestCollisionRisk:
    """Test collision risk assessment."""

    def _state(self, x: float, y: float, z: float, vx: float, vy: float, vz: float) -> OrbitalState:
        return OrbitalState(position_km=(x, y, z), velocity_kms=(vx, vy, vz))

    def test_same_position_critical(self, risk_engine):
        """Same position should be CRITICAL risk."""
        s = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(object_a=s, object_b=s, time_horizon_seconds=60.0, time_step_seconds=10.0)
        result = risk_engine.assess_collision_risk(req)
        assert result.risk_level == RiskLevel.CRITICAL
        assert result.minimum_distance_km == pytest.approx(0.0, abs=1e-6)

    def test_far_apart_negligible(self, risk_engine):
        """Objects far apart should have NEGLIGIBLE risk."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(42000.0, 0.0, 0.0, 0.0, 3.0, 0.0)
        req = CollisionRiskRequest(object_a=s1, object_b=s2, time_horizon_seconds=3600.0, time_step_seconds=60.0)
        result = risk_engine.assess_collision_risk(req)
        assert result.risk_level == RiskLevel.NEGLIGIBLE
        assert result.minimum_distance_km > 10000.0

    def test_propagation_steps(self, risk_engine):
        """Should propagate correct number of steps."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(7010.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(
            object_a=s1, object_b=s2,
            time_horizon_seconds=600.0, time_step_seconds=60.0,
        )
        result = risk_engine.assess_collision_risk(req)
        assert result.propagation_steps == 11  # 600/60 + 1

    def test_positions_stored(self, risk_engine):
        """Should store position arrays for each object."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(7005.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(
            object_a=s1, object_b=s2,
            time_horizon_seconds=120.0, time_step_seconds=60.0,
        )
        result = risk_engine.assess_collision_risk(req)
        assert len(result.object_a_positions) == result.propagation_steps
        assert len(result.object_b_positions) == result.propagation_steps
        assert len(result.distances_km) == result.propagation_steps

    def test_probability_bounded(self, risk_engine):
        """Probability should be between 0 and 1."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(7001.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(object_a=s1, object_b=s2)
        result = risk_engine.assess_collision_risk(req)
        assert 0.0 <= result.probability <= 1.0

    def test_assessment_text(self, risk_engine):
        """Assessment should contain risk level text."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(7000.0, 10.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(object_a=s1, object_b=s2, time_horizon_seconds=60.0, time_step_seconds=10.0)
        result = risk_engine.assess_collision_risk(req)
        assert "risk" in result.assessment.lower()
        assert "distance" in result.assessment.lower()

    def test_close_approach_time(self, risk_engine):
        """TCA should be within the time horizon."""
        s1 = self._state(7000.0, 0.0, 0.0, 0.0, 7.5, 0.0)
        s2 = self._state(7000.0, 5.0, 0.0, 0.0, 7.5, 0.0)
        req = CollisionRiskRequest(
            object_a=s1, object_b=s2,
            time_horizon_seconds=3600.0, time_step_seconds=60.0,
        )
        result = risk_engine.assess_collision_risk(req)
        assert 0.0 <= result.time_to_closest_approach_seconds <= 3600.0
