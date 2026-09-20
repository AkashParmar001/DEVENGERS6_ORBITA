import useSWR from 'swr'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// ---------------------------------------------------------------------------
// Types matching the NestJS backend DTOs
// ---------------------------------------------------------------------------

export interface OrbitalState {
  id: string
  space_object_id: string
  timestamp: string
  altitude_km: number
  inclination_deg: number
  eccentricity: number
  position_x_km: number
  position_y_km: number
  position_z_km: number
  velocity_x_kms: number
  velocity_y_kms: number
  velocity_z_kms: number
}

export interface SpaceObject {
  id: string
  name: string
  object_type: string
  status: string
  orbit_type: string
}

export interface Satellite {
  id: string
  space_object_id: string
  norad_id: string
  satellite_type: string
  intl_code: string
  space_objects: SpaceObject
}

export interface Robot {
  id: string
  space_object_id: string
  robot_type: string
  manufacturer: string
  autonomy_level: number
  space_objects: SpaceObject
}

export interface Mission {
  id: string
  name: string
  objective: string
  status: string
  priority: number
  target_id: string | null
  robot_id: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface MissionEvent {
  id: string
  mission_id: string
  event_type: string
  severity: string
  title: string
  metadata: Record<string, unknown>
  timestamp: string
}

export interface TelemetryRecord {
  id: string
  space_object_id: string
  timestamp: string
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SingleResponse<T> {
  data: T
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error?.error?.message || error?.message || `HTTP ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

// --- Missions ---
export const useMissions = (params?: { status?: string; limit?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  const url = `${API_BASE}/missions${qs ? `?${qs}` : ''}`
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Mission>>(url, fetcher)
  return { missions: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, isError: error, mutate }
}

export const useMission = (id: string | null) => {
  const url = id ? `${API_BASE}/missions/${id}` : null
  const { data, error, isLoading } = useSWR<SingleResponse<Mission>>(url, fetcher)
  return { mission: data?.data ?? null, isLoading, isError: error }
}

export const useMissionEvents = (missionId: string | null) => {
  const url = missionId ? `${API_BASE}/missions/${missionId}/events` : null
  const { data, error, isLoading } = useSWR<SingleResponse<MissionEvent[]>>(url, fetcher)
  return { events: data?.data ?? [], isLoading, isError: error }
}

// --- Satellites ---
export const useSatellites = (params?: { limit?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  const url = `${API_BASE}/satellites${qs ? `?${qs}` : ''}`
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Satellite>>(url, fetcher)
  return { satellites: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, isError: error, mutate }
}

export const useSatellite = (id: string | null) => {
  const url = id ? `${API_BASE}/satellites/${id}` : null
  const { data, error, isLoading } = useSWR<SingleResponse<Satellite>>(url, fetcher)
  return { satellite: data?.data ?? null, isLoading, isError: error }
}

// --- Robots ---
export const useRobots = (params?: { limit?: number }) => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  const url = `${API_BASE}/robots${qs ? `?${qs}` : ''}`
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Robot>>(url, fetcher)
  return { robots: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, isError: error, mutate }
}

// --- Orbital States ---
export const useOrbitalStates = (spaceObjectId: string | null) => {
  const url = spaceObjectId ? `${API_BASE}/orbital-states/${spaceObjectId}` : null
  const { data, error, isLoading } = useSWR<SingleResponse<OrbitalState[]>>(url, fetcher)
  return { states: data?.data ?? [], latest: data?.data?.[0] ?? null, isLoading, isError: error }
}

// --- Telemetry ---
export const useTelemetry = (spaceObjectId: string | null, limit: number = 50) => {
  const url = spaceObjectId ? `${API_BASE}/telemetry/${spaceObjectId}?limit=${limit}` : null
  const { data, error, isLoading } = useSWR<SingleResponse<TelemetryRecord[]>>(url, fetcher)
  return { telemetry: data?.data ?? [], isLoading, isError: error }
}

// --- Health ---
export const useBackendHealth = () => {
  const { data, error, isLoading } = useSWR<{ data: { status: string; uptime: number } }>(
    `${API_BASE}/health`,
    fetcher,
    { refreshInterval: 10000 },
  )
  return { health: data?.data ?? null, isLoading, isError: error }
}

// --- Intelligence ---
export const useIntelligenceHealth = () => {
  const { data, error, isLoading } = useSWR<{ data: { status: string } }>(
    `${API_BASE}/intelligence/health`,
    fetcher,
    { refreshInterval: 30000 },
  )
  return { intelligence: data?.data ?? null, isLoading, isError: error }
}

// ---------------------------------------------------------------------------
// Mutations (non-SWR)
// ---------------------------------------------------------------------------

export const createMission = async (payload: {
  name: string
  objective: string
  target_id?: string
  robot_id?: string
  priority?: number
}) => {
  const res = await fetch(`${API_BASE}/missions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create mission')
  return res.json() as Promise<SingleResponse<Mission>>
}

export const transitionMission = async (id: string, action: string) => {
  const res = await fetch(`${API_BASE}/missions/${id}/${action}`, { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to ${action} mission`)
  return res.json() as Promise<SingleResponse<Mission>>
}

export const calculateTrajectory = async (payload: {
  robot_state: { position_km: number[]; velocity_kms: number[] }
  target_state: { position_km: number[]; velocity_kms: number[] }
  max_delta_v_ms?: number
}) => {
  const res = await fetch(`${API_BASE}/intelligence/trajectory/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to calculate trajectory')
  return res.json()
}

export const assessCollisionRisk = async (payload: {
  object_a: { position_km: number[]; velocity_kms: number[] }
  object_b: { position_km: number[]; velocity_kms: number[] }
  time_horizon_seconds?: number
}) => {
  const res = await fetch(`${API_BASE}/intelligence/risk/collision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to assess collision risk')
  return res.json()
}

export const runSimulation = async (payload: {
  mission_id: string
  robot_state: { position_km: number[]; velocity_kms: number[] }
  target_state: { position_km: number[]; velocity_kms: number[] }
  duration_seconds: number
  time_step_seconds?: number
}) => {
  const res = await fetch(`${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to run simulation')
  return res.json()
}
