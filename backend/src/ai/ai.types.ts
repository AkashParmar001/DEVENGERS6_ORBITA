export interface MissionPlanResponse {
  mission_name: string;
  objective: string;
  mission_type: string;
  target_identifier: string;
  robot_identifier: string;
  tasks: MissionTask[];
  constraints: MissionConstraints;
  required_validation: string[];
  success_conditions: string[];
  risk_flags: string[];
  assumptions: string[];
  uncertainty: string[];
}

export interface MissionTask {
  id: string;
  type: string;
  description: string;
  dependencies: string[];
  estimated_duration_seconds: number;
  tools_required: string[];
}

export interface MissionConstraints {
  max_delta_v_ms: number;
  max_duration_seconds: number;
  min_safe_distance_km: number;
  max_collision_probability: number;
}

export interface AnomalyInput {
  object_id: string;
  object_name: string;
  telemetry: Record<string, unknown>;
  anomaly: {
    type: string;
    severity: string;
    detected_at: string;
    description: string;
    affected_systems: string[];
  };
}

export interface AnomalyAnalysis {
  summary: string;
  possible_causes: string[];
  evidence: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_investigations: string[];
  required_human_review: boolean;
  confidence: number;
}

export interface RiskInput {
  mission_id: string;
  risk_metrics: {
    probability: number;
    minimum_distance_km: number;
    risk_level: string;
    time_horizon_seconds: number;
  };
  context: {
    mission_name: string;
    target_name: string;
    robot_name: string;
  };
}

export interface RiskExplanation {
  summary: string;
  factors: string[];
  recommendations: string[];
  severity_assessment: string;
  human_review_required: boolean;
}

export interface ReportInput {
  mission_id: string;
  mission_name: string;
  objective: string;
  status: string;
  plan: unknown;
  trajectory: unknown;
  risk_assessment: unknown;
  simulation_result: unknown;
  anomalies: unknown[];
}

export interface MissionReport {
  title: string;
  executive_summary: string;
  factual_observations: string[];
  calculated_results: string[];
  ai_interpretation: string[];
  unresolved_uncertainties: string[];
  recommendations: string[];
}

export interface AIRunLog {
  mission_id?: string;
  provider: string;
  model: string;
  task_type: string;
  input_hash: string;
  status: 'success' | 'error' | 'timeout' | 'validation_failed';
  latency_ms: number;
  error?: string;
  created_at: string;
}
