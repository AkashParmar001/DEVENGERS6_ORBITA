import { Mission, Satellite, Agent, Report } from '../api/types'

export const MOCK_MISSIONS: Mission[] = [
  { id: 'MSN-001', name: 'SAT-102 Solar Panel Inspection', target: 'SAT-102', status: 'completed', progress: 100, risk: 0.02, xp: 245, created: '2026-09-10T08:00:00Z', updated: '2026-09-15T14:32:00Z', operator: 'L2 Operator' },
  { id: 'MSN-002', name: 'Debris Avoidance CR-7', target: 'DEB-1092', status: 'simulating', progress: 68, risk: 0.15, xp: 120, created: '2026-09-18T10:00:00Z', updated: '2026-09-20T09:15:00Z', operator: 'L2 Operator' },
  { id: 'MSN-003', name: 'LEO Constellation Mapping', target: 'LEO-FIELD-42', status: 'planning', progress: 12, risk: 0.08, xp: 0, created: '2026-09-20T12:00:00Z', updated: '2026-09-20T12:00:00Z', operator: 'L2 Operator' },
  { id: 'MSN-004', name: 'ISS Docking Port Assessment', target: 'ISS-ZARYA', status: 'completed', progress: 100, risk: 0.01, xp: 312, created: '2026-09-05T06:00:00Z', updated: '2026-09-12T16:45:00Z', operator: 'L1 Operator' },
  { id: 'MSN-005', name: 'GEO Station Refuel Mission', target: 'SAT-441', status: 'planning', progress: 0, risk: 0.04, xp: 0, created: '2026-09-20T14:00:00Z', updated: '2026-09-20T14:00:00Z', operator: 'L2 Operator' },
]

export const MOCK_SATELLITES: Satellite[] = [
  { id: 'SAT-102', name: 'COMM-SAT-102', type: 'satellite', orbit: { altitude: 548, inclination: 51.6, eccentricity: 0.001 }, position: { x: 3200, y: 1800, z: 4100 }, velocity: { x: -2.1, y: 0.3, z: 5.8 }, health: 98.7, status: 'nominal' },
  { id: 'SAT-441', name: 'OBS-SAT-441', type: 'satellite', orbit: { altitude: 35786, inclination: 0.1, eccentricity: 0.0002 }, position: { x: 28000, y: 1200, z: 18000 }, velocity: { x: 0.4, y: 0.1, z: 3.1 }, health: 94.2, status: 'nominal' },
  { id: 'DEB-1092', name: 'DEBRIS-1092', type: 'debris', orbit: { altitude: 548, inclination: 51.6, eccentricity: 0.02 }, position: { x: 3150, y: 1850, z: 4050 }, velocity: { x: -1.9, y: 0.5, z: 5.7 }, health: 0, status: 'warning' },
  { id: 'ISS-ZARYA', name: 'ISS ZARYA', type: 'spacecraft', orbit: { altitude: 420, inclination: 51.6, eccentricity: 0.0005 }, position: { x: 2900, y: 1600, z: 3800 }, velocity: { x: -2.4, y: 0.2, z: 6.1 }, health: 99.1, status: 'nominal' },
  { id: 'ROB-03', name: 'ORBITAL-03', type: 'robot', orbit: { altitude: 548, inclination: 51.6, eccentricity: 0.001 }, position: { x: 3180, y: 1820, z: 4080 }, velocity: { x: -2.0, y: 0.4, z: 5.9 }, health: 97.5, status: 'nominal' },
]

export const MOCK_AGENTS: Agent[] = [
  { id: 'AGT-001', name: 'Mission Planner', role: 'OBJECTIVE ANALYSIS', status: 'active', lastAction: 'Generated mission plan for MSN-002' },
  { id: 'AGT-002', name: 'Trajectory Agent', role: 'ORBITAL MECHANICS', status: 'active', lastAction: 'Computed approach trajectory' },
  { id: 'AGT-003', name: 'Risk Agent', role: 'HAZARD ASSESSMENT', status: 'idle', lastAction: 'Cleared MSN-001 risk assessment' },
  { id: 'AGT-004', name: 'Anomaly Agent', role: 'ANOMALY DETECTION', status: 'waiting', lastAction: 'Monitoring DEB-1092 conjunction' },
  { id: 'AGT-005', name: 'Recovery Agent', role: 'RECOVERY PLANNING', status: 'idle', lastAction: 'No active recovery missions' },
  { id: 'AGT-006', name: 'Report Agent', role: 'DOCUMENTATION', status: 'active', lastAction: 'Generating MSN-001 final report' },
]

export const MOCK_REPORTS: Report[] = [
  { id: 'RPT-001', missionId: 'MSN-001', title: 'SAT-102 Inspection Report', summary: 'Solar panel array integrity confirmed. Minor thermal degradation on Panel 3B. All subsystems nominal.', created: '2026-09-15T14:32:00Z', risk: 'low', result: 'success' },
  { id: 'RPT-002', missionId: 'MSN-004', title: 'ISS Docking Assessment', summary: 'Docking port mechanism operational. Berthing adapter alignment within tolerance. Recommended maintenance cycle: 90 days.', created: '2026-09-12T16:45:00Z', risk: 'low', result: 'success' },
]

export const AGENT_GRAPH = {
  nodes: ['OBJECTIVE', 'MISSION PLANNER', 'TRAJECTORY AGENT', 'RISK AGENT', 'SIMULATION', 'RECOVERY AGENT', 'REPORT AGENT'],
  edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
}
