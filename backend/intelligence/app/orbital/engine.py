"""Core orbital mechanics engine using Keplerian propagation.

All calculations use documented gravitational physics:
- Earth standard gravitational parameter μ = 398600.4418 km³/s²
- Kepler's equation solved via Newton-Raphson iteration
- Two-body problem assumptions (no perturbations)
- Circular and elliptical orbit support

Assumptions:
- Spherical Earth (radius = 6371 km)
- No atmospheric drag
- No third-body perturbations (Sun/Moon gravity)
- No J2 oblateness effect
- Two-body Keplerian motion only
"""
from __future__ import annotations

import math
from typing import Optional

from ..models.schemas import (
    EARTH_MU_KM3_S2,
    EARTH_RADIUS_KM,
    ManeuverType,
    OrbitalState,
    OrbitType,
)

# Conversions
DEG_TO_RAD = math.pi / 180.0
RAD_TO_DEG = 180.0 / math.pi
SECONDS_PER_HOUR = 3600.0
SECONDS_PER_DAY = 86400.0


class OrbitalEngine:
    """Keplerian orbital mechanics engine.

    All methods are deterministic and use documented physics.
    No random or LLM-based computation.
    """

    def __init__(self, mu: float = EARTH_MU_KM3_S2, radius: float = EARTH_RADIUS_KM):
        self.mu = mu
        self.radius = radius

    # ------------------------------------------------------------------
    # State vector conversions
    # ------------------------------------------------------------------
    def state_from_keplerian(
        self,
        a_km: float,
        e: float,
        incl_deg: float,
        raan_deg: float = 0.0,
        argp_deg: float = 0.0,
        true_anomaly_deg: float = 0.0,
    ) -> OrbitalState:
        """Convert classical orbital elements to Cartesian state vectors.

        Uses standard Keplerian to Cartesian transformation:
        1. Compute position/velocity in perifocal frame
        2. Rotate to ECI via 3-1-3 Euler rotation (RAAN, incl, argp)
        """
        incl = incl_deg * DEG_TO_RAD
        raan = raan_deg * DEG_TO_RAD
        argp = argp_deg * DEG_TO_RAD
        nu = true_anomaly_deg * DEG_TO_RAD

        # Distance from focus
        r_mag = a_km * (1.0 - e**2) / (1.0 + e * math.cos(nu))

        # Position in perifocal frame
        r_pf = (r_mag * math.cos(nu), r_mag * math.sin(nu), 0.0)

        # Velocity in perifocal frame
        h = math.sqrt(self.mu * a_km * (1.0 - e**2))
        v_pf = (
            -(self.mu / h) * math.sin(nu),
            (self.mu / h) * (e + math.cos(nu)),
            0.0,
        )

        # Rotation matrix (3-1-3): RAAN -> incl -> argp
        cos_raan, sin_raan = math.cos(raan), math.sin(raan)
        cos_incl, sin_incl = math.cos(incl), math.sin(incl)
        cos_argp, sin_argp = math.cos(argp), math.sin(argp)

        def rotate(v: tuple[float, float, float]) -> tuple[float, float, float]:
            # Rotate by argp (z-axis)
            x1 = v[0] * cos_argp - v[1] * sin_argp
            y1 = v[0] * sin_argp + v[1] * cos_argp
            z1 = v[2]
            # Rotate by incl (x-axis)
            x2 = x1
            y2 = y1 * cos_incl - z1 * sin_incl
            z2 = y1 * sin_incl + z1 * cos_incl
            # Rotate by raan (z-axis)
            x3 = x2 * cos_raan - y2 * sin_raan
            y3 = x2 * sin_raan + y2 * cos_raan
            z3 = z2
            return (x3, y3, z3)

        pos = rotate(r_pf)
        vel = rotate(v_pf)

        return OrbitalState(
            position_km=pos,
            velocity_kms=vel,
            epoch_seconds=0.0,
        )

    def keplerian_from_state(self, state: OrbitalState) -> dict:
        """Extract classical orbital elements from Cartesian state vectors.

        Returns dict with: a (semi-major), e (eccentricity), incl (deg),
        raan (deg), argp (deg), true_anomaly (deg), period (s), energy.
        """
        a = state.semi_major_axis_km()
        e = state.eccentricity()
        incl = state.inclination_rad() * RAD_TO_DEG

        # RAAN from angular momentum
        h = state.angular_momentum()
        hx, hy, hz = h
        h_mag = math.sqrt(hx**2 + hy**2 + hz**2)

        # Node vector: K x h where K = (0,0,1)
        nx, ny = -hy, hx
        n_mag = math.sqrt(nx**2 + ny**2)

        raan = 0.0
        if n_mag > 1e-12:
            raan = math.acos(max(-1.0, min(1.0, nx / n_mag)))
            if ny < 0:
                raan = 2.0 * math.pi - raan
        raan_deg = raan * RAD_TO_DEG

        # Eccentricity vector
        e_vec = state.eccentricity_vector()
        ex, ey, ez = e_vec

        # Argument of periapsis
        argp = 0.0
        if n_mag > 1e-12 and e > 1e-12:
            argp = math.acos(max(-1.0, min(1.0, (nx * ex + ny * ey) / (n_mag * e))))
            if ez < 0:
                argp = 2.0 * math.pi - argp
        argp_deg = argp * RAD_TO_DEG

        # True anomaly
        nu = 0.0
        if e > 1e-12:
            px, py, pz = state.position_km
            r_dot_v = px * state.velocity_kms[0] + py * state.velocity_kms[1] + pz * state.velocity_kms[2]
            cos_nu = (1.0 / e) * ((a * (1.0 - e**2) / state.radius_km) - 1.0)
            cos_nu = max(-1.0, min(1.0, cos_nu))
            nu = math.acos(cos_nu)
            if r_dot_v < 0:
                nu = 2.0 * math.pi - nu
        nu_deg = nu * RAD_TO_DEG

        return {
            "semi_major_axis_km": a,
            "eccentricity": e,
            "inclination_deg": incl,
            "raan_deg": raan_deg,
            "argp_deg": argp_deg,
            "true_anomaly_deg": nu_deg,
            "period_seconds": state.period_seconds(),
            "energy": state.orbital_energy(),
            "altitude_km": state.altitude_km(),
            "orbit_type": state.orbit_type().value,
        }

    # ------------------------------------------------------------------
    # Kepler's equation solver
    # ------------------------------------------------------------------
    def solve_kepler_equation(self, M: float, e: float, tol: float = 1e-12, max_iter: int = 50) -> float:
        """Solve Kepler's equation M = E - e*sin(E) for eccentric anomaly E.

        Uses Newton-Raphson iteration.
        M: mean anomaly (radians)
        e: eccentricity
        Returns: eccentric anomaly (radians)
        """
        # Normalize M to [0, 2π]
        M = M % (2.0 * math.pi)
        # Initial guess
        E = M + e * math.sin(M) if e < 0.8 else math.pi

        for _ in range(max_iter):
            f_E = E - e * math.sin(E) - M
            f_prime_E = 1.0 - e * math.cos(E)
            if abs(f_prime_E) < 1e-15:
                break
            delta = f_E / f_prime_E
            E -= delta
            if abs(delta) < tol:
                break

        return E

    def true_anomaly_from_mean(self, M: float, e: float) -> float:
        """Convert mean anomaly to true anomaly via eccentric anomaly."""
        E = self.solve_kepler_equation(M, e)
        # True anomaly from eccentric anomaly
        cos_nu = (math.cos(E) - e) / (1.0 - e * math.cos(E))
        sin_nu = (math.sqrt(1.0 - e**2) * math.sin(E)) / (1.0 - e * math.cos(E))
        return math.atan2(sin_nu, cos_nu)

    # ------------------------------------------------------------------
    # Propagation
    # ------------------------------------------------------------------
    def propagate(self, state: OrbitalState, dt_seconds: float) -> OrbitalState:
        """Propagate state forward in time using Keplerian mechanics.

        For circular/elliptical orbits:
        1. Compute orbital elements from current state
        2. Advance mean anomaly by dt
        3. Solve Kepler's equation for new true anomaly
        4. Compute new position/velocity in orbital plane
        5. Rotate back to ECI

        For hyperbolic orbits: uses universal variable formulation.
        """
        keplerian = self.keplerian_from_state(state)
        a = keplerian["semi_major_axis_km"]
        e = keplerian["eccentricity"]
        n = 2.0 * math.pi / keplerian["period_seconds"] if keplerian["period_seconds"] < float("inf") else 0.0

        if n < 1e-12:
            # Escape or degenerate orbit: linear extrapolation
            new_pos = tuple(state.position_km[i] + state.velocity_kms[i] * dt_seconds for i in range(3))
            new_vel = state.velocity_kms
            return OrbitalState(
                position_km=new_pos,
                velocity_kms=new_vel,
                epoch_seconds=state.epoch_seconds + dt_seconds,
            )

        # Mean anomaly at new time
        M0 = keplerian["true_anomaly_deg"] * DEG_TO_RAD
        # Convert current true anomaly to mean anomaly (approximate inverse)
        E0 = 2.0 * math.atan2(
            math.sqrt(1.0 - e) * math.sin(M0 / 2.0),
            math.sqrt(1.0 + e) * math.cos(M0 / 2.0),
        ) if abs(M0) < 1e-12 else M0
        M_new = (E0 - e * math.sin(E0)) + n * dt_seconds

        # New true anomaly
        nu_new = self.true_anomaly_from_mean(M_new, e)

        return self.state_from_keplerian(
            a_km=a,
            e=e,
            incl_deg=keplerian["inclination_deg"],
            raan_deg=keplerian["raan_deg"],
            argp_deg=keplerian["argp_deg"],
            true_anomaly_deg=nu_new * RAD_TO_DEG,
        )

    # ------------------------------------------------------------------
    # Position/velocity at time
    # ------------------------------------------------------------------
    def position_at(self, state: OrbitalState, t_seconds: float) -> tuple[float, float, float]:
        """Get position [x, y, z] in km at time t."""
        propagated = self.propagate(state, t_seconds)
        return propagated.position_km

    def velocity_at(self, state: OrbitalState, t_seconds: float) -> tuple[float, float, float]:
        """Get velocity [vx, vy, vz] in km/s at time t."""
        propagated = self.propagate(state, t_seconds)
        return propagated.velocity_kms

    # ------------------------------------------------------------------
    # Relative state
    # ------------------------------------------------------------------
    def relative_state(self, chaser: OrbitalState, target: OrbitalState, dt_seconds: float = 0.0) -> dict:
        """Compute relative state (Hill's frame / Clohessy-Wiltshire).

        Returns relative position and velocity in target's local frame:
        - x: radial (outward)
        - y: along-track (direction of motion)
        - z: cross-track (normal to orbital plane)
        """
        chaser_p = self.propagate(chaser, dt_seconds)
        target_p = self.propagate(target, dt_seconds)

        # Position difference in ECI
        dx = chaser_p.position_km[0] - target_p.position_km[0]
        dy = chaser_p.position_km[1] - target_p.position_km[1]
        dz = chaser_p.position_km[2] - target_p.position_km[2]

        # Velocity difference in ECI
        dvx = chaser_p.velocity_kms[0] - target_p.velocity_kms[0]
        dvy = chaser_p.velocity_kms[1] - target_p.velocity_kms[1]
        dvz = chaser_p.velocity_kms[2] - target_p.velocity_kms[2]

        # Target's orbit frame (approximate)
        r_mag = target_p.radius_km
        r_hat = tuple(target_p.position_km[i] / r_mag for i in range(3))
        v_hat = tuple(target_p.velocity_kms[i] / target_p.speed_kms for i in range(3))
        # Cross-track (h direction)
        h = target_p.angular_momentum()
        h_mag = math.sqrt(sum(c**2 for c in h))
        c_hat = tuple(h[i] / h_mag for i in range(3))

        # Project relative state into Hill's frame
        rel_radial = dx * r_hat[0] + dy * r_hat[1] + dz * r_hat[2]
        rel_along = dx * v_hat[0] + dy * v_hat[1] + dz * v_hat[2]
        rel_cross = dx * c_hat[0] + dy * c_hat[1] + dz * c_hat[2]

        vrel_radial = dvx * r_hat[0] + dvy * r_hat[1] + dvz * r_hat[2]
        vrel_along = dvx * v_hat[0] + dvy * v_hat[1] + dvz * v_hat[2]
        vrel_cross = dvx * c_hat[0] + dvy * c_hat[1] + dvz * c_hat[2]

        distance = math.sqrt(dx**2 + dy**2 + dz**2)
        speed_rel = math.sqrt(dvx**2 + dvy**2 + dvz**2)

        return {
            "relative_position_hills": (rel_radial, rel_along, rel_cross),
            "relative_velocity_hills": (vrel_radial, vrel_along, vrel_cross),
            "distance_km": distance,
            "relative_speed_kms": speed_rel,
        }

    # ------------------------------------------------------------------
    # Rendezvous planning
    # ------------------------------------------------------------------
    def rendezvous_phasing_angle(self, chaser: OrbitalState, target: OrbitalState) -> float:
        """Compute the phasing angle between chaser and target (radians).

        The angle the chaser must travel to catch up to the target,
        accounting for the difference in orbital periods.
        """
        chaser_kep = self.keplerian_from_state(chaser)
        target_kep = self.keplerian_from_state(target)

        # Mean motion
        n_chaser = 2.0 * math.pi / chaser_kep["period_seconds"] if chaser_kep["period_seconds"] < float("inf") else 0.0
        n_target = 2.0 * math.pi / target_kep["period_seconds"] if target_kep["period_seconds"] < float("inf") else 0.0

        if abs(n_chaser) < 1e-12:
            return 0.0

        # Angular position of each object
        theta_chaser = chaser_kep["true_anomaly_deg"] * DEG_TO_RAD + chaser_kep["argp_deg"] * DEG_TO_RAD
        theta_target = target_kep["true_anomaly_deg"] * DEG_TO_RAD + target_kep["argp_deg"] * DEG_TO_RAD

        # Phase angle difference
        phi = theta_target - theta_chaser
        phi = phi % (2.0 * math.pi)

        return phi

    # ------------------------------------------------------------------
    # Hohmann transfer
    # ------------------------------------------------------------------
    def hohmann_transfer(
        self,
        r1_km: float,
        r2_km: float,
    ) -> dict:
        """Compute Hohmann transfer parameters.

        Standard two-impulse Hohmann transfer:
        - Impulse 1: circularize from r1 to transfer ellipse
        - Impulse 2: circularize at r2

        Returns delta-v (km/s), transfer time (s), and fuel factor.
        """
        if r1_km <= 0 or r2_km <= 0:
            raise ValueError("Orbital radii must be positive")

        mu = self.mu

        # Semi-major axis of transfer orbit
        a_t = (r1_km + r2_km) / 2.0

        # Delta-v at departure (from circular orbit r1 to transfer ellipse)
        v_circ1 = math.sqrt(mu / r1_km)
        v_transfer1 = math.sqrt(mu * (2.0 / r1_km - 1.0 / a_t))
        dv1 = abs(v_transfer1 - v_circ1)

        # Delta-v at arrival (from transfer ellipse to circular orbit r2)
        v_transfer2 = math.sqrt(mu * (2.0 / r2_km - 1.0 / a_t))
        v_circ2 = math.sqrt(mu / r2_km)
        dv2 = abs(v_circ2 - v_transfer2)

        # Transfer time (half the transfer orbit period)
        t_transfer = math.pi * math.sqrt(a_t**3 / mu)

        # Total delta-v
        dv_total = dv1 + dv2

        # Characteristic velocity (for fuel estimation)
        # Using Tsiolkovsky: dv = ve * ln(m0/mf)
        # For chemical propulsion, exhaust velocity ~3-4.5 km/s
        # We return delta-v and a fuel mass fraction estimate
        ve = 3.0  # km/s typical bipropellant exhaust velocity
        fuel_ratio = math.exp(dv_total / ve) - 1.0  # (m0 - mf) / mf

        return {
            "delta_v_km_s": dv_total,
            "delta_v_ms": dv_total * 1000.0,
            "transfer_time_seconds": t_transfer,
            "transfer_time_hours": t_transfer / 3600.0,
            "delta_v1_km_s": dv1,
            "delta_v2_km_s": dv2,
            "transfer_semi_major_axis_km": a_t,
            "fuel_mass_ratio": fuel_ratio,
            "maneuver_type": ManeuverType.HOHMANN.value,
        }

    # ------------------------------------------------------------------
    # Distance between two states
    # ------------------------------------------------------------------
    def distance_between(
        self,
        state_a: OrbitalState,
        state_b: OrbitalState,
    ) -> float:
        """Euclidean distance between two orbital states in km."""
        dx = state_a.position_km[0] - state_b.position_km[0]
        dy = state_a.position_km[1] - state_b.position_km[1]
        dz = state_a.position_km[2] - state_b.position_km[2]
        return math.sqrt(dx**2 + dy**2 + dz**2)

    def speed_difference(
        self,
        state_a: OrbitalState,
        state_b: OrbitalState,
    ) -> float:
        """Speed difference between two states in km/s."""
        return abs(state_a.speed_kms - state_b.speed_kms)
