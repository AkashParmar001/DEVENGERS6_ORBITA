"""Deterministic orbital simulation engine.

Simulates spacecraft motion along planned trajectories,
generating telemetry data and mission events at each time step.

No LLM or random computation — pure Keplerian mechanics.
"""
from __future__ import annotations

import math
from typing import Optional

from ..models.schemas import OrbitalState, EARTH_MU_KM3_S2
from ..orbital.engine import OrbitalEngine


class SimulationState:
    """Current state of a running simulation."""

    def __init__(
        self,
        mission_id: str,
        robot_state: OrbitalState,
        target_state: OrbitalState,
        duration_seconds: float,
        time_scale: float = 1.0,
        time_step_seconds: float = 60.0,
    ):
        self.mission_id = mission_id
        self.initial_robot = robot_state
        self.initial_target = target_state
        self.duration = duration_seconds
        self.time_scale = time_scale
        self.time_step = time_step_seconds

        self.current_time = 0.0
        self.robot_state = robot_state
        self.target_state = target_state
        self.status = "running"
        self.telemetry: list[dict] = []
        self.events: list[dict] = []
        self.step_count = 0

        self.orbital = OrbitalEngine()

    def advance(self) -> dict:
        """Advance simulation by one time step. Returns step data."""
        if self.status != "running":
            return {"status": self.status, "time": self.current_time}

        self.step_count += 1
        dt = self.time_step * self.time_scale

        # Propagate both objects
        self.robot_state = self.orbital.propagate(self.robot_state, dt)
        self.target_state = self.orbital.propagate(self.target_state, dt)
        self.current_time += dt

        # Compute relative state
        rel = self.orbital.relative_state(self.robot_state, self.target_state)

        # Distance between objects
        distance = self.orbital.distance_between(self.robot_state, self.target_state)

        # Generate telemetry record
        telemetry = {
            "step": self.step_count,
            "time_seconds": self.current_time,
            "robot_position": list(self.robot_state.position_km),
            "robot_velocity": list(self.robot_state.velocity_kms),
            "robot_altitude_km": self.robot_state.altitude_km(),
            "robot_speed_kms": self.robot_state.speed_kms,
            "target_position": list(self.target_state.position_km),
            "target_velocity": list(self.target_state.velocity_kms),
            "target_altitude_km": self.target_state.altitude_km(),
            "distance_km": distance,
            "relative_distance_km": rel["distance_km"],
            "relative_speed_kms": rel["relative_speed_kms"],
        }
        self.telemetry.append(telemetry)

        # Generate events at key moments
        self._check_events(distance, rel)

        # Check completion
        if self.current_time >= self.duration:
            self.status = "completed"
            self.events.append({
                "time_seconds": self.current_time,
                "event_type": "SIMULATION_COMPLETED",
                "severity": "success",
                "title": f"Simulation completed after {self.step_count} steps",
            })

        return {
            "status": self.status,
            "time": self.current_time,
            "step": self.step_count,
            "distance_km": distance,
            "robot_altitude_km": self.robot_state.altitude_km(),
            "target_altitude_km": self.target_state.altitude_km(),
        }

    def _check_events(self, distance: float, rel: dict):
        """Generate events at mission-critical moments."""
        # Proximity events
        if distance < 10.0 and not any(e["event_type"] == "PROXIMITY_REACHED" for e in self.events):
            self.events.append({
                "time_seconds": self.current_time,
                "event_type": "PROXIMITY_REACHED",
                "severity": "info",
                "title": f"Reached proximity: {distance:.2f} km from target",
            })

        if distance < 5.0 and not any(e["event_type"] == "INSPECTION_RANGE" for e in self.events):
            self.events.append({
                "time_seconds": self.current_time,
                "event_type": "INSPECTION_RANGE",
                "severity": "info",
                "title": f"Entered inspection range: {distance:.2f} km",
            })

        # Checkpoint events every 10%
        pct = self.current_time / self.duration * 100
        checkpoint = int(pct / 10) * 10
        if pct >= checkpoint and not any(
            e.get("checkpoint") == checkpoint for e in self.events
        ):
            self.events.append({
                "time_seconds": self.current_time,
                "event_type": "PROGRESS_CHECKPOINT",
                "severity": "info",
                "title": f"Mission {checkpoint}% complete",
                "checkpoint": checkpoint,
            })

    def pause(self):
        self.status = "paused"

    def resume(self):
        if self.status == "paused":
            self.status = "running"

    def abort(self):
        self.status = "aborted"
        self.events.append({
            "time_seconds": self.current_time,
            "event_type": "SIMULATION_ABORTED",
            "severity": "warning",
            "title": f"Simulation aborted at step {self.step_count}",
        })

    def get_summary(self) -> dict:
        return {
            "mission_id": self.mission_id,
            "status": self.status,
            "total_steps": self.step_count,
            "total_time_seconds": self.current_time,
            "final_distance_km": self.orbital.distance_between(self.robot_state, self.target_state) if self.step_count > 0 else None,
            "final_robot_altitude_km": self.robot_state.altitude_km(),
            "final_target_altitude_km": self.target_state.altitude_km(),
            "telemetry_count": len(self.telemetry),
            "events_count": len(self.events),
        }


class SimulationEngine:
    """Manages simulation lifecycle."""

    def __init__(self):
        self.active_simulations: dict[str, SimulationState] = {}

    def start(
        self,
        mission_id: str,
        robot_state: OrbitalState,
        target_state: OrbitalState,
        duration_seconds: float,
        time_scale: float = 1.0,
        time_step_seconds: float = 60.0,
    ) -> SimulationState:
        sim = SimulationState(
            mission_id=mission_id,
            robot_state=robot_state,
            target_state=target_state,
            duration_seconds=duration_seconds,
            time_scale=time_scale,
            time_step_seconds=time_step_seconds,
        )
        self.active_simulations[mission_id] = sim
        return sim

    def get(self, mission_id: str) -> Optional[SimulationState]:
        return self.active_simulations.get(mission_id)

    def run_to_completion(
        self,
        mission_id: str,
        robot_state: OrbitalState,
        target_state: OrbitalState,
        duration_seconds: float,
        time_scale: float = 1.0,
        time_step_seconds: float = 60.0,
    ) -> dict:
        """Run simulation to completion and return full results."""
        sim = SimulationState(
            mission_id=mission_id,
            robot_state=robot_state,
            target_state=target_state,
            duration_seconds=duration_seconds,
            time_scale=time_scale,
            time_step_seconds=time_step_seconds,
        )

        while sim.status == "running":
            sim.advance()

        return {
            "summary": sim.get_summary(),
            "telemetry": sim.telemetry,
            "events": sim.events,
        }
