import { Mission, Satellite, Telemetry, Agent, Report } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const missionsAPI = {
  list: () => fetchJSON<Mission[]>('/missions'),
  get: (id: string) => fetchJSON<Mission>(`/missions/${id}`),
}

export const satellitesAPI = {
  list: () => fetchJSON<Satellite[]>('/satellites'),
  get: (id: string) => fetchJSON<Satellite>(`/satellites/${id}`),
}

export const telemetryAPI = {
  get: (objectId: string) => fetchJSON<Telemetry>(`/telemetry/${objectId}`),
}

export const agentsAPI = {
  list: () => fetchJSON<Agent[]>('/agents'),
}

export const reportsAPI = {
  list: () => fetchJSON<Report[]>('/reports'),
}
