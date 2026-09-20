"""Tests for orbital mechanics engine.

All tests use deterministic inputs with known analytical solutions.
"""
import math
import pytest

from app.models.schemas import OrbitalState, EARTH_MU_KM3_S2, EARTH_RADIUS_KM
from app.orbital.engine import OrbitalEngine


@pytest.fixture
def engine():
    return OrbitalEngine()


class TestOrbitalState:
    """Test OrbitalState computed properties."""

    def test_radius(self):
        state = OrbitalState(position_km=(7000.0, 0.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        assert state.radius_km == pytest.approx(7000.0)

    def test_speed(self):
        state = OrbitalState(position_km=(7000.0, 0.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        assert state.speed_kms == pytest.approx(7.5)

    def test_altitude(self):
        state = OrbitalState(position_km=(EARTH_RADIUS_KM + 400.0, 0.0, 0.0), velocity_kms=(0.0, 7.67, 0.0))
        assert state.altitude_km() == pytest.approx(400.0, rel=1e-6)

    def test_orbital_energy_negative_bound(self):
        # Circular LEO orbit: energy should be negative
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / 6771.0)  # ~400 km altitude
        state = OrbitalState(position_km=(6771.0, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        assert state.orbital_energy() < 0

    def test_angular_momentum(self):
        state = OrbitalState(position_km=(7000.0, 0.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        h = state.angular_momentum()
        # h = r x v = (7000,0,0) x (0,7.5,0) = (0, 0, 7000*7.5)
        assert h[0] == pytest.approx(0.0, abs=1e-10)
        assert h[1] == pytest.approx(0.0, abs=1e-10)
        assert h[2] == pytest.approx(7000.0 * 7.5)

    def test_circular_orbit_eccentricity_zero(self):
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / 6771.0)
        state = OrbitalState(position_km=(6771.0, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        assert state.eccentricity() == pytest.approx(0.0, abs=1e-6)

    def test_circular_orbit_period(self):
        r = 6771.0
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / r)
        state = OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        expected_period = 2.0 * math.pi * math.sqrt(r**3 / EARTH_MU_KM3_S2)
        assert state.period_seconds() == pytest.approx(expected_period, rel=1e-6)


class TestKeplerianConversion:
    """Test conversion between Cartesian and Keplerian elements."""

    def test_roundtrip_circular(self, engine):
        """Cartesian -> Keplerian -> Cartesian should preserve state (circular orbit)."""
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / 6771.0)
        original = OrbitalState(position_km=(6771.0, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))

        kep = engine.keplerian_from_state(original)
        reconstructed = engine.state_from_keplerian(
            a_km=kep["semi_major_axis_km"],
            e=kep["eccentricity"],
            incl_deg=kep["inclination_deg"],
            raan_deg=kep["raan_deg"],
            argp_deg=kep["argp_deg"],
            true_anomaly_deg=kep["true_anomaly_deg"],
        )

        for i in range(3):
            assert reconstructed.position_km[i] == pytest.approx(original.position_km[i], rel=1e-6)
            assert reconstructed.velocity_kms[i] == pytest.approx(original.velocity_kms[i], rel=1e-6)

    def test_roundtrip_elliptical(self, engine):
        """Cartesian -> Keplerian -> Cartesian for eccentric orbit."""
        a = 8000.0
        e = 0.3
        v_peri = math.sqrt(EARTH_MU_KM3_S2 * (2.0 / (a * (1.0 - e)) - 1.0 / a))
        r_peri = a * (1.0 - e)
        original = OrbitalState(position_km=(r_peri, 0.0, 0.0), velocity_kms=(0.0, v_peri, 0.0))

        kep = engine.keplerian_from_state(original)
        reconstructed = engine.state_from_keplerian(
            a_km=kep["semi_major_axis_km"],
            e=kep["eccentricity"],
            incl_deg=kep["inclination_deg"],
            raan_deg=kep["raan_deg"],
            argp_deg=kep["argp_deg"],
            true_anomaly_deg=kep["true_anomaly_deg"],
        )

        for i in range(3):
            assert reconstructed.position_km[i] == pytest.approx(original.position_km[i], rel=1e-4)
            assert reconstructed.velocity_kms[i] == pytest.approx(original.velocity_kms[i], rel=1e-4)


class TestKeplerEquation:
    """Test Kepler's equation solver."""

    def test_zero_eccentricity(self, engine):
        """Circular orbit: M = E (eccentric anomaly equals mean anomaly)."""
        for M in [0.0, 0.5, 1.0, math.pi, 2.0 * math.pi - 0.01]:
            E = engine.solve_kepler_equation(M, 0.0)
            assert E == pytest.approx(M, abs=1e-10)

    def test_small_eccentricity(self, engine):
        """Near-circular: solution should be close to M."""
        e = 0.1
        M = 1.5
        E = engine.solve_kepler_equation(M, e)
        residual = E - e * math.sin(E) - M
        assert residual == pytest.approx(0.0, abs=1e-12)

    def test_high_eccentricity(self, engine):
        """Eccentric orbit: solution should satisfy M = E - e*sin(E)."""
        e = 0.8
        M = 2.0
        E = engine.solve_kepler_equation(M, e)
        residual = E - e * math.sin(E) - M
        assert residual == pytest.approx(0.0, abs=1e-12)

    def test_mean_anomaly_wrap(self, engine):
        """Mean anomaly outside [0, 2π] should still produce valid solution."""
        e = 0.5
        M = 3.0 * math.pi  # > 2π
        E = engine.solve_kepler_equation(M, e)
        residual = E - e * math.sin(E) - (M % (2.0 * math.pi))
        assert residual == pytest.approx(0.0, abs=1e-10)


class TestPropagation:
    """Test orbital propagation."""

    def test_circular_orbit_one_period(self, engine):
        """After exactly one period, a circular orbit should return to start."""
        r = 6771.0
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / r)
        state = OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        period = state.period_seconds()

        propagated = engine.propagate(state, period)

        for i in range(3):
            assert propagated.position_km[i] == pytest.approx(state.position_km[i], rel=1e-4)
            assert propagated.velocity_kms[i] == pytest.approx(state.velocity_kms[i], rel=1e-4)

    def test_circular_orbit_half_period(self, engine):
        """After half a period, should be diametrically opposite."""
        r = 6771.0
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / r)
        state = OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        period = state.period_seconds()

        propagated = engine.propagate(state, period / 2.0)

        assert propagated.position_km[0] == pytest.approx(-r, rel=1e-4)
        assert abs(propagated.position_km[1]) < 1.0  # near zero
        assert abs(propagated.position_km[2]) < 1.0

    def test_position_at(self, engine):
        """position_at returns correct position at time t."""
        r = 6771.0
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / r)
        state = OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))

        pos = engine.position_at(state, 0.0)
        for i in range(3):
            assert pos[i] == pytest.approx(state.position_km[i], abs=1e-6)

    def test_velocity_at(self, engine):
        """velocity_at returns correct velocity at time t."""
        r = 6771.0
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / r)
        state = OrbitalState(position_km=(r, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))

        vel = engine.velocity_at(state, 0.0)
        for i in range(3):
            assert vel[i] == pytest.approx(state.velocity_kms[i], abs=1e-6)


class TestHohmannTransfer:
    """Test Hohmann transfer calculations."""

    def test_same_orbit_zero_dv(self, engine):
        """Transfer to same orbit requires zero delta-v."""
        r = 6771.0
        result = engine.hohmann_transfer(r, r)
        assert result["delta_v_ms"] == pytest.approx(0.0, abs=1e-6)

    def test_leo_to_geo(self, engine):
        """LEO to GEO transfer should have reasonable delta-v (~3.9 km/s)."""
        r_leo = EARTH_RADIUS_KM + 400.0
        r_geo = EARTH_RADIUS_KM + 35786.0
        result = engine.hohmann_transfer(r_leo, r_geo)
        # Known value: ~3.9 km/s total
        assert 3500.0 < result["delta_v_ms"] < 4500.0
        assert result["maneuver_type"] == "hohmann"

    def test_transfer_time_positive(self, engine):
        """Transfer time should always be positive."""
        result = engine.hohmann_transfer(6771.0, 42164.0)
        assert result["transfer_time_seconds"] > 0
        assert result["transfer_time_hours"] > 0

    def test_negative_radius_raises(self, engine):
        """Negative radius should raise ValueError."""
        with pytest.raises(ValueError):
            engine.hohmann_transfer(-1000.0, 6771.0)


class TestRelativeState:
    """Test relative state computation."""

    def test_same_orbit_zero_relative(self, engine):
        """Same state should have zero relative distance."""
        v_circ = math.sqrt(EARTH_MU_KM3_S2 / 6771.0)
        state = OrbitalState(position_km=(6771.0, 0.0, 0.0), velocity_kms=(0.0, v_circ, 0.0))
        rel = engine.relative_state(state, state)
        assert rel["distance_km"] == pytest.approx(0.0, abs=1e-6)
        assert rel["relative_speed_kms"] == pytest.approx(0.0, abs=1e-6)

    def test_different_orbits_nonzero(self, engine):
        """Different orbits should have nonzero relative distance."""
        v1 = math.sqrt(EARTH_MU_KM3_S2 / 6771.0)
        v2 = math.sqrt(EARTH_MU_KM3_S2 / 7071.0)
        s1 = OrbitalState(position_km=(6771.0, 0.0, 0.0), velocity_kms=(0.0, v1, 0.0))
        s2 = OrbitalState(position_km=(7071.0, 0.0, 0.0), velocity_kms=(0.0, v2, 0.0))
        rel = engine.relative_state(s1, s2)
        assert rel["distance_km"] > 0


class TestDistance:
    """Test distance computation."""

    def test_zero_distance(self, engine):
        state = OrbitalState(position_km=(7000.0, 0.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        assert engine.distance_between(state, state) == pytest.approx(0.0)

    def test_known_distance(self, engine):
        s1 = OrbitalState(position_km=(7000.0, 0.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        s2 = OrbitalState(position_km=(7003.0, 4.0, 0.0), velocity_kms=(0.0, 7.5, 0.0))
        assert engine.distance_between(s1, s2) == pytest.approx(5.0)
