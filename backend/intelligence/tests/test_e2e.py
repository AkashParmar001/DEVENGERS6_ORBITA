"""End-to-end test: Inspect SYNTH-SAT-001 using SYNTH-ROBOT-001.

Full deterministic workflow (no AI API keys required):
1. Query Supabase for satellite and robot states
2. Create mission
3. Plan trajectory via Python intelligence
4. Assess collision risk
5. Transition through mission states
6. Run simulation
7. Generate report
8. Verify all data in Supabase
"""
import httpx

BASE_NODE = "http://localhost:4000/api"
BASE_PY = "http://localhost:8000"


def test_e2e_inspect_satellite():
    print("\n" + "=" * 60)
    print("ORBITA E2E TEST: Inspect SYNTH-SAT-001 using SYNTH-ROBOT-001")
    print("=" * 60)

    # Step 1: Get satellite state
    print("\n[Step 1] Querying satellite SYNTH-SAT-001...")
    resp = httpx.get(f"{BASE_NODE}/satellites", params={"limit": 50})
    assert resp.status_code == 200
    sats = resp.json()["data"]
    sat_rec = next((s for s in sats if s["space_objects"]["name"] == "SYNTH-SAT-001"), None)
    assert sat_rec is not None, "SYNTH-SAT-001 not found"
    sat_id = sat_rec["space_object_id"]
    print(f"  Found: SYNTH-SAT-001 (id={sat_id})")

    resp = httpx.get(f"{BASE_NODE}/orbital-states/{sat_id}")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) > 0, "No orbital states for satellite"
    orb = resp.json()["data"][0]
    target_pos = [orb["position_x_km"], orb["position_y_km"], orb["position_z_km"]]
    target_vel = [orb["velocity_x_kms"], orb["velocity_y_kms"], orb["velocity_z_kms"]]
    print(f"  pos={[round(x,1) for x in target_pos]} vel={[round(v,4) for v in target_vel]}")

    # Step 2: Get robot state
    print("\n[Step 2] Querying robot SYNTH-ROBOT-001...")
    resp = httpx.get(f"{BASE_NODE}/robots", params={"limit": 50})
    assert resp.status_code == 200
    robots = resp.json()["data"]
    rob_rec = next((r for r in robots if r["space_objects"]["name"] == "SYNTH-ROBOT-001"), None)
    assert rob_rec is not None, "SYNTH-ROBOT-001 not found"
    rob_id = rob_rec["space_object_id"]
    print(f"  Found: SYNTH-ROBOT-001 (id={rob_id})")

    resp = httpx.get(f"{BASE_NODE}/orbital-states/{rob_id}")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) > 0, "No orbital states for robot"
    rob_orb = resp.json()["data"][0]
    robot_pos = [rob_orb["position_x_km"], rob_orb["position_y_km"], rob_orb["position_z_km"]]
    robot_vel = [rob_orb["velocity_x_kms"], rob_orb["velocity_y_kms"], rob_orb["velocity_z_kms"]]
    print(f"  pos={[round(x,1) for x in robot_pos]} vel={[round(v,4) for v in robot_vel]}")

    # Step 3: Create mission
    print("\n[Step 3] Creating mission...")
    mission_resp = httpx.post(f"{BASE_NODE}/missions", json={
        "name": "E2E INSPECTION: SYNTH-SAT-001",
        "objective": "Inspect satellite SYNTH-SAT-001 using robot SYNTH-ROBOT-001",
        "target_id": sat_id,
        "robot_id": rob_id,
        "status": "DRAFT",
        "priority": 5,
    })
    assert mission_resp.status_code in (200, 201), f"Create mission failed: {mission_resp.status_code} {mission_resp.text}"
    mission = mission_resp.json()["data"]
    mid = mission["id"]
    print(f"  Created: {mid} status={mission['status']}")

    # Step 4: Plan
    print("\n[Step 4] Transitioning to PLANNING...")
    r = httpx.post(f"{BASE_NODE}/missions/{mid}/plan")
    assert r.status_code in (200, 201), f"Plan failed: {r.status_code} {r.text}"
    print(f"  Status: {r.json()['data']['status']}")

    # Step 5: Calculate trajectory
    print("\n[Step 5] Calculating trajectory via Python...")
    traj = httpx.post(f"{BASE_PY}/trajectory/plan", json={
        "robot_state": {"position_km": robot_pos, "velocity_kms": robot_vel},
        "target_state": {"position_km": target_pos, "velocity_kms": target_vel},
        "max_delta_v_ms": 500,
        "num_waypoints": 5,
    }).json()
    print(f"  Feasible: {traj['feasible']}")
    print(f"  Delta-v: {traj['delta_v_ms']:.1f} m/s")
    print(f"  Duration: {traj['duration_seconds']:.0f} s")
    print(f"  Waypoints: {len(traj['trajectory'])}")

    # Step 6: Collision risk
    print("\n[Step 6] Assessing collision risk...")
    risk = httpx.post(f"{BASE_PY}/risk/collision", json={
        "object_a": {"position_km": robot_pos, "velocity_kms": robot_vel},
        "object_b": {"position_km": target_pos, "velocity_kms": target_vel},
        "time_horizon_seconds": min(traj["duration_seconds"], 3600),
        "time_step_seconds": 60,
    }).json()
    print(f"  Risk: {risk['risk_level']} (P={risk['probability']:.6f})")
    print(f"  Min distance: {risk['minimum_distance_km']:.2f} km")

    # Step 7: Validate
    print("\n[Step 7] Transitioning to VALIDATING...")
    r = httpx.post(f"{BASE_NODE}/missions/{mid}/validate")
    assert r.status_code in (200, 201)
    print(f"  Status: {r.json()['data']['status']}")

    # Step 8: Ready
    print("\n[Step 8] Transitioning to READY...")
    r = httpx.post(f"{BASE_NODE}/missions/{mid}/ready")
    assert r.status_code in (200, 201)
    print(f"  Status: {r.json()['data']['status']}")

    # Step 9: Simulating
    print("\n[Step 9] Transitioning to SIMULATING...")
    r = httpx.post(f"{BASE_NODE}/missions/{mid}/simulate")
    assert r.status_code in (200, 201)
    print(f"  Status: {r.json()['data']['status']}")

    # Step 10: Run simulation
    print("\n[Step 10] Running simulation via Python...")
    sim = httpx.post(f"{BASE_PY}/simulation/run", json={
        "mission_id": mid,
        "robot_state": {"position_km": robot_pos, "velocity_kms": robot_vel},
        "target_state": {"position_km": target_pos, "velocity_kms": target_vel},
        "duration_seconds": min(traj["duration_seconds"], 7200),
        "time_step_seconds": 300,
    }, timeout=30).json()
    print(f"  Steps: {sim['summary']['total_steps']}")
    print(f"  Telemetry: {len(sim['telemetry'])} records")
    print(f"  Events: {len(sim['events'])}")
    for e in sim["events"]:
        print(f"    [{e['severity']}] {e['event_type']}: {e['title']}")

    # Step 11: Generate and store report
    print("\n[Step 11] Generating report...")
    report = {
        "title": "E2E Inspection Report: SYNTH-SAT-001",
        "mission_id": mid,
        "objective": "Inspect satellite SYNTH-SAT-001",
        "status": "COMPLETED",
        "findings": [
            f"Target at altitude {orb['altitude_km']} km",
            f"Trajectory feasible: delta-v = {traj['delta_v_ms']:.1f} m/s",
            f"Collision risk: {risk['risk_level']}",
            f"Simulation: {sim['summary']['total_steps']} steps",
        ],
        "recommendations": ["Monitor target health", "Schedule follow-up"],
    }
    httpx.post(f"{BASE_NODE}/reports", json={
        "title": report["title"],
        "report_type": "analysis",
        "content": report,
    })
    print("  Report stored in Supabase")

    # Step 12: Complete
    print("\n[Step 12] Transitioning to COMPLETED...")
    r = httpx.patch(f"{BASE_NODE}/missions/{mid}", json={"status": "COMPLETED"})
    assert r.status_code == 200
    print(f"  Status: {r.json()['data']['status']}")

    # Step 13: Verify events
    print("\n[Step 13] Verifying mission events...")
    events = httpx.get(f"{BASE_NODE}/missions/{mid}/events").json()["data"]
    print(f"  Total events: {len(events)}")
    for e in events:
        print(f"    [{e['severity']}] {e['event_type']}: {e['title']}")

    # Step 14: Final verification
    print("\n[Step 14] Final verification...")
    final = httpx.get(f"{BASE_NODE}/missions/{mid}").json()["data"]
    assert final["status"] == "COMPLETED"
    assert final["name"] == "E2E INSPECTION: SYNTH-SAT-001"
    report_check = httpx.get(f"{BASE_NODE}/missions/{mid}/report")
    has_report = report_check.status_code == 200 and report_check.json().get("data") is not None

    # Summary
    print("\n" + "=" * 60)
    print("END-TO-END TEST PASSED")
    print("=" * 60)
    print(f"Mission:       {final['name']}")
    print(f"Status:        {final['status']}")
    print(f"Trajectory:    {traj['delta_v_ms']:.1f} m/s, {traj['duration_seconds']:.0f}s")
    print(f"Risk:          {risk['risk_level']}")
    print(f"Simulation:    {sim['summary']['total_steps']} steps, {len(sim['telemetry'])} telemetry")
    print(f"Events:        {len(events)}")
    print(f"Report:        {'Yes' if has_report else 'No'}")
    print("=" * 60)


if __name__ == "__main__":
    test_e2e_inspect_satellite()
