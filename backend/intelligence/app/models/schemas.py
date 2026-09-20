"""Pydantic models for orbital mechanics, trajectory, and risk calculations."""
from __future__ import annotations

import math
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EARTH_RADIUS_KM = 6371.0
EARTH_MU_KM3_S2 = 398600.4418  # km^3/s^2  (standard gravitational parameter)
EARTH_MU_M3_S2 = 3.986004418e14  # m^3/s^2
LEO_ALTITUDE_KM = 2000.0
GEO_ALTITUDE_KM = 35786.0


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class OrbitType(str, Enum):
    LEO = "LEO"
    MEO = "MEO"
    GEO = "GEO"
    HEO = "HEO"
    CISLUNAR = "cislunar"
    INTERPLANETARY = "interplanetary"


class ManeuverType(str, Enum):
    HOHMANN = "hohmann"
    BI_ELLIPTIC = "bi_elliptic"
    PHASING = "phasing"
    RAISE = "raise"
    LOWER = "lower"
    PLANESCHANGE = "plane_change"


# ---------------------------------------------------------------------------
# Orbital State
# ---------------------------------------------------------------------------
class OrbitalState(BaseModel):
    """Position and velocity state vectors in ECI (Earth-Centered Inertial) frame."""
    position_km: tuple[float, float, float] = Field(
        ..., description="Position [x, y, z] in km (ECI)"
    )
    velocity_kms: tuple[float, float, float] = Field(
        ..., description="Velocity [vx, vy, vz] in km/s (ECI)"
    )
    epoch_seconds: float = Field(
        default=0.0, description="Time epoch in seconds since reference"
    )

    @property
    def radius_km(self) -> float:
        return math.sqrt(sum(c**2 for c in self.position_km))

    @property
    def speed_kms(self) -> float:
        return math.sqrt(sum(c**2 for c in self.velocity_kms))

    def altitude_km(self) -> float:
        return self.radius_km - EARTH_RADIUS_KM

    def orbital_energy(self) -> float:
        """Specific orbital energy (km^2/s^2). Negative for bound orbits."""
        r = self.radius_km
        v = self.speed_kms
        return (v**2) / 2.0 - EARTH_MU_KM3_S2 / r

    def angular_momentum(self) -> tuple[float, float, float]:
        """h = r x v (cross product), km^2/s."""
        px, py, pz = self.position_km
        vx, vy, vz = self.velocity_kms
        return (
            py * vz - pz * vy,
            pz * vx - px * vz,
            px * vy - py * vx,
        )

    def specific_angular_momentum_magnitude(self) -> float:
        h = self.angular_momentum()
        return math.sqrt(sum(c**2 for c in h))

    def semi_major_axis_km(self) -> float:
        energy = self.orbital_energy()
        if abs(energy) < 1e-12:
            return float("inf")
        return -EARTH_MU_KM3_S2 / (2.0 * energy)

    def eccentricity_vector(self) -> tuple[float, float, float]:
        """e = (v x h) / mu - r_hat"""
        h = self.angular_momentum()
        mu = EARTH_MU_KM3_S2
        px, py, pz = self.position_km
        vx, vy, vz = self.velocity_kms
        r = self.radius_km

        # v x h
        v_cross_h = (
            vy * h[2] - vz * h[1],
            vz * h[0] - vx * h[2],
            vx * h[1] - vy * h[0],
        )

        r_hat = (px / r, py / r, pz / r)
        return (
            v_cross_h[0] / mu - r_hat[0],
            v_cross_h[1] / mu - r_hat[1],
            v_cross_h[2] / mu - r_hat[2],
        )

    def eccentricity(self) -> float:
        e_vec = self.eccentricity_vector()
        return math.sqrt(sum(c**2 for c in e_vec))

    def inclination_rad(self) -> float:
        h = self.angular_momentum()
        hx, hy, hz = h
        h_mag = self.specific_angular_momentum_magnitude()
        if h_mag < 1e-12:
            return 0.0
        return math.acos(max(-1.0, min(1.0, hz / h_mag)))

    def period_seconds(self) -> float:
        a = self.semi_major_axis_km()
        if a <= 0 or math.isinf(a):
            return float("inf")
        return 2.0 * math.pi * math.sqrt(a**3 / EARTH_MU_KM3_S2)

    def orbit_type(self) -> OrbitType:
        alt = self.altitude_km()
        if alt < LEO_ALTITUDE_KM:
            return OrbitType.LEO
        elif alt < GEO_ALTITUDE_KM:
            return OrbitType.MEO
        else:
            return OrbitType.GEO


# ---------------------------------------------------------------------------
# Trajectory
# ---------------------------------------------------------------------------
class Waypoint(BaseModel):
    position_km: tuple[float, float, float]
    velocity_kms: tuple[float, float, float]
    time_seconds: float
    label: str = ""


class TrajectoryPlanRequest(BaseModel):
    robot_state: OrbitalState
    target_state: OrbitalState
    max_delta_v_ms: float = Field(default=500.0, ge=0.1, description="Max delta-v budget in m/s")
    time_budget_seconds: float = Field(default=86400.0, ge=1.0, description="Max time budget in seconds")
    num_waypoints: int = Field(default=5, ge=2, le=50, description="Number of interpolation waypoints")


class TrajectoryPlanResponse(BaseModel):
    trajectory: list[Waypoint]
    duration_seconds: float
    delta_v_ms: float
    fuel_estimate_kg: float
    feasible: bool
    reason: str = ""
    maneuver_type: str = ""
    semi_major_axis_km: float = 0.0
    eccentricity: float = 0.0
    inclination_deg: float = 0.0


# ---------------------------------------------------------------------------
# Risk / Collision
# ---------------------------------------------------------------------------
class CollisionRiskRequest(BaseModel):
    object_a: OrbitalState
    object_b: OrbitalState
    time_horizon_seconds: float = Field(
        default=3600.0, ge=1.0, le=86400.0, description="Propagation time horizon"
    )
    time_step_seconds: float = Field(
        default=60.0, ge=1.0, le=3600.0, description="Propagation time step"
    )
    collision_radius_km: float = Field(
        default=10.0, ge=0.001, le=1000.0, description="Collision threshold distance"
    )


class RiskLevel(str, Enum):
    NEGLIGIBLE = "negligible"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CollisionRiskResponse(BaseModel):
    risk_level: RiskLevel
    probability: float = Field(ge=0.0, le=1.0)
    minimum_distance_km: float
    time_to_closest_approach_seconds: float
    miss_velocity_kms: float
    propagation_steps: int
    object_a_positions: list[tuple[float, float, float]]
    object_b_positions: list[tuple[float, float, float]]
    distances_km: list[float]
    assessment: str


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    orbital_engine: str = "ok"
    trajectory_engine: str = "ok"
    risk_engine: str = "ok"
