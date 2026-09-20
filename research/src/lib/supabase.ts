// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Typed helpers for ORBITA tables
export type MissionStatus = 'planned' | 'running' | 'completed' | 'failed' | 'cancelled'
export type TaskStatus = 'pending' | 'active' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  owner_id?: string
  created_at: string
  updated_at: string
}

export interface Scenario {
  id: string
  name: string
  project_id: string
  seed: number
  created_at: string
  updated_at: string
  project?: Project
}

export interface Mission {
  id: string
  project_id: string
  scenario_id: string
  objective: string
  target_id?: string
  status: MissionStatus
  created_at: string
  updated_at: string
  project?: Project
  scenario?: Scenario
  tasks?: MissionTask[]
  risk_assessments?: RiskAssessment[]
}

export interface MissionTask {
  id: string
  mission_id: string
  type: string
  description?: string
  parameters: Record<string, unknown>
  sequence: number
  status: TaskStatus
  created_at: string
}

export interface RiskAssessment {
  id: string
  mission_id: string
  risk_factors: Record<string, unknown>
  confidence: number
  assumptions: unknown[]
  explanation: string
  timestamp: string
}
