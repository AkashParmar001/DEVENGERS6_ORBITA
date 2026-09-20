export interface MissionPlan {
  mission_name: string;
  objective: string;
  mission_type: string;
  target_identifier: string;
  robot_identifier: string;
  actions: MissionAction[];
  constraints: MissionConstraints;
  risk_tolerance: string;
  estimated_duration_seconds: number;
  estimated_delta_v_ms: number;
}

export interface MissionAction {
  step: number;
  action: string;
  tool: string;
  parameters: Record<string, unknown>;
  description: string;
}

export interface MissionConstraints {
  max_delta_v_ms: number;
  max_duration_seconds: number;
  min_safe_distance_km: number;
  max_collision_probability: number;
}
