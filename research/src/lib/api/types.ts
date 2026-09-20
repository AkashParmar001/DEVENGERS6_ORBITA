export interface Mission {
  id: string
  name: string
  target: string
  status: 'planning' | 'simulating' | 'active' | 'completed' | 'failed'
  progress: number
  risk: number
  xp: number
  created: string
  updated: string
  description?: string
  operator?: string
}

export interface Satellite {
  id: string
  name: string
  type: 'satellite' | 'debris' | 'spacecraft' | 'rocket-body' | 'robot'
  orbit: { altitude: number; inclination: number; eccentricity: number }
  position: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  health: number
  status: 'nominal' | 'warning' | 'critical'
}

export interface Telemetry {
  timestamp: string
  altitude: number
  velocity: number
  fuel: number
  battery: number
  temperature: number
  health: number
  signal: number
}

export interface SimulationState {
  id: string
  missionId: string
  status: 'idle' | 'running' | 'paused' | 'completed'
  speed: number
  elapsed: number
  trajectory: Array<{ t: number; x: number; y: number; z: number }>
  risk: number
  fuel: number
}

export interface RiskAssessment {
  id: string
  objectId: string
  probability: number
  missDistance: number
  timeToTCA: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  factors: Array<{ name: string; value: number }>
}

export interface Agent {
  id: string
  name: string
  role: string
  status: 'active' | 'idle' | 'waiting' | 'failed'
  lastAction?: string
}

export interface Report {
  id: string
  missionId: string
  title: string
  summary: string
  created: string
  risk: 'low' | 'medium' | 'high'
  result: 'success' | 'partial' | 'failure'
}
