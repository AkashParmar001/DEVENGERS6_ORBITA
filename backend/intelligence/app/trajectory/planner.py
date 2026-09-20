"""Trajectory planning engine.

Plans minimum-energy transfer trajectories between two orbital states.
Uses Keplerian mechanics (Hohmann / Lambert-style transfers).

Deterministic — no random or LLM-based computation.
"""
from __future__ import annotations

import math
from typing import Optional

from ..models.schemas import (
    EARTH_MU_KM3_S2,
    ManeuverType,
    OrbitalState,
    TrajectoryPlanRequest,
    TrajectoryPlanResponse,
    Waypoint,
)
from ..orbital.engine import OrbitalEngine, RAD_TO_DEG, DEG_TO_RAD


class TrajectoryPlanner:
    """Plans orbital transfer trajectories."""

    def __init__(self):
        self.orbital = OrbitalEngine()

    def plan(self, request: TrajectoryPlanRequest) -> TrajectoryPlanResponse:
        """Plan a trajectory from robot state to target state.

        Algorithm:
        1. Compute orbital elements for both states
        2. Determine transfer type (Hohmann if orbits are coplanar/circular-ish,
           otherwise use multi-impulse approximation)
        3. Compute Hohmann transfer parameters
        4. Interpolate waypoints along the transfer orbit
        5. Return trajectory, delta-v, fuel estimate, duration
        """
        robot = request.robot_state
        target = request.target_state

        # Orbital elements
        robot_kep = self.orbital.keplerian_from_state(robot)
        target_kep = self.orbital.keplerian_from_state(target)

        # Current orbital radii
        r1 = robot.radius_km
        r2 = target.radius_km

        # Inclination difference (determines if plane change needed)
        delta_incl = abs(robot_kep["inclination_deg"] - target_kep["inclination_deg"])

        # Compute Hohmann transfer for coplanar component
        hohmann = self.orbital.hohmann_transfer(r1, r2)

        # Add plane change delta-v if needed
        plane_change_dv = 0.0
        if delta_incl > 0.5:  # threshold in degrees
            # Plane change at intersection (simplified)
            v_avg = (hohmann["delta_v1_km_s"] + hohmann["delta_v2_km_s"]) / 2.0
            plane_change_dv = 2.0 * v_avg * math.sin(delta_incl * DEG_TO_RAD / 2.0)

        total_dv = hohmann["delta_v_ms"] + plane_change_dv * 1000.0

        # Check feasibility
        feasible = total_dv <= request.max_delta_v_ms
        reason = "" if feasible else f"Delta-v {total_dv:.1f} m/s exceeds budget {request.max_delta_v_ms} m/s"
        maneuver_type = ManeuverType.HOHMANN.value
        if delta_incl > 0.5:
            maneuver_type = ManeuverType.PLANESCHANGE.value

        # Generate waypoints along transfer orbit
        waypoints = self._generate_waypoints(
            robot=robot,
            target=target,
            transfer_time=hohmann["transfer_time_seconds"],
            num_waypoints=request.num_waypoints,
        )

        # Fuel estimate (Tsiolkovsky)
        ve_ms = 3000.0  # exhaust velocity m/s (bipropellant)
        if total_dv < ve_ms * 0.01:
            fuel_kg = 0.0
        else:
            mass_ratio = math.exp(total_dv / ve_ms)
            # Assume 100 kg spacecraft mass
            fuel_kg = 100.0 * (mass_ratio - 1.0) / mass_ratio

        return TrajectoryPlanResponse(
            trajectory=waypoints,
            duration_seconds=hohmann["transfer_time_seconds"],
            delta_v_ms=total_dv,
            fuel_estimate_kg=fuel_kg,
            feasible=feasible,
            reason=reason,
            maneuver_type=maneuver_type,
            semi_major_axis_km=hohmann["transfer_semi_major_axis_km"],
            eccentricity=self._compute_transfer_eccentricity(r1, r2),
            inclination_deg=max(robot_kep["inclination_deg"], target_kep["inclination_deg"]),
        )

    def _compute_transfer_eccentricity(self, r1: float, r2: float) -> float:
        """Eccentricity of Hohmann transfer ellipse: e = (r2 - r1) / (r2 + r1)."""
        return abs(r2 - r1) / (r2 + r1)

    def _generate_waypoints(
        self,
        robot: OrbitalState,
        target: OrbitalState,
        transfer_time: float,
        num_waypoints: int,
    ) -> list[Waypoint]:
        """Generate evenly-spaced waypoints along the transfer trajectory."""
        waypoints: list[Waypoint] = []

        for i in range(num_waypoints):
            t = (i / (num_waypoints - 1)) * transfer_time if num_waypoints > 1 else 0.0

            # Propagate robot along transfer orbit
            propagated = self.orbital.propagate(robot, t)

            # Blend toward target position as we approach arrival
            progress = i / (num_waypoints - 1) if num_waypoints > 1 else 0.0
            # Linear interpolation of position toward target
            pos = tuple(
                propagated.position_km[j] * (1.0 - progress) + target.position_km[j] * progress
                for j in range(3)
            )
            vel = tuple(
                propagated.velocity_kms[j] * (1.0 - progress) + target.velocity_kms[j] * progress
                for j in range(3)
            )

            label = "departure" if i == 0 else ("arrival" if i == num_waypoints - 1 else f"waypoint_{i}")

            waypoints.append(Waypoint(
                position_km=pos,
                velocity_kms=vel,
                time_seconds=t,
                label=label,
            ))

        return waypoints
