"""Collision risk assessment engine.

Propagates two orbital states forward in time and computes
minimum approach distance and collision probability.

Deterministic — uses Keplerian propagation, not LLM.
Assumptions:
- Two-body Keplerian motion
- Collision probability based on miss distance and hard-body radius
- Gaussian uncertainty model for position (simplified)
"""
from __future__ import annotations

import math
from typing import Optional

from ..models.schemas import (
    CollisionRiskRequest,
    CollisionRiskResponse,
    OrbitalState,
    RiskLevel,
)
from ..orbital.engine import OrbitalEngine


class RiskEngine:
    """Orbital collision risk assessment engine."""

    def __init__(self):
        self.orbital = OrbitalEngine()

    def assess_collision_risk(self, request: CollisionRiskRequest) -> CollisionRiskResponse:
        """Assess collision risk between two objects over a time horizon.

        Algorithm:
        1. Propagate both objects at each time step
        2. Compute distance at each step
        3. Find minimum distance and time of closest approach
        4. Estimate collision probability from miss distance and hard-body radius
        5. Classify risk level
        """
        obj_a = request.object_a
        obj_b = request.object_b
        dt = request.time_step_seconds
        horizon = request.time_horizon_seconds
        r_collision = request.collision_radius_km

        num_steps = max(1, int(horizon / dt))
        distances: list[float] = []
        positions_a: list[tuple[float, float, float]] = []
        positions_b: list[tuple[float, float, float]] = []

        min_dist = float("inf")
        tca = 0.0
        miss_vel = 0.0

        for step in range(num_steps + 1):
            t = step * dt

            # Propagate both objects
            pa = self.orbital.propagate(obj_a, t)
            pb = self.orbital.propagate(obj_b, t)

            positions_a.append(pa.position_km)
            positions_b.append(pb.position_km)

            # Distance at this step
            d = self.orbital.distance_between(pa, pb)
            distances.append(d)

            if d < min_dist:
                min_dist = d
                tca = t
                # Relative speed at closest approach
                miss_vel = abs(pa.speed_kms - pb.speed_kms)

        # Collision probability estimation
        # Using a simplified model based on overlap of uncertainty volumes
        # With hard-body radius R and miss distance d:
        # P = R / (R + d)  (deterministic approximation)
        # For d >> R: P ≈ 0, for d << R: P ≈ 1
        if min_dist < r_collision:
            probability = 1.0 - (min_dist / r_collision) if r_collision > 0 else 1.0
        else:
            # Exponential decay of probability with distance
            # P ~ exp(-d / R) gives a smooth falloff
            probability = math.exp(-min_dist / r_collision) if r_collision > 0 else 0.0

        probability = min(1.0, max(0.0, probability))

        # Risk classification
        risk_level = self._classify_risk(probability, min_dist, r_collision)

        # Assessment text
        assessment = self._generate_assessment(
            risk_level, probability, min_dist, tca, miss_vel
        )

        return CollisionRiskResponse(
            risk_level=risk_level,
            probability=probability,
            minimum_distance_km=min_dist,
            time_to_closest_approach_seconds=tca,
            miss_velocity_kms=miss_vel,
            propagation_steps=num_steps + 1,
            object_a_positions=positions_a,
            object_b_positions=positions_b,
            distances_km=distances,
            assessment=assessment,
        )

    def _classify_risk(
        self, probability: float, miss_dist: float, r_collision: float
    ) -> RiskLevel:
        """Classify risk level based on probability and miss distance."""
        if probability >= 0.5 or miss_dist < r_collision:
            return RiskLevel.CRITICAL
        elif probability >= 0.1:
            return RiskLevel.HIGH
        elif probability >= 0.01:
            return RiskLevel.MEDIUM
        elif probability >= 0.001:
            return RiskLevel.LOW
        else:
            return RiskLevel.NEGLIGIBLE

    def _generate_assessment(
        self,
        risk_level: RiskLevel,
        probability: float,
        min_dist: float,
        tca: float,
        miss_vel: float,
    ) -> str:
        """Generate human-readable risk assessment."""
        tca_hours = tca / 3600.0
        parts = [
            f"Collision risk assessed as {risk_level.value.upper()}.",
            f"Minimum approach distance: {min_dist:.2f} km at TCA = {tca_hours:.2f} hours.",
            f"Miss velocity: {miss_vel:.4f} km/s.",
            f"Estimated collision probability: {probability:.6f}.",
        ]

        if risk_level == RiskLevel.CRITICAL:
            parts.append("Immediate collision avoidance maneuver recommended.")
        elif risk_level == RiskLevel.HIGH:
            parts.append("Collision avoidance maneuver should be planned within 24 hours.")
        elif risk_level == RiskLevel.MEDIUM:
            parts.append("Monitor closely; prepare contingency maneuvers.")
        elif risk_level == RiskLevel.LOW:
            parts.append("No immediate action required; continue monitoring.")
        else:
            parts.append("Risk is negligible; standard tracking sufficient.")

        return " ".join(parts)
