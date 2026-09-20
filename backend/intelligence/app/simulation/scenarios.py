"""Synthetic mission scenarios for testing.

Each scenario defines a complete mission with orbital states,
expected outcomes, and validation criteria.
"""
from __future__ import annotations

import math
from ..models.schemas import OrbitalState, EARTH_MU_KM3_S2, EARTH_RADIUS_KM


def _state(alt_km: float, lon_offset_deg: float = 0.0) -> OrbitalState:
    """Create a circular orbit state at given altitude."""
    r = EARTH_RADIUS_KM + alt_km
    v = math.sqrt(EARTH_MU_KM3_S2 / r)
    # Rotate position by longitude offset
    lon = math.radians(lon_offset_deg)
    x = r * math.cos(lon)
    y = r * math.sin(lon)
    vx = -v * math.sin(lon)
    vy = v * math.cos(lon)
    return OrbitalState(position_km=(x, y, 0.0), velocity_kms=(vx, vy, 0.0))


# ---------------------------------------------------------------------------
# Scenario 1: Satellite Inspection
# ---------------------------------------------------------------------------
SCENARIO_SATELLITE_INSPECTION = {
    "name": "SAT-102 INSPECTION",
    "objective": "Inspect satellite SAT-102 for structural damage using robot ORBITAL-03",
    "mission_type": "inspection",
    "robot_state": _state(400.0, 0.0),
    "target_state": _state(420.0, 10.0),
    "duration_seconds": 7200.0,
    "time_step_seconds": 300.0,
    "expected_events": ["MISSION_CREATED", "PLANNING_STARTED", "SIMULATION_STARTED", "MISSION_COMPLETED"],
    "max_delta_v_ms": 300.0,
    "min_telemetry_records": 10,
}

# ---------------------------------------------------------------------------
# Scenario 2: Collision Avoidance
# ---------------------------------------------------------------------------
SCENARIO_COLLISION_AVOIDANCE = {
    "name": "COLLISION AVOIDANCE - DEBRIS-047",
    "objective": "Avoid collision with debris DEBRIS-047 by maneuvering SAT-102 to safe orbit",
    "mission_type": "collision_avoidance",
    "robot_state": _state(400.0, 0.0),
    "target_state": _state(401.0, 2.0),  # Very close orbits
    "duration_seconds": 3600.0,
    "time_step_seconds": 60.0,
    "expected_events": ["COLLISION_RISK_ASSESSED", "MANEUVER_PLANNED", "SIMULATION_STARTED"],
    "max_delta_v_ms": 100.0,
    "min_telemetry_records": 30,
}

# ---------------------------------------------------------------------------
# Scenario 3: Debris Interception
# ---------------------------------------------------------------------------
SCENARIO_DEBRIS_INTERCEPTION = {
    "name": "DEBRIS INTERCEPT - DEBRIS-089",
    "objective": "Intercept and track debris DEBRIS-089 for cataloging",
    "mission_type": "debris_interception",
    "robot_state": _state(350.0, 0.0),
    "target_state": _state(500.0, 45.0),
    "duration_seconds": 14400.0,
    "time_step_seconds": 600.0,
    "expected_events": ["TRAJECTORY_CALCULATED", "SIMULATION_STARTED", "INTERCEPTION_ACHIEVED"],
    "max_delta_v_ms": 500.0,
    "min_telemetry_records": 15,
}

# ---------------------------------------------------------------------------
# Scenario 4: Damaged Satellite Inspection
# ---------------------------------------------------------------------------
SCENARIO_DAMAGED_SATELLITE = {
    "name": "DAMAGED SATELLITE ASSESSMENT - SAT-105",
    "objective": "Assess damage to SAT-105 and generate repair recommendations",
    "mission_type": "inspection",
    "robot_state": _state(450.0, 0.0),
    "target_state": _state(450.0, 15.0),
    "duration_seconds": 10800.0,
    "time_step_seconds": 300.0,
    "expected_events": ["MISSION_CREATED", "INSPECTION_PLANNED", "SIMULATION_STARTED", "REPORT_GENERATED"],
    "max_delta_v_ms": 400.0,
    "min_telemetry_records": 20,
}

ALL_SCENARIOS = {
    "satellite_inspection": SCENARIO_SATELLITE_INSPECTION,
    "collision_avoidance": SCENARIO_COLLISION_AVOIDANCE,
    "debris_interception": SCENARIO_DEBRIS_INTERCEPTION,
    "damaged_satellite": SCENARIO_DAMAGED_SATELLITE,
}
